// Initial implementation following "https://twitter.com/philipcdavis/status/1549416537789845506"
import React, { useMemo } from 'react';
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
import { BoxProps } from './types';

const COL = 12;
const ROW = 22;
const RADIUS = 80;

const Box = ({ smallWidth, smallHeight, index, touchPos }: BoxProps) => {
  const row = Math.trunc(index / COL);
  const col = index % COL;
  const posX = col * smallWidth + smallWidth / 2;
  const posY = row * smallHeight + smallHeight / 2;

  const viewStyle = useAnimatedStyle(() => {
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

    return {
      transform: [
        { translateX: withSpring(translateX, { damping: 20 }) },
        { translateY: withSpring(translateY, { damping: 20 }) },
        {
          scale: withSpring(
            interpolate(
              distance,
              [0, 0.01, RADIUS, RADIUS + (smallWidth + smallHeight) / 2],
              [1, 1.6, 0.6, 0.15],
              {
                extrapolateLeft: Extrapolate.CLAMP,
                extrapolateRight: Extrapolate.CLAMP,
              },
            ),
            { damping: 20 },
          ),
        },
      ],
    };
  }, []);

  return (
    <Animated.View
      style={[{ width: smallWidth, height: smallHeight }, viewStyle]}
    >
      <View style={styles.boxView} />
    </Animated.View>
  );
};

const GridMagnification: React.FC = () => {
  const window = useWindowDimensions();
  const inset = useSafeAreaInsets();

  const touchPos = useSharedValue<{ x: number; y: number } | null>(null);
  const isGestureActive = useSharedValue(false);

  const bigWidth = window.width;
  const bigHeight = window.height - inset.top - inset.bottom;

  const smallWidth = bigWidth / COL;
  const smallHeight = bigHeight / ROW;

  const items = useMemo(() => [...Array(COL * ROW)], []); // Hardcoded total items, 12 columns and 22 rows

  const dragGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_, state) => {
      isGestureActive.value ? state.activate() : state.fail();
    })
    .onStart(e => {
      touchPos.value = { x: e.x, y: e.y };
    })
    .onUpdate(e => {
      touchPos.value = { x: e.x, y: e.y };
    })
    .onEnd(() => {
      touchPos.value = null;
    })
    .onFinalize(() => {
      isGestureActive.value = false;
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(150)
    .onStart(e => {
      isGestureActive.value = true;
      touchPos.value = { x: e.x, y: e.y };
    })
    .onEnd(_event => {
      touchPos.value = null;
    });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <GestureDetector
        gesture={Gesture.Simultaneous(dragGesture, longPressGesture)}
      >
        <View
          style={[{ width: bigWidth, height: bigHeight }, styles.container]}
        >
          {items.map((_, index) => (
            <Box
              key={index}
              {...{ smallWidth, smallHeight, index, touchPos }}
            />
          ))}
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
