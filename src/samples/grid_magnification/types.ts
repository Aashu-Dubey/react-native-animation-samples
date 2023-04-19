import { SkiaMutableValue } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

interface Props {
  totalCol: number;
  icon?: string;
  index: number;
}

export type TouchType = { x: number; y: number; isFirst: boolean };

export interface BoxProps extends Props {
  touchPos: SharedValue<TouchType | null>;
}

export interface BoxSkiaProps extends Props {
  touchPos: SkiaMutableValue<TouchType | null>;
}
