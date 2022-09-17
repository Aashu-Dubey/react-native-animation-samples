import React, { useRef } from 'react';
import {
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
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
  Selector,
  PathDef,
  interpolateColors,
  useTiming,
  SkiaValue,
} from '@shopify/react-native-skia';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
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
import { RopeProps, UnitCoords } from './types';

type RopeColors = {
  rope: string | Float32Array;
  dash: string | Float32Array;
  plug: string;
  plugStroke: string;
};

interface GestureHandlerProps {
  point: SkiaMutableValue<Point>;
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
  const posX = useSharedValue<number>(point.current.x);
  const posY = useSharedValue<number>(point.current.y);

  const activeUnit = useSharedValue(0);
  // keeps the track when switching Skia <---> SVG
  useDerivedValue(() => (activeUnit.value = activeIndex), [activeIndex]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onGesture)(true, activeUnit.value);
    })
    .onChange(e => {
      posX.value = e.absoluteX;
      posY.value = e.absoluteY;
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
          posX.value = unit.startX + UNIT_SIZE / 2;
          posY.value = unit.startY + UNIT_SIZE / 2;
          // activeUnit.value = i;
          runOnJS(onGesture)(false, i);
          return;
        }
      }

      const unit = units[activeUnit.value];
      if (unit && !isWithinUnit) {
        posX.value = withTiming(unit.startX + UNIT_SIZE / 2);
        posY.value = withTiming(unit.startY + UNIT_SIZE / 2, undefined, () =>
          runOnJS(onGesture)(false, activeUnit.value),
        );
      }
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
  colorsUtil: SkiaValue<RopeColors>;
}

// The gesture controllable end points
const Plug: React.FC<PlugProp> = ({ point, colorsUtil }) => {
  const cx = useValue(point.current.x);
  const cy = useValue(point.current.y);

  useComputedValue(() => {
    cx.current = point.current.x;
    cy.current = point.current.y;
  }, [point]);

  const circleProps = { cx, cy, r: PLUG_RADIUS };

  return (
    <Group>
      <Circle {...circleProps} color={Selector(colorsUtil, c => c.plug)} />
      <Circle
        {...circleProps}
        color={Selector(colorsUtil, c => c.plugStroke)}
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

const RopeView: React.FC<RopeProps> = ({
  unitsInfo,
  activeUnit,
  onPlugged,
}) => {
  const window = useWindowDimensions();
  const isDarkMode = useColorScheme() === 'dark';

  // Used for stroke dashPhase animation and continuous spring calculation. Can also use 'useClock' for this.
  const loop = useLoop();
  // const clock = useClockValue();

  // Current spring point
  const position = useValue({ x: 0, y: 0 });
  // Plug end point Controllers
  const plug1 = useValue<Point>({
    x: unitsInfo.inputUnits[activeUnit.input].startX + UNIT_SIZE / 2,
    y: unitsInfo.inputUnits[activeUnit.input].startY + UNIT_SIZE / 2,
  });
  const plug2 = useValue<Point>({
    x: unitsInfo.outputUnits[activeUnit.output].startX + UNIT_SIZE / 2,
    y: unitsInfo.outputUnits[activeUnit.output].startY + UNIT_SIZE / 2,
  });
  // rope, stroke and shadow path for Rope UI
  const pathValue = useValue<PathDef>('');
  const dashPathValue = useValue<PathDef>('');
  const shadowPathValue = useValue<PathDef>('');

  // Animates the rope's color change
  const colorAnim = useTiming(activeUnit.isGestureActive ? 0 : 1, {
    duration: 400,
  });

  // We calculate time passed since screen initialisation to perform rope stroke animation.
  const initialTime = useRef(Date.now());

  // Change Plug and Rope color based on the state
  const colorsUtil = useComputedValue<RopeColors>(() => {
    const color = COLOR_UNITS[activeUnit.input];

    return {
      rope: interpolateColors(
        colorAnim.current,
        [0, 1],
        [UNPLUG_COLORS.iconFill, color.icon],
      ),
      dash: interpolateColors(
        colorAnim.current,
        [0, 1],
        [UNPLUG_COLORS.iconFill, 'white'],
      ),
      plug: activeUnit.isGestureActive ? UNPLUG_COLORS.stroke : color.icon,
      plugStroke: activeUnit.isGestureActive
        ? UNPLUG_COLORS.iconFill
        : color.iconFill,
    };
  }, [colorAnim, activeUnit]);

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
    <View style={{ flex: 1 }}>
      <Canvas
        style={[
          { width: window.width, height: window.height },
          styles.container,
        ]}
      >
        <Plug point={plug1} {...{ colorsUtil }} />
        <Plug point={plug2} {...{ colorsUtil }} />

        {/* Rope */}
        <Path path={pathValue} color={Selector(colorsUtil, c => c.rope)} />
        {/* Glow effect, inactive when gesture is active */}
        {!activeUnit.isGestureActive && (
          <Path path={pathValue} color="#fefefe">
            <BlurMask blur={6} style="outer" />
          </Path>
        )}
        {/* Stroke */}
        <Path path={dashPathValue} color={Selector(colorsUtil, c => c.dash)} />
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
