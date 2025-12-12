// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRandomiserCallbackV3 {
    /// @notice Receive random words from a randomiser.
    /// @dev Ensure that proper access control is enforced on this function;
    ///     only the designated randomiser may call this function and the
    ///     requestId should be as expected from the randomness request.
    /// @param requestId The identifier for the original randomness request
    /// @param randomWord Uniform random number in the range [0, 2**256)
    function receiveRandomness(uint256 requestId, uint256 randomWord) external;
}

interface IAnyrand {
    /// @notice State of a request
    enum RequestState {
        /// @notice The request does not exist
        Nonexistent,
        /// @notice A request has been made, waiting for fulfilment
        Pending,
        /// @notice The request has been fulfilled successfully
        Fulfilled,
        /// @notice The request was fulfilled, but the callback failed
        Failed
    }

    /// @notice Compute the total request price
    /// @param callbackGasLimit The callback gas limit that will be used for
    ///     the randomness request
    function getRequestPrice(
        uint256 callbackGasLimit
    ) external view returns (uint256 totalPrice, uint256 effectiveFeePerGas);

    /// @notice Request randomness
    /// @param deadline Timestamp of when the randomness should be fulfilled. A
    ///     beacon round closest to this timestamp (rounding up to the nearest
    ///     future round) will be used as the round from which to derive
    ///     randomness.
    /// @param callbackGasLimit Gas limit for callback
    function requestRandomness(
        uint256 deadline,
        uint256 callbackGasLimit
    ) external payable returns (uint256);

    /// @notice Get the state of a request
    /// @param requestId The request identifier
    function getRequestState(
        uint256 requestId
    ) external view returns (RequestState);
}

