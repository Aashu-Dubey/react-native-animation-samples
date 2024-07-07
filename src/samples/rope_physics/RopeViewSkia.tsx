import React, { useEffect, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Canvas,
  Skia,
  Path,
  StrokeJoin,
  StrokeCap,
  Circle,
  Group,
  BlurMask,
} from '@shopify/react-native-skia';
import Animated, {
  cancelAnimation,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BackButton } from '../../components';
import { calculateSpringPoint, Point, slackDecline } from './helper';
import * as theme from '../../theme';

const PLUG_RADIUS = 20;
const PLUG_SIZE = PLUG_RADIUS * 2;

interface GestureHandlerProps {
  point: SharedValue<Point>;
}

// Here we position a RN view above the Skia view (Plug), to control the component's gestures.
const GestureHandler: React.FC<GestureHandlerProps> = ({ point }) => {
  const panGesture = Gesture.Pan().onChange(e => {
    point.value = { x: e.absoluteX, y: e.absoluteY };
  });

  const style = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: PLUG_SIZE,
      height: PLUG_SIZE,
      transform: [
        { translateX: -PLUG_RADIUS },
        { translateY: -PLUG_RADIUS },
        { translateX: point.value.x },
        { translateY: point.value.y },
      ],
    };
  }, [point]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={style} />
    </GestureDetector>
  );
};

interface PlugProp {
  point: SharedValue<Point>;
}

// The gesture controllable end points
const Plug: React.FC<PlugProp> = ({ point }) => {
  const cx = useSharedValue(point.value.x);
  const cy = useSharedValue(point.value.y);

  useDerivedValue(() => {
    cx.value = point.value.x;
    cy.value = point.value.y;
  }, [point]);

  const circleProps = { cx, cy, r: PLUG_RADIUS };

  return (
    <Group>
      <Circle {...circleProps} color="dodgerblue" />
      <Circle
        {...circleProps}
        color="royalblue"
        style="stroke"
        strokeWidth={4}
      />
    </Group>
  );
};

/**
 * Create few different paths for the rope:
 * fill (main rope), stroke and the shadow
 */
const createPath = (
  point1: Point,
  point2: Point,
  slackPoint: Point,
  type: 'fill' | 'stroke' | 'shadow',
  dashPhase = 0.1,
) => {
  'worklet';
  const path = Skia.Path.Make();
  path.moveTo(point1.x, point1.y);
  path.quadTo(slackPoint.x, slackPoint.y, point2.x, point2.y);
  if (type === 'stroke') {
    path.dash(8, 10, dashPhase);
  }
  const width = type === 'fill' ? 6 : 2;
  path.stroke({ width, join: StrokeJoin.Round, cap: StrokeCap.Round });
  path.close();

  return path;
};

const RopeView: React.FC = () => {
  const window = useWindowDimensions();
  const isDarkMode = useColorScheme() === 'dark';
  const inset = useSafeAreaInsets();

  // This create a loop value constantly updating.
  // Used for stroke dashPhase animation and continuous spring calculation. Can also use 'useClock' for this.
  const loop = useSharedValue(50);
  useEffect(() => {
    loop.value = withRepeat(withTiming(50), -1, false);

    return () => cancelAnimation(loop);
  }, [loop]);

  // Plug end point Controllers
  const plug1 = useSharedValue<Point>({ x: 56, y: 156 });
  const plug2 = useSharedValue<Point>({ x: 356, y: 256 });

  // Current spring point
  const position = useSharedValue({ x: 0, y: 0 });

  // We calculate time passed since screen initialisation to perform rope stroke animation.
  const initialTime = useRef(Date.now());

  // Calculates new spring position
  const updatePath = () => {
    const midpoint = {
      x: (plug1.value.x + plug2.value.x) / 2,
      y: (plug1.value.y + plug2.value.y) / 2,
    };
    const slack = slackDecline(plug1.value, plug2.value);

    const anchor = { x: midpoint.x, y: midpoint.y + slack };

    const prevPos = position.value;
    const newPos = calculateSpringPoint(prevPos, anchor, 10, 8, 4);
    // This check here is needed to make the callback stop at some points, avoiding infinite callbacks even on no touch
    if (JSON.stringify(position.value) !== JSON.stringify(newPos)) {
      position.value = newPos;
    }
  };

  const paths = useDerivedValue(() => {
    runOnJS(updatePath)();

    const newPos = position.value;

    return {
      pathValue: createPath(plug1.value, plug2.value, newPos, 'fill'),
      shadowPathValue: createPath(
        plug1.value,
        plug2.value,
        { ...newPos, y: newPos.y + 50 },
        'shadow',
      ),
    };
  }, [plug1, plug2, position, updatePath]);

  // Rope path for Rope UI
  const pathValue = useDerivedValue(() => paths.value.pathValue, [paths]);

  // Rope Shadow path for Rope UI
  const shadowPathValue = useDerivedValue(
    () => paths.value.shadowPathValue,
    [paths],
  );

  // Rope Stroke path for Rope UI
  const dashPathValue = useDerivedValue(
    () =>
      createPath(
        plug1.value,
        plug2.value,
        position.value,
        'stroke',
        ((Date.now() - initialTime.current) / 1000) * -loop.value,
      ),
    // 'paths' isn't used, but needed to keep the dash path in sync with the main one
    [loop, plug1, plug2, position, paths],
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.rope(isDarkMode).bg }}>
      <StatusBar
        barStyle={`${isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={theme.rope(isDarkMode).bg}
      />

      <Canvas
        style={[
          { width: window.width, height: window.height },
          styles.container,
        ]}
      >
        <Plug point={plug1} />
        <Plug point={plug2} />

        {/* Rope */}
        <Path path={pathValue} color="dodgerblue" />
        {/* Glow effect */}
        <Path path={pathValue} color="dodgerblue">
          <BlurMask blur={6} style="outer" />
        </Path>
        {/* Stroke */}
        <Path path={dashPathValue} color="white" />
        {/* Shadow effect */}
        {!isDarkMode && (
          <Path path={shadowPathValue} color="darkgrey">
            <BlurMask blur={4} style="normal" />
          </Path>
        )}
      </Canvas>

      <GestureHandler point={plug1} />
      <GestureHandler point={plug2} />

      <BackButton style={{ position: 'absolute', top: inset.top }} />
    </View>
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

export default RopeView;
