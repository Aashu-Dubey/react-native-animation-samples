import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  Canvas,
  RoundedRect,
  useImage,
  Group,
  dist,
  ImageShader,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Extrapolate,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BackButton } from '../../components';
import { APP_ICONS } from './icons';
import { BoxSkiaReanimatedProps, TouchType } from './types';

const boxSize = 20 + 12; // 12 = padding
const RADIUS = 130;

const Box: React.FC<BoxSkiaReanimatedProps> = ({
  boxValues,
  icon,
  index,
  touchPos,
}) => {
  const itemScale = useSharedValue(1);
  const translateH = useSharedValue(0);
  const translateV = useSharedValue(0);

  const image = useImage(icon);

  // With Spring effect
  const transformNew = useDerivedValue(() => {
    const isAnimStartOrEnd = touchPos.value?.isFirst || touchPos.value === null;
    const transAnim = boxValues.value[index]?.transform;

    if (transAnim) {
      if (isAnimStartOrEnd) {
        const springConfig = { damping: 20, mass: 0.8 };
        translateH.value = withSpring(transAnim.translateX, springConfig);
        translateV.value = withSpring(transAnim.translateY, springConfig);
        itemScale.value = withSpring(transAnim.scale, springConfig);
      } else {
        translateH.value = transAnim.translateX;
        translateV.value = transAnim.translateY;
        itemScale.value = transAnim.scale;
      }
    }

    return [
      { translateX: translateH.value },
      { translateY: translateV.value },
      { scale: itemScale.value },
    ];
  }, [boxValues]);
  /* const matrix = useComputedValue(() => {
    return processTransform2d([
      { translateX: translateH.current },
      { translateY: translateV.current },
      { scale: itemScale.current },
    ]);
  }, [itemScale, translateH, translateV]); */

  const PAD = 6;
  const props = {
    x: boxValues.value[index]?.x ?? 0,
    y: boxValues.value[index]?.y ?? 0,
    width: boxSize - PAD * 2,
    height: boxSize - PAD * 2,
  };

  return (
    <Group
      transform={transformNew}
      /* matrix={matrix} */
      origin={boxValues.value[index]?.origin}
    >
      {image && (
        <RoundedRect {...props} r={6}>
          <ImageShader image={image} fit="cover" rect={props} />
        </RoundedRect>
      )}
    </Group>
  );
};

const GridMagnification: React.FC = () => {
  const window = useWindowDimensions();
  const inset = useSafeAreaInsets();

  const touchPos = useSharedValue<TouchType | null>(null);

  const [appIcons, setAppIcons] = useState<string[]>([]);
  const [totalCol, setTotalCol] = useState(0);

  const gridView = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const viewWidth = window.width - inset.left - inset.right - 32;
    const viewHeight = window.height - inset.top - inset.bottom - (32 + 42);

    const maxCol = Math.trunc(viewWidth / boxSize);
    const maxRow = Math.trunc(viewHeight / boxSize);

    gridView.current = { width: maxCol * boxSize, height: maxRow * boxSize };
    setTotalCol(maxCol);

    const randomInteger = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    setAppIcons(() => {
      const total = maxCol * maxRow;
      const icons = [];
      for (let i = 0; i < total; i++) {
        const icon =
          i < APP_ICONS.length
            ? APP_ICONS[i]
            : APP_ICONS[randomInteger(0, APP_ICONS.length - 1)];
        icons.push(icon);
      }

      return icons;
    });
  }, [window, inset]);

  const gesture = Gesture.Pan()
    .onBegin(e => {
      touchPos.value = { x: e.x, y: e.y, isFirst: true };
    })
    .onChange(e => {
      touchPos.value = { x: e.x, y: e.y, isFirst: false };
    })
    .onFinalize(() => {
      touchPos.value = null;
    });

  const boxValues = useDerivedValue(
    () =>
      appIcons.map((_, index) => {
        const row = Math.trunc(index / totalCol);
        const col = index % totalCol;
        const position = { x: col * boxSize, y: row * boxSize };

        const origin = {
          x: position.x + boxSize / 2,
          y: position.y + boxSize / 2,
        };

        const distance = touchPos.value ? dist(touchPos.value, origin) : 0;

        let translateX = 0,
          translateY = 0;
        if (touchPos.value) {
          // Here 'touchPos.value.(x/y) - pos(X/Y)' will translate a particular item to the touch point, then multiplying
          // that value with this median (correct name?) will distribute items to a distance, basically forming a Circle.
          const median = (distance - RADIUS) / RADIUS;

          translateX = (touchPos.value.x - origin.x) * median;
          translateY = (touchPos.value.y - origin.y) * median;

          // Clamp the translate value to the touch point if it is getting past that.
          if (Math.abs(translateX) > Math.abs(touchPos.value.x - origin.x)) {
            translateX = touchPos.value.x - origin.x;
          }
          if (Math.abs(translateY) > Math.abs(touchPos.value.y - origin.y)) {
            translateY = touchPos.value.y - origin.y;
          }
        }

        // Currently setting the scaling hard coded (3, 2, 1) and it seems to be working fine for different radius.
        // Make it dynamic?
        const scale = interpolate(
          distance,
          [0, 0.01, RADIUS / 3, RADIUS / 2, RADIUS],
          [1, 3, 2, 1, 0.15],
          {
            extrapolateLeft: Extrapolate.CLAMP,
            extrapolateRight: Extrapolate.CLAMP,
          },
        );
        const PAD = 6;
        return {
          x: position.x + PAD,
          y: position.y + PAD,
          origin,
          transform: { translateX, translateY, scale },
        };
      }),
    [touchPos, totalCol, appIcons],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <BackButton style={{ marginTop: 0, marginLeft: 12 }} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <GestureDetector gesture={gesture}>
          <Canvas style={[{ ...gridView.current }, styles.container]}>
            {appIcons.map((icon, index) => (
              <Box key={index} {...{ boxValues, icon, index, touchPos }} />
            ))}
          </Canvas>
        </GestureDetector>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
});

export default GridMagnification;
