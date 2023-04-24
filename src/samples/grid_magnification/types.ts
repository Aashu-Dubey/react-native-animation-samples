import {
  SkPoint,
  SkiaMutableValue,
  SkiaValue,
} from '@shopify/react-native-skia';
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

export interface BoxSkiaProps extends Props {
  totalCol: number;
  touchPos: SkiaMutableValue<TouchType | null>;
}

type BoxValues = {
  x: number;
  y: number;
  origin: SkPoint;
  transform: { translateX: number; translateY: number; scale: number };
};

export interface BoxSkiaSelectorProps extends Props {
  touchPos: SkiaMutableValue<TouchType | null>;
  boxValues: SkiaValue<BoxValues[]>;
}

export interface BoxSkiaReanimatedProps extends Props {
  touchPos: SharedValue<TouchType | null>;
  boxValues: SharedValue<BoxValues[]>;
}
