import { PathNode } from '@/types/game';

const DX = 1730;
const DY = 1500;
const MAX_PATH = 8;

export class HexPath {
  private center: { x: number; y: number };
  private radius: number;
  public nodes: PathNode[];

  constructor(width: number, height: number) {
    const f = Math.floor((height * 25) / DY);
    this.center = {
      x: (Math.floor((width * 25) / DX) + ((f % 2) + 0.5) / 2) * DX * 2,
      y: f * DY * 2,
    };
    this.radius = Math.min(
      this.center.x,
      this.center.y,
      width * 100 - this.center.x,
      height * 100 - this.center.y
    );

    this.nodes = [[0, this.center.x, this.center.y, true] as any];
  }

  private half(direction: number, x: number, y: number): [number, number] {
    const i = direction % 3;
    const j = 1 - Math.floor(direction / 3) * 2;
    
    if (i) {
      x += (1.5 - i) * j * DX;
      y += j * DY;
    } else {
      x += j * DX;
    }

    return [x, y];
  }

  extend(): boolean {
    const [direction, , , isActive] = this.nodes[0];
    const [px, py] = this.half(direction, this.nodes[0].x, this.nodes[0].y);

    const candidates = [0, 1, 2, 3, 4, 5]
      .map((i) => {
        const [nx, ny] = this.half(i, px, py);
        return { direction: i, x: nx, y: ny };
      })
      .filter((candidate) => {
        return (
          candidate.direction !== (direction + 3) % 6 &&
          Math.hypot(candidate.x - this.center.x, candidate.y - this.center.y) < this.radius &&
          this.nodes.every((node) => node.x !== candidate.x || node.y !== candidate.y)
        );
      });

    if (candidates.length === 0) return false;

    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    this.nodes.unshift({
      direction: selected.direction,
      x: selected.x,
      y: selected.y,
      isActive: !isActive,
    });

    if (this.nodes.length > MAX_PATH) {
      this.nodes.pop();
    }

    return true;
  }

  getPathData(): string {
    if (this.nodes.length < 2) return '';

    const nodes = [...this.nodes];
    let current = nodes.pop()!;
    const [x, y] = this.half(current.direction, current.x, current.y);
    let d = `M${current.x / 100},${current.y / 100}Q${x / 100},${y / 100} `;

    current = nodes.pop()!;
    d += `${current.x / 100},${current.y / 100}`;
    
    while (nodes.length) {
      current = nodes.pop()!;
      d += `T${current.x / 100},${current.y / 100}`;
    }

    return d;
  }

  getSegments(): { enter: string; stay: string; exit: string } {
    const pathSegment = (start: number, end: number) => {
      const segment = this.nodes.slice(start, end);
      if (segment.length < 2) return '';

      const nodes = [...segment];
      let current = nodes.pop()!;
      const [x, y] = this.half(current.direction, current.x, current.y);
      let d = `M${current.x / 100},${current.y / 100}Q${x / 100},${y / 100} `;

      current = nodes.pop()!;
      d += `${current.x / 100},${current.y / 100}`;
      
      while (nodes.length) {
        current = nodes.pop()!;
        d += `T${current.x / 100},${current.y / 100}`;
      }

      return d;
    };

    return {
      enter: pathSegment(0, 2),
      stay: pathSegment(1, MAX_PATH - 1),
      exit: pathSegment(MAX_PATH - 2, MAX_PATH),
    };
  }

  getBridgeTransforms(): string[] {
    return this.nodes
      .filter((node) => node.isActive)
      .map((node) => `translate(${node.x / 100},${node.y / 100}) rotate(${node.direction * 60})`);
  }
}
