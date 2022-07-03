import React, { useMemo } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppImages } from '../assets';

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

const CardItemView = ({ img, activeItem, lastActiveItem, itemsIdx, index }) => {
  const window = useWindowDimensions();

  const isDragging = useSharedValue(false);
  const position = useSharedValue({ x: 0, y: 0 });

  const smallWidth = (window.width - 32 * 4) / 3;
  const smallHeight = smallWidth * 1.4;
  const expandedWidth = window.width - 64;
  const expandedHeight = expandedWidth * 1.4;

  const itemState = useSharedValue(itemsIdx.value[index] !== 0 ? 1 : 0);

  /* const curItemIndex = useDerivedValue(() => {
    return itemsIdx[index];
  }, [itemsIdx]); */

  const dragGesture = Gesture.Pan()
    .onStart(_e => {
      // console.log('translatex', _e);
    })
    .onUpdate(e => {
      isDragging.value = true;
      // console.log('e velocuty', e.translationX, e.translationY);

      position.value = { x: e.translationX, y: e.translationY };
      //   activeY.value = e.y;
    })
    .onEnd(e => {
      // console.log('e velocuty', e.velocityX, e.translationX);
      isDragging.value = false;
      position.value = { x: 0, y: 0 };
      // lastActiveItem.value = activeItem.value;
      // activeItem.value = index;
      if (itemsIdx.value[index] !== 0) {
        itemsIdx.value[itemsIdx.value.indexOf(0)] = itemsIdx.value[index];
        itemsIdx.value[index] = 0;
      } else {
        if (e.translationY > 32) {
          const swapPos = Math.ceil(e.absoluteX / (window.width / 3));
          // console.log('before', swapPos, itemsIdx);
          const indexOfPosition = itemsIdx.value.indexOf(swapPos);
          itemsIdx.value[index] = itemsIdx.value[indexOfPosition];
          itemsIdx.value[indexOfPosition] = 0;
          // console.log('after', swapPos, itemsIdx);
        }
      }
      itemsIdx.value = [...itemsIdx.value];
      //   activeY.value = 0;
    });

  // const dragStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [
  //       { scale: withSpring(isDragging.value ? 1.2 : 1) },
  //       isDragging.value && { translateX: withSpring(position.value.x) },
  //       isDragging.value && { translateY: withSpring(position.value.y) },
  //     ],
  //   };
  // });

  const imgStyle = useAnimatedStyle(() => {
    // console.log('activeItem.value', itemsIdx.value, index);

    itemState.value = withTiming(itemsIdx.value[index] !== 0 ? 1 : 0, {
      duration: 200,
    });

    const finalX =
      -(expandedWidth + (smallWidth / 2 + 16)) +
      (expandedWidth + smallWidth + 32) * (itemsIdx.value[index] - 1);
    let endTransX = itemsIdx.value[index] !== 0 ? finalX : 0;
    // let endTransX = interpolate(itemState.value, [0, 1], [0, finalX]);
    /* if (lastActiveItem.value === index) {
      endTransX =
        -(expandedWidth + (smallWidth / 2 + 16)) +
        (expandedWidth + smallWidth + 32) * (activeItem.value - 1);
    } */
    const finalY = expandedHeight * 2 + smallHeight * 2 + 48;
    const endTransY = itemsIdx.value[index] !== 0 ? finalY : 0;
    // let endTransY = interpolate(itemState.value, [0, 1], [0, finalY]);

    // let endTransX = interpolate(endTransY, [0, finalY / 2, finalY], [0, itemsIdx.value[index] !== 0 ? finalX + (finalY) : -(finalX + (finalY)), finalX]);

    const scaleInterpolate = interpolate(
      // itemState.value,
      endTransY,
      [0, finalY],
      [1, smallWidth / expandedWidth],
    );

    return {
      // transform: [
      //   { scale: withSpring(isDragging.value ? 1.2 : 1) },
      //   { translateX: withSpring(position.value.x) },
      //   { translateY: withSpring(position.value.y) },
      // ],
      transform: [
        {
          scale: withSpring(
            // itemsIdx.value[index] !== 0 ? smallWidth / expandedWidth : 1,
            scaleInterpolate,
            { damping: 24, stiffness: 70 },
          ),
        },
        {
          translateX: withSpring(
            isDragging.value
              ? itemsIdx.value[index] === 0
                ? position.value.x
                : position.value.x / (smallWidth / expandedWidth) + endTransX
              : endTransX,
            // { damping: 16, mass: 0.8 },
            { stiffness: 50 },
          ),
        },
        {
          translateY: withSpring(
            isDragging.value
              ? itemsIdx.value[index] === 0
                ? position.value.y
                : position.value.y / (smallWidth / expandedWidth) + endTransY
              : endTransY,
            // { mass: 0.7 },
            { stiffness: 50 },
          ),
        },
      ],
      zIndex: isDragging.value ? 999 : 99,
    };
    // : {};
  });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(dragGesture)}>
      <AnimatedImageBackground
        style={[
          {
            position: 'absolute',
            height: expandedWidth * 1.4,
            width: expandedWidth,
            borderRadius: 24,
            marginVertical: 16,
            overflow: 'hidden',
            // transform: [
            // { scale: smallWidth / expandedWidth },
            // {
            //   translateX:
            //     -(expandedWidth + (smallWidth / 2 + 16)) +
            //     (expandedWidth + smallWidth + 32),
            // },
            // { translateY: 456.4 * 2 + 122.26666666666665 * 2 + 48 },
            // ],
          },
          // dragStyle,
          imgStyle,
        ]}
        source={img}>
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
    </GestureDetector>
  );
};

