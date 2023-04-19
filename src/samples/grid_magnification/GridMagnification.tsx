import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BackButton } from '../../components';
import { APP_ICONS } from './icons';
import { BoxProps, TouchType } from './types';

const boxSize = 20 + 12; // 12 = padding
const RADIUS = 130;

const Box: React.FC<BoxProps> = ({ totalCol, icon, index, touchPos }) => {
  const viewStyle = useAnimatedStyle(() => {
    const row = Math.trunc(index / totalCol);
    const col = index % totalCol;
    const posX = col * boxSize + boxSize / 2;
    const posY = row * boxSize + boxSize / 2;

    // Getting distance between two points using equation, d=√((x2 – x1)² + (y2 – y1)²)
    const distance = touchPos.value
      ? Math.sqrt(
          Math.pow(touchPos.value.x - posX, 2) +
            Math.pow(touchPos.value.y - posY, 2),
        )
      : 0;

    let translateX = 0,
      translateY = 0;
    if (touchPos.value) {
      // Here 'touchPos.value.(x/y) - pos(X/Y)' will translate a particular item to the touch point, then multiplying
      // that value with this median (correct name?) will distribute items to a distance, basically forming a Circle.
      const median = (distance - RADIUS) / RADIUS;

      // translateX = (distance / RADIUS) * (touchPos.value.x - posX) * median;
      // translateY = (distance / RADIUS) * (touchPos.value.y - posY) * median;
      translateX = (touchPos.value.x - posX) * median;
      translateY = (touchPos.value.y - posY) * median;

      // Clamp the translate value to the touch point if it is getting past that.
      if (Math.abs(translateX) > Math.abs(touchPos.value.x - posX)) {
        translateX = touchPos.value.x - posX;
      }
      if (Math.abs(translateY) > Math.abs(touchPos.value.y - posY)) {
        translateY = touchPos.value.y - posY;
      }
    }

    const isAnimStartOrEnd = touchPos.value?.isFirst || touchPos.value === null;
    const tx = isAnimStartOrEnd
      ? withSpring(translateX, { damping: 20, mass: 0.8 })
      : translateX;
    const ty = isAnimStartOrEnd
      ? withSpring(translateY, { damping: 20, mass: 0.8 })
      : translateY;
    const scale = interpolate(
      distance,
      [0, 0.01, RADIUS / 3, RADIUS / 2, RADIUS],
      [1, 3, 2, 1, 0.15],
      {
        extrapolateLeft: Extrapolate.CLAMP,
        extrapolateRight: Extrapolate.CLAMP,
      },
    );

    return {
      zIndex: distance <= RADIUS ? 99 : 9, // just so scaled down items don't show above bigger ones
      transform: [
        { translateX: tx },
        { translateY: ty },
        // Currently setting the scaling hard coded (3, 2, 1) and it seems to be working fine for different radius.
        // Make it dynamic?
        {
          scale: isAnimStartOrEnd
            ? withSpring(scale, { damping: 20, mass: 0.8 })
            : scale,
        },
      ],
    };
  }, [totalCol]);

  return (
    <Animated.View style={[{ width: boxSize, height: boxSize }, viewStyle]}>
      <View style={styles.boxView}>
        <Image
          style={{ width: boxSize - 12, height: boxSize - 12 }}
          source={{ uri: icon }}
        />
      </View>
    </Animated.View>
  );
};

const GridMagnification: React.FC = () => {
  const window = useWindowDimensions();
  const inset = useSafeAreaInsets();

  const touchPos = useSharedValue<TouchType | null>(null);

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

  const dragGesture = Gesture.Pan()
    .onBegin(e => {
      touchPos.value = { x: e.x, y: e.y, isFirst: true };
    })
    .onUpdate(e => {
      touchPos.value = { x: e.x, y: e.y, isFirst: false };
    })
    .onFinalize(() => {
      touchPos.value = null;
    });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <BackButton style={{ marginTop: 0, marginLeft: 12 }} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <GestureDetector gesture={dragGesture}>
          <View style={[{ ...gridView.current }, styles.container]}>
            {appIcons.map((icon, index) => (
              <Box
                key={index}
                totalCol={totalCol.current}
                {...{ icon, index, touchPos }}
              />
            ))}
          </View>
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
  boxView: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 6,
    margin: 6,
    overflow: 'hidden',
  },
});

export default GridMagnification;
