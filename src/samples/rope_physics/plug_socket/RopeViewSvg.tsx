import React, { useEffect, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  createAnimatedPropAdapter,
  interpolateColor,
  processColor,
  runOnJS,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { G, Path, Circle, GProps } from 'react-native-svg';
import { calculateSpringPoint, Point, slackDecline } from '../helper';
import {
  COLOR_UNITS,
  PLUG_RADIUS,
  PLUG_SIZE,
  UNIT_SIZE,
  UNPLUG_COLORS,
} from './model';
import { RopeProps, UnitCoords } from './types';

interface GestureHandlerProps {
  point: SharedValue<Point>;
  units: UnitCoords[];
  activeIndex: number;
  onGesture: (isActive: boolean, activeUnit: number) => void;
}

type RopeColors = {
  rope: string;
  dash: string;
  plug: string;
  plugStroke: string;
};

// rn-svg: after v13.x.x to use 'fill' or 'stroke' with 'useAnimatedProps' we need to pass this adapter as argument
// ref: https://github.com/software-mansion/react-native-svg/issues/1845#issuecomment-1247836723
const animatedPropAdapter = createAnimatedPropAdapter(
  (props: any) => {
    if (Object.keys(props).includes('fill')) {
      props.fill = { type: 0, payload: processColor(props.fill) };
    }
    if (Object.keys(props).includes('stroke')) {
      props.stroke = { type: 0, payload: processColor(props.stroke) };
    }
  },
  ['fill', 'stroke'],
);

// Here we position a RN view above the SVG view (Plug), to control the component's gestures.
const GestureHandler: React.FC<GestureHandlerProps> = ({
  point,
  units,
  activeIndex,
  onGesture,
}) => {
  const posX = useSharedValue<number>(point.value.x);
  const posY = useSharedValue<number>(point.value.y);

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

  useDerivedValue(() => {
    point.value = { x: posX.value, y: posY.value };
  }, [posX, posY]);

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

const AnimatedGroup = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const RopeViewSvg: React.FC<RopeProps> = ({
  unitsInfo,
  activeUnit,
  onPlugged,
}) => {
  const window = useWindowDimensions();

  // Plug end point Controllers
  const plug1 = useSharedValue<Point>({
    x: unitsInfo.inputUnits[activeUnit.input].startX + UNIT_SIZE / 2,
    y: unitsInfo.inputUnits[activeUnit.input].startY + UNIT_SIZE / 2,
  });
  const plug2 = useSharedValue<Point>({
    x: unitsInfo.outputUnits[activeUnit.output].startX + UNIT_SIZE / 2,
    y: unitsInfo.outputUnits[activeUnit.output].startY + UNIT_SIZE / 2,
  });
  // curved point
  const quadPos = useSharedValue<Point>({ x: 0, y: 0 });

  // This create a loop value constantly updating.
  // Used for stroke dashPhase animation and continuous spring calculation.
  const loop = useSharedValue(50);
  useEffect(() => {
    loop.value = withRepeat(withTiming(50), -1, false);
  }, [loop]);

  // Animates the rope's color change
  const colorAnim = useDerivedValue(() =>
    withTiming(activeUnit.isGestureActive ? 0 : 1, { duration: 400 }),
  );

  // Change Plug and Rope color based on the state
  const colorsUtil = useDerivedValue<RopeColors>(() => {
    const color = COLOR_UNITS[activeUnit.input];

    return {
      rope: interpolateColor(
        colorAnim.value,
        [0, 1],
        [UNPLUG_COLORS.iconFill, color.icon],
      ),
      dash: interpolateColor(
        colorAnim.value,
        [0, 1],
        [UNPLUG_COLORS.iconFill, 'rgb(255, 255, 255)'], // Color keyword 'white' won't work here, so we must use rgb
      ),
      plug: activeUnit.isGestureActive ? UNPLUG_COLORS.stroke : color.icon,
      plugStroke: activeUnit.isGestureActive
        ? UNPLUG_COLORS.iconFill
        : color.iconFill,
    };
  }, [activeUnit]);

  // We calculate time passed since screen initialisation to perform rope stroke animation.
  const initialTime = useRef(Date.now());

  const plug1AnimatedProps = useAnimatedProps(() => ({ ...plug1.value }));

  const plug2AnimatedProps = useAnimatedProps(() => ({ ...plug2.value }));

  const plugAnimProps = useAnimatedProps(
    () => ({
      fill: colorsUtil.value.plug,
    }),
    [colorsUtil],
    animatedPropAdapter,
  );

  const plugStrokeAnimProps = useAnimatedProps(
    () => ({
      stroke: colorsUtil.value.plugStroke,
    }),
    [colorsUtil],
    animatedPropAdapter,
  );

  // Calculates new spring position
  const updatePath = () => {
    const midpoint = {
      x: (plug1.value.x + plug2.value.x) / 2,
      y: (plug1.value.y + plug2.value.y) / 2,
    };
    const slack = slackDecline(plug1.value, plug2.value);

    const anchor = { x: midpoint.x, y: midpoint.y + slack };

    const prevPos = quadPos.value;
    quadPos.value = calculateSpringPoint(prevPos, anchor, 10, 8, 4);
  };

  const path = useDerivedValue(() => {
    runOnJS(updatePath)();

    return `M${plug1.value.x} ${plug1.value.y} Q${quadPos.value.x},${quadPos.value.y} ${plug2.value.x},${plug2.value.y}`;
  }, [plug1, plug2, updatePath]);

  const fillPath = useAnimatedProps(
    () => ({ d: path.value, stroke: colorsUtil.value.rope }),
    [path, colorsUtil],
    animatedPropAdapter,
  );

  const strokePath = useAnimatedProps(
    () => ({
      d: path.value,
      stroke: colorsUtil.value.dash,
      strokeDashoffset:
        ((Date.now() - initialTime.current) / 1000) * -loop.value,
    }),
    [path, colorsUtil, loop],
    animatedPropAdapter,
  );

  const renderPlug = (animatedProps: Animated.AnimateProps<GProps>) => (
    <AnimatedGroup {...{ animatedProps }}>
      <AnimatedCircle animatedProps={plugAnimProps} r={PLUG_RADIUS} />
      <AnimatedCircle
        animatedProps={plugStrokeAnimProps}
        r={PLUG_RADIUS}
        fill="transparent"
        strokeWidth={4}
      />
    </AnimatedGroup>
  );

  return (
    <View style={{ flex: 1 }}>
      <Svg height={window.height} width={window.width}>
        {renderPlug(plug1AnimatedProps)}

        {renderPlug(plug2AnimatedProps)}

        {/* Filled path */}
        <AnimatedPath
          animatedProps={fillPath}
          fill="transparent"
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dashed stroke */}
        <AnimatedPath
          animatedProps={strokePath}
          fill="transparent"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={[8, 10]}
        />
      </Svg>

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

export default RopeViewSvg;
