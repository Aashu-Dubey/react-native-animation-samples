import React, { useEffect, useState } from 'react';
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
import BackButton from '../../components/BackButton';
import { APP_ICONS } from './icons';
import { BoxProps } from './types';

const COL = 12;
const ROW = 22;
const RADIUS = 130;

const Box: React.FC<BoxProps> = ({
  icon,
  smallWidth,
  smallHeight,
  index,
  touchPos,
}) => {
  const row = Math.trunc(index / COL);
  const col = index % COL;
  const posX = col * smallWidth + smallWidth / 2;
  const posY = row * smallHeight + smallHeight / 2;

  /* const distance = Math.sqrt(
    Math.pow(bigWidth / 2 - posX, 2) + Math.pow(bigHeight / 2 - posY, 2),
  ); */

  const viewStyle = useAnimatedStyle(() => {
    // Getting distance between two points using equation, d=√((x2 – x1)² + (y2 – y1)²)
    const distance = touchPos.value
      ? Math.sqrt(
          Math.pow(touchPos.value.x - posX, 2) +
            Math.pow(touchPos.value.y - posY, 2),
        )
      : 0;

    /* const touchRow = Math.ceil(touchPos.value?.x ?? 0 / smallWidth);
    const touchCol = Math.ceil(touchPos.value?.y ?? 0 / smallHeight);
    const touchPosX = touchCol * smallWidth + smallWidth / 2;
    const touchPosY = touchRow * smallHeight + smallHeight / 2; */

    // const translateX = bigWidth / 2 - posX;
    // const translateY = bigHeight / 2 - posY;
    /* const translateX = touchPos.value
      ? touchPos.value.x - posX - (touchPos.value.x > posX ? radius : -radius)
      : 0;
    const translateY = touchPos.value
      ? touchPos.value.y - posY - (touchPos.value.y > posY ? radius : -radius)
      : 0; */

    // let translateX = touchPos.value
    //   ? /* distance > bigHeight / 2
    //     ? touchPos.value.x - posX
    //     : */ (distance / radius) * (touchPos.value.x - posX) * 0.25
    //   : 0;
    // let translateY = touchPos.value
    //   ? /* distance > bigHeight / 2
    //     ? touchPos.value.y - posY
    //     : */ (distance / radius) * (touchPos.value.y - posY) * 0.25
    //   : 0;
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

    return {
      zIndex: distance <= RADIUS ? 99 : 9, // just so scaled down items don't show above bigger ones
      transform: [
        { translateX: withSpring(translateX, { damping: 20, mass: 0.8 }) },
        { translateY: withSpring(translateY, { damping: 20, mass: 0.8 }) },
        // Currently setting the scaling hard coded (3, 2, 1) and it seems to be working fine for different radius.
        // Make it dynamic?
        {
          scale: withSpring(
            interpolate(
              distance,
              [0, 0.01, RADIUS / 3, RADIUS / 2, RADIUS],
              [1, 3, 2, 1, 0.15],
              {
                extrapolateLeft: Extrapolate.CLAMP,
                extrapolateRight: Extrapolate.CLAMP,
              },
            ),
            { damping: 20, mass: 0.8 },
          ),
        },
      ],
    };
  }, []);

  return (
    <Animated.View
      style={[{ width: smallWidth, height: smallHeight }, viewStyle]}
    >
      <View style={styles.boxView}>
        <Image
          style={{ width: smallWidth - 12, height: smallHeight - 12 }}
          source={{ uri: icon }}
        />
      </View>
    </Animated.View>
  );
};

const GridMagnification: React.FC = () => {
  const window = useWindowDimensions();
  const inset = useSafeAreaInsets();

  const touchPos = useSharedValue<{ x: number; y: number } | null>(null);
  const isGestureActive = useSharedValue(false);

  const [appIcons, setAppIcons] = useState<string[]>([]);

  const bigWidth = window.width - 16;
  const bigHeight = window.height - inset.top - inset.bottom - 80;

  // const totalItems = COL * ROW;
  const smallWidth = bigWidth / COL;
  const smallHeight = bigHeight / ROW;

  useEffect(() => {
    /* const randomInteger = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min; */

    /* setAppIcons(cIcons => {
      if (cIcons.length > 0) {
        return cIcons;
      }
      const total = COL * ROW;
      const icons = [];
      for (let i = 0; i < total; i++) {
        // icons.push(APP_ICONS[randomInteger(0, APP_ICONS.length - 1)]);
        icons.push(APP_ICONS[i]);
      }
      return icons;
    }); */
    setAppIcons([...APP_ICONS]);
  }, []);

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
      <BackButton style={{ marginTop: 0, marginLeft: 12 }} />
      <GestureDetector
        gesture={Gesture.Simultaneous(dragGesture, longPressGesture)}
      >
        <View
          style={[{ width: bigWidth, height: bigHeight }, styles.container]}
        >
          {appIcons.map((icon, index) => (
            <Box
              key={index}
              {...{ icon, smallWidth, smallHeight, index, touchPos }}
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
