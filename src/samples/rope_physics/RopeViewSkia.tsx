import React, { useRef } from 'react';
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
  useValue,
  useComputedValue,
  Skia,
  Path,
  StrokeJoin,
  StrokeCap,
  useLoop,
  Circle,
  SkiaMutableValue,
  useSharedValueEffect,
  Group,
  BlurMask,
  // useClockValue,
} from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BackButton } from '../../components';
import { calculateSpringPoint, Point, slackDecline } from './helper';
import * as theme from '../../theme';

const PLUG_RADIUS = 20;
const PLUG_SIZE = PLUG_RADIUS * 2;

interface GestureHandlerProps {
  point: SkiaMutableValue<Point>;
}

// Here we position a RN view above the Skia view (Plug), to control the component's gestures.
const GestureHandler: React.FC<GestureHandlerProps> = ({ point }) => {
  const posX = useSharedValue<number>(point.current.x);
  const posY = useSharedValue<number>(point.current.y);

  const panGesture = Gesture.Pan().onChange(e => {
    posX.value = e.absoluteX;
    posY.value = e.absoluteY;
  });

  useSharedValueEffect(
    () => {
      point.current = { x: posX.value, y: posY.value };
    },
    posX,
    posY,
  );

  const style = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: PLUG_SIZE,
      height: PLUG_SIZE,
      transform: [
        { translateX: -PLUG_RADIUS },
        { translateY: -PLUG_RADIUS },
        { translateX: posX.value },
        { translateY: posY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={style} />
    </GestureDetector>
  );
};

interface PlugProp {
  point: SkiaMutableValue<Point>;
}

// The gesture controllable end points
const Plug: React.FC<PlugProp> = ({ point }) => {
  const cx = useValue(point.current.x);
  const cy = useValue(point.current.y);

  useComputedValue(() => {
    cx.current = point.current.x;
    cy.current = point.current.y;
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

// We may not need these initially
const path = createPath(
  { x: 56, y: 156 },
  { x: 356, y: 256 },
  { x: 56, y: 356 },
  'fill',
);

const dashedPath = createPath(
  { x: 56, y: 56 },
  { x: 356, y: 156 },
  { x: 56, y: 356 },
  'stroke',
);

const shadowPath = createPath(
  { x: 56, y: 56 },
  { x: 356, y: 156 },
  { x: 56, y: 356 + 50 },
  'shadow',
);

const RopeView: React.FC = () => {
  const window = useWindowDimensions();
  const isDarkMode = useColorScheme() === 'dark';
  const inset = useSafeAreaInsets();

  // Used for stroke dashPhase animation and continuous spring calculation. Can also use 'useClock' for this.
  const loop = useLoop();
  // const clock = useClockValue();

  // Current spring point
  const position = useValue({ x: 0, y: 0 });
  // Plug end point Controllers
  const plug1 = useValue<Point>({ x: 56, y: 156 });
  const plug2 = useValue<Point>({ x: 356, y: 256 });
  // rope, stroke and shadow path for Rope UI
  const pathValue = useValue(path);
  const dashPathValue = useValue(dashedPath);
  const shadowPathValue = useValue(shadowPath);

  // We calculate time passed since screen initialisation to perform rope stroke animation.
  const initialTime = useRef(Date.now());

  // Here we calculate the spring position based on the end points (Plugs)
  useComputedValue(() => {
    const midpoint = {
      x: (plug1.current.x + plug2.current.x) / 2,
      y: (plug1.current.y + plug2.current.y) / 2,
    };
    const slack = slackDecline(plug1.current, plug2.current);

    const anchor = { x: midpoint.x, y: midpoint.y + slack };
    const newPos = calculateSpringPoint(position.current, anchor, 10, 8, 4);

    if (JSON.stringify(position.current) !== JSON.stringify(newPos)) {
      pathValue.current = createPath(
        plug1.current,
        plug2.current,
        newPos,
        'fill',
      );
      shadowPathValue.current = createPath(
        plug1.current,
        plug2.current,
        { ...newPos, y: newPos.y + 50 },
        'shadow',
      );
      position.current = newPos;
    }

    // Rope Stroke
    dashPathValue.current = createPath(
      plug1.current,
      plug2.current,
      newPos,
      'stroke',
      ((Date.now() - initialTime.current) / 1000) * -50,
      // clock.current,
    );
  }, [loop /* clock */, plug1, plug2]);

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
