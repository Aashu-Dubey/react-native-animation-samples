import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Canvas,
  Skia,
  Path,
  StrokeJoin,
  StrokeCap,
  Circle,
  Group,
  BlurMask,
  interpolateColors,
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
import { calculateSpringPoint, Point, slackDecline } from '../helper';
import {
  COLOR_UNITS,
  PLUG_RADIUS,
  PLUG_SIZE,
  UNIT_SIZE,
  UNPLUG_COLORS,
} from './model';
import { ActiveUnitInfo, RopeProps, UnitCoords } from './types';

interface GestureHandlerProps {
  point: SharedValue<Point>;
  units: UnitCoords[];
  activeIndex: number;
  onGesture: (isActive: boolean, activeUnit: number) => void;
}

// Here we position a RN view above the Skia view (Plug), to control the component's gestures.
const GestureHandler: React.FC<GestureHandlerProps> = ({
  point,
  units,
  activeIndex,
  onGesture,
}) => {
  const activeUnit = useSharedValue(0);
  // keeps the track when switching Skia <---> SVG
  useDerivedValue(() => (activeUnit.value = activeIndex), [activeIndex]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onGesture)(true, activeUnit.value);
    })
    .onChange(e => {
      point.value = { x: e.absoluteX, y: e.absoluteY };
    })
    .onEnd(e => {
      // Here we check if plug position is within a socket (input or output)
      // if yes then update active output socket's UI based on that active input socket's theme
      const x = e.absoluteX;
      const y = e.absoluteY;
      let isWithinUnit = false;

      for (let i = 0; i < units.length; i++) {
        const unit = units[i];

        const isWithinX = x >= unit.startX && x <= unit.endX;
        const isWithinY = y >= unit.startY && y <= unit.endY;
        isWithinUnit = unit && isWithinX && isWithinY;

        if (isWithinUnit) {
          point.value = {
            x: unit.startX + UNIT_SIZE / 2,
            y: unit.startY + UNIT_SIZE / 2,
          };
          // activeUnit.value = i;
          runOnJS(onGesture)(false, i);
          return;
        }
      }

      const unit = units[activeUnit.value];

      if (unit && !isWithinUnit) {
        point.value = withTiming(
          { x: unit.startX + UNIT_SIZE / 2, y: unit.startY + UNIT_SIZE / 2 },
          undefined,
          () => runOnJS(onGesture)(false, activeUnit.value),
        );
      }
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
  activeUnit: ActiveUnitInfo;
}

// The gesture controllable end points
const Plug: React.FC<PlugProp> = ({ point, activeUnit }) => {
  const cx = useSharedValue(point.value.x);
  const cy = useSharedValue(point.value.y);

  useDerivedValue(() => {
    cx.value = point.value.x;
    cy.value = point.value.y;
  }, [point]);

  const color = COLOR_UNITS[activeUnit.input];
  const plugColor = activeUnit.isGestureActive
    ? UNPLUG_COLORS.stroke
    : color.icon;
  const plugStrokeColor = activeUnit.isGestureActive
    ? UNPLUG_COLORS.iconFill
    : color.iconFill;

  const circleProps = { cx, cy, r: PLUG_RADIUS };

  return (
    <Group>
      <Circle {...circleProps} color={plugColor} />
      <Circle
        {...circleProps}
        color={plugStrokeColor}
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

const RopeView: React.FC<RopeProps> = ({
  unitsInfo,
  activeUnit,
  onPlugged,
}) => {
  const window = useWindowDimensions();
  const isDarkMode = useColorScheme() === 'dark';

  // This create a loop value constantly updating.
  // Used for stroke dashPhase animation and continuous spring calculation. Can also use 'useClock' for this.
  const loop = useSharedValue(50);
  useEffect(() => {
    loop.value = withRepeat(withTiming(50), -1, false);

    return () => cancelAnimation(loop);
  }, [loop]);

  // Plug end point Controllers
  const plug1 = useSharedValue<Point>({
    x: unitsInfo.inputUnits[activeUnit.input].startX + UNIT_SIZE / 2,
    y: unitsInfo.inputUnits[activeUnit.input].startY + UNIT_SIZE / 2,
  });
  const plug2 = useSharedValue<Point>({
    x: unitsInfo.outputUnits[activeUnit.output].startX + UNIT_SIZE / 2,
    y: unitsInfo.outputUnits[activeUnit.output].startY + UNIT_SIZE / 2,
  });

  // Current spring point
  const position = useSharedValue({ x: 0, y: 0 });

  // Animates the rope's color change
  const colorAnim = useSharedValue(1);
  useEffect(() => {
    colorAnim.value = withTiming(activeUnit.isGestureActive ? 0 : 1, {
      duration: 400,
    });
  }, [activeUnit.isGestureActive, colorAnim]);

  // We calculate time passed since screen initialisation to perform rope stroke animation.
  const initialTime = useRef(Date.now());

  // Change Plug and Rope color based on the state
  const ropeColor = useDerivedValue(
    () =>
      interpolateColors(
        colorAnim.value,
        [0, 1],
        [UNPLUG_COLORS.iconFill, COLOR_UNITS[activeUnit.input].icon],
      ),
    [colorAnim, activeUnit],
  );

  const dashColor = useDerivedValue(
    () =>
      interpolateColors(
        colorAnim.value,
        [0, 1],
        [UNPLUG_COLORS.iconFill, 'white'],
      ),
    [colorAnim, activeUnit],
  );

  // Here we calculate the spring position based on the end points (Plugs)
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
    <View style={{ flex: 1 }}>
      <Canvas
        style={[
          { width: window.width, height: window.height },
          styles.container,
        ]}
      >
        <Plug point={plug1} {...{ activeUnit }} />
        <Plug point={plug2} {...{ activeUnit }} />

        {/* Rope */}
        <Path path={pathValue} color={ropeColor} />
        {/* Glow effect, inactive when gesture is active */}
        {!activeUnit.isGestureActive && (
          <Path path={pathValue} color="#fefefe">
            <BlurMask blur={6} style="outer" />
          </Path>
        )}
        {/* Stroke */}
        <Path path={dashPathValue} color={dashColor} />
        {/* Shadow effect */}
        {!isDarkMode && (
          <Path path={shadowPathValue} color="darkgrey">
            <BlurMask blur={4} style="normal" />
          </Path>
        )}
      </Canvas>

      <GestureHandler
        point={plug1}
        units={unitsInfo.inputUnits}
        activeIndex={activeUnit.input}
        onGesture={(isGestureActive, input) =>
          onPlugged({ ...activeUnit, input, isGestureActive })
        }
      />
      <GestureHandler
        point={plug2}
        units={unitsInfo.outputUnits}
        activeIndex={activeUnit.output}
        onGesture={(isGestureActive, output) =>
          onPlugged({ ...activeUnit, output, isGestureActive })
        }
      />
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
