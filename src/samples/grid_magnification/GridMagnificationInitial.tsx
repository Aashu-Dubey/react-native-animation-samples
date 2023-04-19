// Initial implementation following "https://twitter.com/philipcdavis/status/1549416537789845506"
import React, { useEffect, useRef, useState } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
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
import { BoxProps, TouchType } from './types';

const boxSize = 20 + 12; // 12 = padding
const RADIUS = 80;

const Box = ({ totalCol, index, touchPos }: BoxProps) => {
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
      // Here 'touchPos.value.(x/y) - pos(X/Y)' will translate a particular item to the touch point.
      // multiplying with 'distance / RADIUS' distribute the items to a circular area.
      // multipying with '0.25' here just to form a bigger circle. Smaller the value, bigger the circle.
      translateX = (distance / RADIUS) * (touchPos.value.x - posX) * 0.25;
      translateY = (distance / RADIUS) * (touchPos.value.y - posY) * 0.25;

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
      ? withSpring(translateX, { damping: 20 })
      : translateX;
    const ty = isAnimStartOrEnd
      ? withSpring(translateY, { damping: 20 })
      : translateY;
    const scale = interpolate(
      distance,
      [0, 0.01, RADIUS, RADIUS + boxSize],
      [1, 1.6, 0.6, 0.15],
      {
        extrapolateLeft: Extrapolate.CLAMP,
        extrapolateRight: Extrapolate.CLAMP,
      },
    );

    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        {
          scale: isAnimStartOrEnd ? withSpring(scale, { damping: 20 }) : scale,
        },
      ],
    };
  }, [totalCol]);

  return (
    <Animated.View style={[{ width: boxSize, height: boxSize }, viewStyle]}>
      <View style={styles.boxView} />
    </Animated.View>
  );
};

const GridMagnification: React.FC = () => {
  const window = useWindowDimensions();
  const inset = useSafeAreaInsets();

  const touchPos = useSharedValue<TouchType | null>(null);

  const gridView = useRef({ width: 0, height: 0 });
  const totalCol = useRef(0);

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const viewWidth = window.width - inset.left - inset.right - 32;
    const viewHeight = window.height - inset.top - inset.bottom - (32 + 42);

    const maxCol = Math.trunc(viewWidth / boxSize);
    const maxRow = Math.trunc(viewHeight / boxSize);

    gridView.current = { width: maxCol * boxSize, height: maxRow * boxSize };
    totalCol.current = maxCol;

    setItems([...Array(maxCol * maxRow)]);
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
            {items.map((_, index) => (
              <Box
                key={index}
                totalCol={totalCol.current}
                {...{ index, touchPos }}
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
