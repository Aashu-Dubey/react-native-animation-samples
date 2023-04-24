import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  Canvas,
  RoundedRect,
  useImage,
  Group,
  useTouchHandler,
  useValue,
  vec,
  dist,
  interpolate,
  Extrapolate,
  useComputedValue,
  ImageShader,
  processTransform2d,
  Selector,
  runSpring,
  useValueEffect,
  SkiaMutableValue,
  SkiaValue,
  SkPoint,
} from '@shopify/react-native-skia';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BackButton } from '../../components';
import { APP_ICONS } from './icons';
import { TouchType } from './types';

interface BoxSkiaProps {
  icon?: string;
  index: number;
  touchPos: SkiaMutableValue<TouchType | null>;
  boxValues: SkiaValue<
    {
      x: number;
      y: number;
      origin: SkPoint;
      transform: { translateX: number; translateY: number; scale: number };
    }[]
  >;
}

const boxSize = 20 + 12; // 12 = padding
const RADIUS = 130;

const Box: React.FC<BoxSkiaProps> = ({ boxValues, icon, index, touchPos }) => {
  const transform = Selector(boxValues, b => b[index].transform);
  // const x = Selector(boxValues, b => b[index].x);
  // const y = Selector(boxValues, b => b[index].y);
  const origin = Selector(boxValues, b => b[index].origin);

  const itemScale = useValue(1);
  const translateH = useValue(0);
  const translateV = useValue(0);

  const image = useImage(icon);

  useValueEffect(transform.value, () => {
    const isAnimStartOrEnd =
      touchPos.current?.isFirst || touchPos.current === null;
    const transAnim = boxValues.current[index].transform;

    if (isAnimStartOrEnd) {
      runSpring(itemScale, transAnim.scale, { damping: 20, mass: 0.8 });
    } else {
      itemScale.current = transAnim.scale;
    }
  });
  useValueEffect(transform.value, () => {
    const isAnimStartOrEnd =
      touchPos.current?.isFirst || touchPos.current === null;
    const transAnim = boxValues.current[index].transform;

    if (isAnimStartOrEnd) {
      runSpring(translateH, transAnim.translateX, { damping: 20, mass: 0.8 });
      runSpring(translateV, transAnim.translateY, { damping: 20, mass: 0.8 });
    } else {
      translateH.current = transAnim.translateX;
      translateV.current = transAnim.translateY;
    }
  });

  // With Spring effect
  /* const transformNew = useComputedValue(() => {
    return [
      { translateX: translateH.current },
      { translateY: translateV.current },
      { scale: itemScale.current },
    ];
  }, [itemScale, translateH, translateV]); */
  const matrix = useComputedValue(() => {
    return processTransform2d([
      { translateX: translateH.current },
      { translateY: translateV.current },
      { scale: itemScale.current },
    ]);
  }, [itemScale, translateH, translateV]);

  // Without Spring effect
  /* const transformNew = useComputedValue(() => {
    const transformAnim = boxValues.current[index].transform;
    return [
      { translateX: transformAnim.translateX },
      { translateY: transformAnim.translateY },
      { scale: transformAnim.scale },
    ];
  }, [boxValues]); */

  const PAD = 6;
  // const props = {
  //   // x,
  //   // y,
  //   // x: position?.x + PAD,
  //   // y: position?.y + PAD,
  //   width: boxSize - PAD * 2,
  //   height: boxSize - PAD * 2,
  // };

  const props = {
    x: boxValues.current[index].x,
    y: boxValues.current[index].y,
    width: boxSize - PAD * 2,
    height: boxSize - PAD * 2,
  };

  return (
    <Group /* transform={transformNew} */ matrix={matrix} origin={origin}>
      {image && (
        <RoundedRect
          {...props}
          // x={x}
          // y={y}
          // width={boxSize - PAD * 2}
          // height={boxSize - PAD * 2}
          r={6}
        >
          <ImageShader
            image={image}
            fit="cover"
            rect={props}
            // x={x}
            // y={y}
            // width={boxSize - PAD * 2}
            // height={boxSize - PAD * 2}
          />
        </RoundedRect>
      )}
    </Group>
  );
};

const GridMagnification: React.FC = () => {
  const window = useWindowDimensions();
  const inset = useSafeAreaInsets();

  const touchPos = useValue<TouchType | null>(null);

  const [appIcons, setAppIcons] = useState<string[]>([]);

  const gridView = useRef({ width: 0, height: 0 });
  const totalCol = useRef(0);

  useEffect(() => {
    const viewWidth = window.width - inset.left - inset.right - 32;
    const viewHeight = window.height - inset.top - inset.bottom - (32 + 42);

    const maxCol = Math.trunc(viewWidth / boxSize);
    const maxRow = Math.trunc(viewHeight / boxSize);

    gridView.current = { width: maxCol * boxSize, height: maxRow * boxSize };
    totalCol.current = maxCol;

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

  const onTouch = useTouchHandler({
    onStart: pt => {
      touchPos.current = { ...pt, isFirst: true };
    },
    onActive: pt => {
      touchPos.current = { ...pt, isFirst: false };
    },
    onEnd: () => {
      touchPos.current = null;
    },
  });

  const boxValues = useComputedValue(
    () =>
      appIcons.map((_, index) => {
        const row = Math.trunc(index / totalCol.current);
        const col = index % totalCol.current;
        const position = { x: col * boxSize, y: row * boxSize };

        const origin = vec(position.x + boxSize / 2, position.y + boxSize / 2);

        const distance = touchPos.current ? dist(touchPos.current, origin) : 0;

        let translateX = 0,
          translateY = 0;
        if (touchPos.current) {
          // Here 'touchPos.value.(x/y) - pos(X/Y)' will translate a particular item to the touch point, then multiplying
          // that value with this median (correct name?) will distribute items to a distance, basically forming a Circle.
          const median = (distance - RADIUS) / RADIUS;

          translateX = (touchPos.current.x - origin.x) * median;
          translateY = (touchPos.current.y - origin.y) * median;

          // Clamp the translate value to the touch point if it is getting past that.
          if (Math.abs(translateX) > Math.abs(touchPos.current.x - origin.x)) {
            translateX = touchPos.current.x - origin.x;
          }
          if (Math.abs(translateY) > Math.abs(touchPos.current.y - origin.y)) {
            translateY = touchPos.current.y - origin.y;
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
          // position,
          x: position.x + PAD,
          y: position.y + PAD,
          origin,
          // transform: [{ translateX }, { translateY }, { scale }],
          // transform: processTransform2d([{ translateX }, { translateY }, { scale }]),
          transform: { translateX, translateY, scale },
        };
        // return [{ translateX }, { translateY }, { scale }];
      }),
    [touchPos, totalCol, appIcons],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <BackButton style={{ marginTop: 0, marginLeft: 12 }} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Canvas
          style={[{ ...gridView.current }, styles.container]}
          onTouch={onTouch}
        >
          {appIcons.map((icon, index) => (
            <Box key={index} {...{ boxValues, icon, index, touchPos }} />
          ))}
        </Canvas>
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
  boxView: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 6,
    margin: 6,
    overflow: 'hidden',
  },
});

export default GridMagnification;