const CardView = () => {
  const activeItem = useSharedValue(0);
  const lastActiveItem = useSharedValue(1);

  const itemsIdx = useSharedValue([0, 1, 2, 3]);

  const cards = useMemo(
    () => [
      AppImages.mac_bigsur_light,
      AppImages.mac_monterey,
      AppImages.mac_ventura,
      AppImages.mac_bigsur_dark,
    ],
    [],
  );

  /* const smallWidth = (window.width - 32 * 4) / 3;
  const expandedWidth = window.width - 64; */

  /* const renderSmallCard = (img: ImageSourcePropType) => (
    <AnimatedImageBackground
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
        imgStyle,
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
  ); */

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{}}>
        <View style={{ marginHorizontal: 16 }}>
          {/* <View
        style={{
          height: (window.width - 64) * 1.4,
          width: window.width - 64,
          borderRadius: 24,
          marginVertical: 16,
          overflow: 'hidden',
          //   transform: [{ scale: 0.3 }],
        }}>
        <Image
          style={{ width: '100%', height: '100%' }}
          source={AppImages.mac_bigsur_light}
        />
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 24,
            borderWidth: 10,
          }}
        />
      </View> */}
          {/* <ImageBackground
          style={{
            height: expandedWidth * 1.4,
            width: expandedWidth,
            borderRadius: 24,
            marginVertical: 16,
            overflow: 'hidden',
            transform: [
              // { scale: smallWidth / expandedWidth },
              // {
              //   translateX:
              //     -(expandedWidth + (smallWidth / 2 + 16)) +
              //     (expandedWidth + smallWidth + 32),
              // },
              // { translateY: 456.4 * 2 + 122.26666666666665 * 2 + 48 },
            ],
          }}
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
        </ImageBackground>

        <View style={{ flexDirection: 'row' }}>
          {renderSmallCard(AppImages.mac_monterey)}
          <GestureDetector gesture={Gesture.Simultaneous(dragGesture)}>
            {renderSmallCard(AppImages.mac_ventura)}
          </GestureDetector>
          {renderSmallCard(AppImages.mac_bigsur_dark)}
        </View> */}

          {cards.map((img, idx) => (
            <CardItemView
              key={idx}
              // imgStyle={imgStyle}
              img={img}
              itemsIdx={itemsIdx}
              activeItem={activeItem}
              lastActiveItem={lastActiveItem}
              index={idx}
            />
          ))}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default CardView;
