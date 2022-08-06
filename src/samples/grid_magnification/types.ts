import { SkiaMutableValue, SkPoint } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

interface Props {
  icon?: string;
  smallWidth: number;
  smallHeight: number;
  index: number;
}
export interface BoxProps extends Props {
  touchPos: SharedValue<{ x: number; y: number } | null>;
}

export interface BoxSkiaProps extends Props {
  touchPos: SkiaMutableValue<SkPoint | null>;
}
