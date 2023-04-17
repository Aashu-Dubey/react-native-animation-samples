import React, { useEffect, useRef } from 'react';
import {
  StatusBar,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
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
import { BackButton } from '../../components';
import { calculateSpringPoint, Point, slackDecline } from './helper';
import * as theme from '../../theme';

const PLUG_RADIUS = 20;
const PLUG_SIZE = PLUG_RADIUS * 2;

interface GestureHandlerProps {
  point: SharedValue<Point>;
}

// Here we position a RN view above the SVG view (Plug), to control the component's gestures.
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
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={style} />
    </GestureDetector>
  );
};

const AnimatedGroup = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const RopeViewSvg: React.FC = () => {
  const window = useWindowDimensions();
  const isDarkMode = useColorScheme() === 'dark';
  const inset = useSafeAreaInsets();

  // Plug end point Controllers
  const plug1 = useSharedValue<Point>({ x: 56, y: 156 });
  const plug2 = useSharedValue<Point>({ x: 356, y: 256 });
  // curved point
  const quadPos = useSharedValue<Point>({ x: 0, y: 0 });

  // This create a loop value constantly updating.
  // Used for stroke dashPhase animation and continuous spring calculation.
  const loop = useSharedValue(50);
  useEffect(() => {
    loop.value = withRepeat(withTiming(50), -1, false);
  }, [loop]);

  // We calculate time passed since screen initialisation to perform rope stroke animation.
  const initialTime = useRef(Date.now());

  const plug1AnimatedProps = useAnimatedProps(() => ({ ...plug1.value }));

  const plug2AnimatedProps = useAnimatedProps(() => ({ ...plug2.value }));

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
  }, [plug1, plug2, quadPos, updatePath]);

  const fillPath = useAnimatedProps(() => {
    return { d: path.value };
  }, [path]);

  const strokePath = useAnimatedProps(() => {
    return {
      d: path.value,
      strokeDashoffset:
        ((Date.now() - initialTime.current) / 1000) * -loop.value,
    };
  }, [path, loop]);

  const renderPlug = (animatedProps: Animated.AnimateProps<GProps>) => (
    <AnimatedGroup animatedProps={animatedProps}>
      <Circle r={PLUG_RADIUS} fill="dodgerblue" />
      <Circle
        r={PLUG_RADIUS}
        stroke="royalblue"
        fill="transparent"
        strokeWidth={4}
      />
    </AnimatedGroup>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.rope(isDarkMode).bg }}>
      <StatusBar
        barStyle={`${isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={theme.rope(isDarkMode).bg}
      />

      <Svg height={window.height} width={window.width}>
        {renderPlug(plug1AnimatedProps)}
        {renderPlug(plug2AnimatedProps)}

        {/* Filled path */}
        <AnimatedPath
          animatedProps={fillPath}
          fill="transparent"
          stroke="dodgerblue"
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dashed stroke */}
        <AnimatedPath
          animatedProps={strokePath}
          fill="transparent"
          stroke="white"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={[8, 10]}
        />
      </Svg>

      <GestureHandler point={plug1} />
      <GestureHandler point={plug2} />

      <BackButton style={{ position: 'absolute', top: inset.top }} />
    </View>
  );
};

export default RopeViewSvg;
