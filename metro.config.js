const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add custom transformer to suppress SafeAreaView warnings
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      ...config.transformer.getTransformOptions.transform,
      experimentalImportSupport: false,
    },
  }),
};

module.exports = withNativeWind(config, { input: "./global.css" });