contract GlucoseWarsAchievements is ERC721, Ownable, IRandomiserCallbackV3 {
  // Anyrand VRF Configuration for Scroll
  address private immutable anyrandContract;
  uint256 private constant CALLBACK_GAS_LIMIT = 750000; // Max 750k gas allowed
  uint256 private constant MAX_DEADLINE_DELTA = 30; // 30 seconds max deadline

  // Token counter for new NFTs
  uint256 private _tokenIdCounter;

  // Privacy and Achievement mappings
  mapping(address => mapping(string => uint256[])) public playerAchievementsByCategory; // player -> privacyMode -> achievements
  mapping(uint256 => string) public achievementURIs;
  mapping(uint256 => uint256) public achievementRandomness; // Random value for fair events
  mapping(uint256 => bool) public achievementVerified; // Whether achievement passed fairness verification

  // Privacy settings for each achievement
  mapping(uint256 => string) public achievementPrivacy; // 'public' | 'private' | 'healthcare_only'

  // Stats tracking
  mapping(address => uint256) public totalPlayerAchievements;
  mapping(address => uint256) public privateAchievementsCount;
  mapping(address => uint256) public publicAchievementsCount;

  // Track randomness requests
  mapping(uint256 => uint256) public requestToTokenId; // Map Anyrand request ID to NFT tokenId
  mapping(address => uint256[]) public playerPendingRequests; // Track pending requests per player

  event AchievementMinted(address indexed player, uint256 indexed tokenId, uint256 achievementId);
  event AchievementPrivacyUpdated(uint256 indexed tokenId, string newPrivacy);
  event RandomnessReceived(uint256 indexed tokenId, uint256 randomness);
  event FairnessVerified(uint256 indexed tokenId, uint256 randomness);
  event RandomnessRequested(uint256 indexed requestId, uint256 indexed tokenId, address indexed player);

  constructor(address _anyrandContract) 
    ERC721("Glucose Wars Achievements", "GWA")
  {
    anyrandContract = _anyrandContract;
  }

  /**
   * Main function to mint privacy-controlled achievements
   * Can be called with or without VRF verification
   */
  function mintAchievement(
    address player,
    uint256 achievementId,
    string memory tokenURI,
    string memory privacyMode // 'public' | 'private' | 'healthcare_only'
  ) external onlyOwner returns (uint256) {
    uint256 tokenId = _tokenIdCounter++;
    _safeMint(player, tokenId);
    achievementURIs[tokenId] = tokenURI;
    achievementPrivacy[tokenId] = privacyMode;
    
    // Add to appropriate privacy category
    playerAchievementsByCategory[player][privacyMode].push(tokenId);

    // Update stats
    totalPlayerAchievements[player]++;
    if (keccak256(bytes(privacyMode)) == keccak256("private")) {
      privateAchievementsCount[player]++;
    } else {
      publicAchievementsCount[player]++;
    }

    emit AchievementMinted(player, tokenId, achievementId);
    return tokenId;
  }

  /**
   * Mint achievement with Anyrand VRF verification for fair events
   * Use this for plot twist victories, rare events, etc.
   */
  function mintFairAchievement(
    address player,
    uint256 achievementId,
    string memory tokenURI,
    string memory privacyMode
  ) external onlyOwner returns (uint256) {
    // First mint the achievement NFT with placeholder status
    uint256 tokenId = _tokenIdCounter++;
    _safeMint(player, tokenId);
    achievementURIs[tokenId] = tokenURI;
    achievementPrivacy[tokenId] = privacyMode;
    achievementVerified[tokenId] = false; // Awaiting randomness
    
    // Add to appropriate privacy category
    playerAchievementsByCategory[player][privacyMode].push(tokenId);

    // Update stats
    totalPlayerAchievements[player]++;
    if (keccak256(bytes(privacyMode)) == keccak256("private")) {
      privateAchievementsCount[player]++;
    } else {
      publicAchievementsCount[player]++;
    }

    // Calculate the deadline (timestamp when randomness should be fulfilled)
    uint256 deadline = block.timestamp + MAX_DEADLINE_DELTA;

    // Get the price for the request
    (uint256 requestPrice, ) = IAnyrand(anyrandContract).getRequestPrice(CALLBACK_GAS_LIMIT);

    // Request randomness from Anyrand
    uint256 requestId = IAnyrand(anyrandContract).requestRandomness{value: requestPrice}(
      deadline,
      CALLBACK_GAS_LIMIT
    );

    // Map the request ID to our achievement token ID
    requestToTokenId[requestId] = tokenId;

    // Track pending requests for this player
    playerPendingRequests[player].push(requestId);

    emit AchievementMinted(player, tokenId, achievementId);
    emit RandomnessRequested(requestId, tokenId, player);
    
    return requestId;
  }

  /**
   * Receive randomness from Anyrand VRF (implementing IRandomiserCallbackV3 interface)
   */
  function receiveRandomness(uint256 requestId, uint256 randomWord) external override {
    require(msg.sender == anyrandContract, "Only Anyrand can call this function");
    
    // Get the associated token ID for this request
    uint256 tokenId = requestToTokenId[requestId];
    require(tokenId != 0, "Invalid request ID"); // Note: Token IDs start from 1, so 0 means invalid
    
    // Associate the randomness with the achievement
    achievementRandomness[tokenId] = randomWord;
    achievementVerified[tokenId] = true;

    emit RandomnessReceived(tokenId, randomWord);
    emit FairnessVerified(tokenId, randomWord);
  }

  /**
   * Update privacy setting for an achievement
   */
  function updateAchievementPrivacy(uint256 tokenId, string memory newPrivacy) external {
    require(ownerOf(tokenId) == msg.sender, "Not token owner");
    
    achievementPrivacy[tokenId] = newPrivacy;
    emit AchievementPrivacyUpdated(tokenId, newPrivacy);
  }

  /**
   * Get achievements by privacy mode for a player
   */
  function getPlayerAchievements(
    address player,
    string memory privacyMode
  ) external view returns (uint256[] memory) {
    return playerAchievementsByCategory[player][privacyMode];
  }

  /**
   * Get all player achievements with privacy filtering
   */
  function getPlayerAchievementsWithPrivacy(
    address player,
    string memory privacyMode
  ) external view returns (uint256[] memory, string[] memory) {
    uint256[] memory tokenIds = playerAchievementsByCategory[player][privacyMode];
    string[] memory uris = new string[](tokenIds.length);
    
    for (uint256 i = 0; i < tokenIds.length; i++) {
      uris[i] = achievementURIs[tokenIds[i]];
    }
    
    return (tokenIds, uris);
  }

  /**
   * Get public achievements for display to other players
   */
  function getPublicAchievements(address player) external view returns (uint256[] memory) {
    return playerAchievementsByCategory[player]["public"];
  }

  /**
   * Get pending requests for a player
   */
  function getPlayerPendingRequests(address player) external view returns (uint256[] memory) {
    return playerPendingRequests[player];
  }

  /**
   * Get state of a randomness request
   */
  function getRequestState(uint256 requestId) external view returns (IAnyrand.RequestState) {
    return IAnyrand(anyrandContract).getRequestState(requestId);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override
    returns (string memory)
  {
    return achievementURIs[tokenId];
  }

  /**
   * Check if an achievement has passed fairness verification
   */
  function isAchievementVerified(uint256 tokenId) external view returns (bool) {
    return achievementVerified[tokenId];
  }

  /**
   * Get randomness value for an achievement
   */
  function getAchievementRandomness(uint256 tokenId) external view returns (uint256) {
    return achievementRandomness[tokenId];
  }
}