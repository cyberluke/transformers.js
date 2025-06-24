declare module 'liquid-glass-react' {
  import { FC, ReactNode } from 'react';

  type LiquidGlassMode = 'standard' | 'polar' | 'prominent' | 'shader';

  interface LiquidGlassProps {
    displacementScale?: number;
    blurAmount?: number;
    saturation?: number;
    aberrationIntensity?: number;
    cornerRadius?: number;
    mode?: LiquidGlassMode;
    className?: string;
    style?: React.CSSProperties;
    children: ReactNode;
  }

  const LiquidGlass: FC<LiquidGlassProps>;
  export default LiquidGlass;
}