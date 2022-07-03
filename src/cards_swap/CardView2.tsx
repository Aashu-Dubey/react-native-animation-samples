import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppImages } from '../assets';

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

const CardView = () => {
  const window = useWindowDimensions();

  const activeItem = useSharedValue(0);
  const position = useSharedValue({ x: 0, y: 0 });

  const [mainCard, setMainCard] = useState(AppImages.mac_bigsur_light);
  const [bottomCardArr, setBottomCardArr] = useState([
    AppImages.mac_monterey,
    AppImages.mac_ventura,
    AppImages.mac_bigsur_dark,
  ]);

  const smallWidth = (window.width - 32 * 4) / 3;
  const smallHeight = smallWidth * 1.4;
  const expandedWidth = window.width - 64;
  const expandedHeight = expandedWidth * 1.4;

  useEffect(() => {
    activeItem.value = 0;
  }, [activeItem, mainCard]);

  const updateArr = cardArr => {
    cardArr[1] = AppImages.mac_bigsur_light;
    return [...cardArr];
  };

  const dragGesture = Gesture.Pan()
    .onStart(e => {
      activeItem.value = Math.trunc(e.x / (smallWidth + 16));
    })
    .onUpdate(e => {
      console.log('event', e);
      position.value = { x: e.translationX, y: e.translationY };
    })
    .onEnd(e => {
      position.value = { x: 0, y: 0 };
      // activeItem.value = 1;
      // runOnJS(setMainCard)(AppImages.mac_ventura);
      // runOnJS(setBottomCardArr)(updateArr);
    });

  const imgStyle = useAnimatedStyle(() => {
    const index = activeItem.value * 2 + 1;
    return {
      transform: [
        {
          scale:
            activeItem.value === 1
              ? withSpring(expandedWidth / smallWidth, undefined, () => {
                  // activeItem.value = 0;
                  runOnJS(setMainCard)(AppImages.mac_ventura);
                  runOnJS(setBottomCardArr)(updateArr);
                })
              : 1,
        },
        {
          translateX:
            activeItem.value === 1
              ? withSpring((smallWidth - 32 * index) / 2)
              : 0,
        },
        {
          translateY:
            activeItem.value === 1
              ? withSpring(-((smallHeight + 48 + 4) / 2))
              : 0,
        },
      ],
    };
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale:
            activeItem.value === 1 ? withSpring(smallWidth / expandedWidth) : 1,
        },
        {
          translateX:
            activeItem.value === 1
              ? withSpring(
                  -(expandedWidth + (smallWidth / 2 + 16)) +
                    (expandedWidth + smallWidth + 32) * activeItem.value,
                )
              : 0,
        },
        {
          translateY:
            activeItem.value === 1
              ? withSpring(expandedHeight * 2 + smallHeight * 2 + 48)
              : 0,
        },
      ],
    };
  });

  const renderSmallCard = (img: ImageSourcePropType, index = 0) => (
    <AnimatedImageBackground
      key={index}
      style={[
        {
          height: smallHeight,
          width: smallWidth,
          borderRadius: 8,
          margin: 16,
          overflow: 'hidden',
          // transform: [{ scale: 0.3 }],
          zIndex: 99,
        },
        index === 1 && imgStyle,
      ]}
      source={img}>
      <View
        style={{
          width: '100%',
          height: '100%',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 8,
          borderWidth: 4,
        }}
      />
    </AnimatedImageBackground>
  );

  const testX = useSharedValue(0);
  const testY = useSharedValue(0);
  const viewStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(
            interpolate(testX.value, [0, 50, 100], [0, 250, 0]),
          ),
        },
        { translateY: withSpring(testY.value) },
      ],
    };
  });

  return (
    <SafeAreaView>
      {/* <GestureDetector gesture={Gesture.Simultaneous(dragGesture)}>
        <View style={{ marginHorizontal: 16 }}>
          <Text>is baar toh karke rahunga</Text>
          <AnimatedImageBackground
            style={[
              {
                height: expandedHeight,
                width: expandedWidth,
                borderRadius: 24,
                marginVertical: 16,
                overflow: 'hidden',
              },
              cardStyle,
            ]}
            source={mainCard}>
            <View
              style={{
                width: '100%',
                height: '100%',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 24,
                borderWidth: 10,
              }}
            />
          </AnimatedImageBackground>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row' }}>
              {bottomCardArr.map((img, idx) => renderSmallCard(img, idx))}
            </View>
          </View>
        </View>
      </GestureDetector> */}

      <Pressable
        onPress={() => {
          testX.value = withTiming(testX.value === 100 ? 0 : 100, {
            duration: 500,
          });
          testY.value = withTiming(testY.value === 500 ? 0 : 500, {
            duration: 500,
          });
        }}>
        <Animated.View
          style={[
            {
              width: 100,
              height: 100,
              backgroundColor: 'grey',
              borderRadius: 50,
            },
            viewStyle,
          ]}
        />
      </Pressable>
    </SafeAreaView>
  );
};

export default CardView;
