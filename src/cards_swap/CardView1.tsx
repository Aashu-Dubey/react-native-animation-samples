import React, { useState } from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { AppImages } from '../assets';

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

const CardView = () => {
  const activeItem = useSharedValue(2);
  const window = useWindowDimensions();

  const isDragging = useSharedValue(false);
  const position = useSharedValue({ x: 0, y: 0 });

  //   const [mainCard, setMainCard] = useState(AppImages.mac_bigsur_light);
  const mainCard = useSharedValue(AppImages.mac_bigsur_light);
  const bottomCardArr = useSharedValue([
    AppImages.mac_monterey,
    AppImages.mac_ventura,
    AppImages.mac_bigsur_dark,
  ]);

  const smallWidth = (window.width - 32 * 4) / 3;
  const smallHeight = smallWidth * 1.4;
  const expandedWidth = window.width - 64;
  const expandedHeight = expandedWidth * 1.4;

  const dragGesture = Gesture.Pan()
    .onStart(e => {
      isDragging.value = true;
      console.log('translatex', e);
      console.log(
        'e.x / (smallWidth + 32)',
        Math.trunc(e.x / (smallWidth + 32)),
      );

      activeItem.value = Math.trunc(e.x / smallWidth + 16);
    })
    .onUpdate(e => {
      isDragging.value = true;
      //   console.log('e velocuty', e.translationX, e.translationY);
      position.value = { x: e.translationX, y: e.translationY };
      //   activeY.value = e.y;
    })
    .onEnd(e => {
      isDragging.value = false;
      position.value = { x: 0, y: 0 };
      //   lastActiveItem.value = activeItem.value;
      //   activeItem.value = index;
      //   activeY.value = 0;

      //   mainCard.value = AppImages.mac_bigsur_dark;
      //   bottomCardArr.value[2] = AppImages.mac_bigsur_light;
    });

  const imgStyle = useAnimatedStyle(() => {
    const index = 2 * 2 + 1;
    return {
      transform: [
        {
          scale: withSpring(
            isDragging.value
              ? 1.2
              : activeItem.value === 2
              ? expandedWidth / smallWidth
              : 1,
          ),
        },
        {
          translateX: withSpring(
            isDragging.value
              ? position.value.x
              : activeItem.value === 2
              ? (smallWidth - 32 * index) / 2
              : 0,
          ),
        },
        {
          translateY: withSpring(
            isDragging.value
              ? position.value.y
              : activeItem.value === 2
              ? -((smallHeight + 48 + 4) / 2)
              : 0,
          ),
        },
      ],
    };
  });
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(
            activeItem.value === 2 ? smallWidth / expandedWidth : 1,
          ),
        },
        {
          translateX: withSpring(
            activeItem.value === 2
              ? -(expandedWidth + (smallWidth / 2 + 16)) +
                  (expandedWidth + smallWidth + 32) * activeItem.value
              : 0,
          ),
        },
        {
          translateY: withSpring(
            activeItem.value === 2
              ? expandedHeight * 2 + smallHeight * 2 + 48
              : 0,
          ),
        },
      ],
    };
  });

  const renderSmallCard = (img: ImageSourcePropType, index = 0) => (
    <AnimatedImageBackground
      key={index}
      style={[
        {
          height: smallWidth * 1.4,
          width: smallWidth,
          borderRadius: 8,
          margin: 16,
          overflow: 'hidden',
          // transform: [{ scale: 0.3 }],
          zIndex: 99,
        },
        index === activeItem.value && imgStyle,
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

  return (
    <SafeAreaView style={{}}>
      <View style={{ marginHorizontal: 16 }}>
        <AnimatedImageBackground
          style={[
            {
              height: expandedWidth * 1.4,
              width: expandedWidth,
              borderRadius: 24,
              marginVertical: 16,
              overflow: 'hidden',
              // transform: [
              //   { scale: smallWidth / expandedWidth },
              //   {
              //     translateX:
              //       -(expandedWidth + (smallWidth / 2 + 16)) +
              //       (expandedWidth + smallWidth + 32),
              //   },
              //   { translateY: expandedHeight * 2 + smallHeight * 2 + 48 },
              // ],
            },
            cardStyle,
          ]}
          source={AppImages.mac_bigsur_light}>
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
          <GestureDetector gesture={Gesture.Simultaneous(dragGesture)}>
            <View style={{ flexDirection: 'row' }}>
              {bottomCardArr.value.map((card, idx) =>
                renderSmallCard(card, idx),
              )}
            </View>
          </GestureDetector>
          {/* <GestureDetector gesture={Gesture.Simultaneous(dragGesture)}>
            {renderSmallCard(AppImages.mac_monterey, 0)}
          </GestureDetector>
          {renderSmallCard(AppImages.mac_ventura, 1)}
          {renderSmallCard(AppImages.mac_bigsur_dark, 2)} */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CardView;
