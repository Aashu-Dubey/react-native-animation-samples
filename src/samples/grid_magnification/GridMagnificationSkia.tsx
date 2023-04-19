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
  // runSpring,
  // useValueEffect,
} from '@shopify/react-native-skia';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BackButton } from '../../components';
import { APP_ICONS } from './icons';
import { BoxSkiaProps, TouchType } from './types';

const boxSize = 20 + 12; // 12 = padding
const RADIUS = 130;

const Box: React.FC<BoxSkiaProps> = ({ totalCol, icon, index, touchPos }) => {
  const position = useComputedValue(() => {
    const row = Math.trunc(index / totalCol);
    const col = index % totalCol;
    return { x: col * boxSize, y: row * boxSize };
  }, [totalCol]);

  const origin = useComputedValue(
    () =>
      vec(position.current.x + boxSize / 2, position.current.y + boxSize / 2),
    [position],
  );

  /* const itemScale = useValue(1);
  const translateH = useValue(0);
  const translateV = useValue(0); */

  const image = useImage(icon);

  const distance = useComputedValue(
    () => (touchPos.current ? dist(touchPos.current, origin.current) : 0),
    [touchPos, origin],
  );

  const translate = useComputedValue(() => {
    let translateX = 0,
      translateY = 0;
    if (touchPos.current) {
      // Here 'touchPos.value.(x/y) - pos(X/Y)' will translate a particular item to the touch point, then multiplying
      // that value with this median (correct name?) will distribute items to a distance, basically forming a Circle.
      const median = (distance.current - RADIUS) / RADIUS;

      translateX = (touchPos.current.x - origin.current.x) * median;
      translateY = (touchPos.current.y - origin.current.y) * median;

      // Clamp the translate value to the touch point if it is getting past that.
      if (
        Math.abs(translateX) > Math.abs(touchPos.current.x - origin.current.x)
      ) {
        translateX = touchPos.current.x - origin.current.x;
      }
      if (
        Math.abs(translateY) > Math.abs(touchPos.current.y - origin.current.y)
      ) {
        translateY = touchPos.current.y - origin.current.y;
      }
    }
    return { x: translateX, y: translateY };
  }, [touchPos, origin]);

  const scale = useComputedValue(() => {
    // Currently setting the scaling hard coded (3, 2, 1) and it seems to be working fine for different radius.
    // Make it dynamic?
    return interpolate(
      distance.current,
      [0, 0.01, RADIUS / 3, RADIUS / 2, RADIUS],
      [1, 3, 2, 1, 0.15],
      {
        extrapolateLeft: Extrapolate.CLAMP,
        extrapolateRight: Extrapolate.CLAMP,
      },
    );
  }, [touchPos, origin]);

  /* useValueEffect(scale, () => {
    const isAnimStartOrEnd =
      touchPos.current?.isFirst || touchPos.current === null;
    if (isAnimStartOrEnd) {
      runSpring(itemScale, scale.current, { damping: 20, mass: 0.8 });
    } else {
      itemScale.current = scale.current;
    }
  });
  useValueEffect(translate, () => {
    const isAnimStartOrEnd =
      touchPos.current?.isFirst || touchPos.current === null;
    if (isAnimStartOrEnd) {
      runSpring(translateH, translate.current.x, { damping: 20, mass: 0.8 });
      runSpring(translateV, translate.current.y, { damping: 20, mass: 0.8 });
    } else {
      translateH.current = translate.current.x;
      translateV.current = translate.current.y;
    }
  });

  const transform = useComputedValue(() => {
    return [
      { translateX: translateH.current },
      { translateY: translateV.current },
      { scale: itemScale.current },
    ];
  }, [itemScale, translateH, translateV]); */
  const transform = useComputedValue(() => {
    return [
      { translateX: translate.current.x },
      { translateY: translate.current.y },
      { scale: scale.current },
    ];
  }, [scale, translate]);

  const PAD = 6;
  const props = {
    x: position.current.x + PAD,
    y: position.current.y + PAD,
    width: boxSize - PAD * 2,
    height: boxSize - PAD * 2,
  };

  return (
    <Group transform={transform} origin={origin}>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <BackButton style={{ marginTop: 0, marginLeft: 12 }} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Canvas
          style={[{ ...gridView.current }, styles.container]}
          onTouch={onTouch}
        >
          {appIcons.map((icon, index) => (
            <Box
              key={index}
              totalCol={totalCol.current}
              {...{ icon, index, touchPos }}
            />
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
