import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  RoundedRect,
  useImage,
  Group,
  useTouchHandler,
  useValue,
  vec,
  SkPoint,
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
import { BoxSkiaProps } from './types';

const COL = 12;
const ROW = 22;
const RADIUS = 130;

const Box: React.FC<BoxSkiaProps> = ({
  icon,
  smallWidth,
  smallHeight,
  index,
  touchPos,
}) => {
  const row = Math.trunc(index / COL);
  const col = index % COL;
  const posX = col * smallWidth;
  const posY = row * smallHeight;
  const origin = vec(posX + smallWidth / 2, posY + smallHeight / 2);

  /* const itemScale = useValue(1);
  const translateH = useValue(0);
  const translateV = useValue(0); */

  const image = useImage(icon);

  const distance = useComputedValue(
    () => (touchPos.current ? dist(touchPos.current, origin) : 0),
    [touchPos],
  );

  const translate = useComputedValue(() => {
    let translateX = 0,
      translateY = 0;
    if (touchPos.current) {
      // Here 'touchPos.value.(x/y) - pos(X/Y)' will translate a particular item to the touch point, then multiplying
      // that value with this median (correct name?) will distribute items to a distance, basically forming a Circle.
      const median = (distance.current - RADIUS) / RADIUS;

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
    return { x: translateX, y: translateY };
  }, [touchPos]);

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
  }, [touchPos]);

  /* useValueEffect(scale, () => {
    runSpring(itemScale, scale.current);
  });
  useValueEffect(translate, () => {
    runSpring(translateH, translate.current.x);
    runSpring(translateV, translate.current.y);
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
    x: posX + PAD,
    y: posY + PAD,
    width: smallWidth - PAD * 2,
    height: smallHeight - PAD * 2,
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

  const bigWidth = window.width - 16;
  const bigHeight = window.height - inset.top - inset.bottom - 80;
  const smallWidth = bigWidth / COL;
  const smallHeight = bigHeight / ROW;

  const touchPos = useValue<SkPoint | null>(null);

  const onTouch = useTouchHandler({
    onStart: pt => {
      touchPos.current = pt;
    },
    onActive: pt => {
      touchPos.current = pt;
    },
    onEnd: () => {
      touchPos.current = null;
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <BackButton style={{ marginTop: 0, marginLeft: 12 }} />
      <Canvas
        style={[{ width: bigWidth, height: bigHeight }, styles.container]}
        onTouch={onTouch}
      >
        {APP_ICONS.map((icon, index) => (
          <Box
            key={index}
            {...{ icon, smallWidth, smallHeight, index, touchPos }}
          />
        ))}
      </Canvas>
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
