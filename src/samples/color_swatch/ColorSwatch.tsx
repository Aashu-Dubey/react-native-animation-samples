import React, { useCallback, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { BackButton } from '../../components';

interface PaletteProp {
  colors: string[];
  index: number;
  activeGesture: SharedValue<number>;
  activeColor: string;
  onColorPress: (color: string) => void;
}

const ITEM_WIDTH = 60;
const ITEM_HEIGHT = 250;

const COLOR_PALETTE = [
  ['rgb(195, 107, 88)', 'rgb(216, 160, 164)', 'rgb(209, 178, 195)'],
  ['rgb(202, 106, 123)', 'rgb(224, 156, 192)', 'rgb(212, 171, 215)'],
  ['rgb(187, 122, 248)', 'rgb(212, 172, 250)', 'rgb(216, 191, 251)'],
  ['rgb(118, 134, 247)', 'rgb(157, 183, 259)', 'rgb(168, 198, 250)'],
  ['rgb(103, 130, 169)', 'rgb(182, 208, 237)', 'rgb(195, 218, 246)'],
  ['rgb(0, 0, 0)', 'rgb(64, 68, 88)', 'rgb(122, 128, 159)'],
];

const PaletteItem: React.FC<PaletteProp> = ({
  colors,
  index,
  activeGesture,
  activeColor,
  onColorPress,
}) => {
  const viewStyle = useAnimatedStyle(() => {
    const angle = (activeGesture.value / (COLOR_PALETTE.length - 1)) * index;

    return {
      transform: [
        { translateY: 100 },
        { rotate: withSpring(`${angle}deg`, { damping: 100, mass: 0.4 }) },
        { translateY: -100 },
      ],
    };
  }, [activeGesture]);

  const onAnchorPress = useCallback(
    () => (activeGesture.value = activeGesture.value === 0 ? 90 : 0),
    [activeGesture],
  );

  return (
    <Animated.View
      style={[styles.paletteContainer, styles.paletteSize, viewStyle]}
    >
      <Pressable
        style={[
          styles.colorItemCommon,
          styles.colorTop,
          { backgroundColor: colors[0] },
        ]}
        onPress={() => onColorPress(colors[0])}
      />
      <Pressable
        style={[
          styles.colorItemCommon,
          styles.colorMiddle,
          { backgroundColor: colors[1] },
        ]}
        onPress={() => onColorPress(colors[1])}
      />
      <Pressable
        style={[styles.colorItemCommon, { backgroundColor: colors[2] }]}
        onPress={() => onColorPress(colors[2])}
      />
      <Pressable style={styles.anchorContainer} onPress={onAnchorPress}>
        <View style={[styles.anchorOuterCircle, { borderColor: activeColor }]}>
          <View
            style={[
              styles.anchorInnerCircle,
              { backgroundColor: activeColor, borderColor: activeColor },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const ColorSwatch = () => {
  const activeGesture = useSharedValue(0);

  const [activeColor, setActivecolor] = useState('rgb(64, 68, 88)');

  const calculateDegree = useCallback(
    (e: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      'worklet';
      // Get an angle in radians, multiply that by 180 / π to get a value in degree:
      // => "ITEM_HEIGHT - e.y" to take y axis value from bottom (0) to top (ITEM_HEIGHT), as opposed to gesture handler by default returning top (0) to bottom (ITEM_HEIGHT) on the Palette view.
      // => "e.x - ITEM_WIDTH / 2" to consider x's start point from the center of the width.
      let degree =
        Math.atan2(ITEM_HEIGHT - e.y, e.x - ITEM_WIDTH / 2) * (180 / Math.PI);
      // This condition is just to have possible 180 degree rotation on both sides while dragging
      degree < -90 && (degree = degree + 360);
      // Subtract from 90 as that is our initial palette's degree position
      return 90 - degree;
    },
    [],
  );

  const dragGesture = Gesture.Pan()
    .onStart(e => {
      activeGesture.value = calculateDegree(e);
    })
    .onUpdate(e => {
      activeGesture.value = calculateDegree(e);
    })
    .onEnd(() => {
      activeGesture.value = activeGesture.value > 90 ? 90 : 0;
    });

  return (
    <>
      <StatusBar barStyle={'light-content'} backgroundColor={activeColor} />
      <SafeAreaView style={{ flex: 1, backgroundColor: activeColor }}>
        <BackButton />

        <View style={{ flex: 1, margin: 40, justifyContent: 'flex-end' }}>
          <GestureDetector gesture={dragGesture}>
            <View style={styles.paletteSize}>
              {COLOR_PALETTE.map((colors, index) => (
                <PaletteItem
                  key={index}
                  onColorPress={setActivecolor}
                  {...{ activeColor, colors, index, activeGesture }}
                />
              ))}
            </View>
          </GestureDetector>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  paletteSize: { width: ITEM_WIDTH, height: ITEM_HEIGHT },
  paletteContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 20,
  },
  colorItemCommon: {
    flex: 1,
    width: '100%',
    borderRadius: 8,
  },
  colorTop: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 4,
  },
  colorMiddle: { marginBottom: 4 },
  anchorContainer: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anchorOuterCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anchorInnerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});

export default ColorSwatch;
