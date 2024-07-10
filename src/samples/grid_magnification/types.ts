import { SkPoint } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

interface Props {
  icon?: string;
  index: number;
}

export type TouchType = { x: number; y: number; isFirst: boolean };

export interface BoxProps extends Props {
  totalCol: number;
  touchPos: SharedValue<TouchType | null>;
}

type BoxValues = {
  x: number;
  y: number;
  origin: SkPoint;
  transform: { translateX: number; translateY: number; scale: number };
};

export interface BoxSkiaReanimatedProps extends Props {
  touchPos: SharedValue<TouchType | null>;
  boxValues: SharedValue<BoxValues[]>;
}
