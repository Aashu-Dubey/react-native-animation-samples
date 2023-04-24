import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Easing,
  GestureResponderEvent,
  PanResponder,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { SFSymbol } from 'react-native-sfsymbols';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BUTTONS_LIST } from './buttons';
import { BackButton } from '../../components';
import Config from '../../Config';
import * as theme from '../../theme';

interface ButtonType {
  item: (typeof BUTTONS_LIST)[0];
  index: number;
  offset: Animated.Value;
  activeY: Animated.Value;
}

const ITEM_HEIGHT = 50 + 16; // 50 = icon height, 16 = top + bottom padding
const TOOLBAR_HEIGHT = ITEM_HEIGHT * 7 + 16; // 50 = button height, 7 = total visible items, 16 = main toolbar's top + bottom padding
const TOTAL_HEIGHT = ITEM_HEIGHT * BUTTONS_LIST.length + 16; // == 1600, BUTTONS_LIST.length === 24, 16 == top + bottom padding
const endScrollLimit = TOTAL_HEIGHT - TOOLBAR_HEIGHT;

const Button: React.FC<ButtonType> = ({ item, index, offset, activeY }) => {
  const itemEndPos = (index + 1) * ITEM_HEIGHT + 8;
  const itemStartPos = itemEndPos - ITEM_HEIGHT;

  const btnWidth = useRef(new Animated.Value(50));
  const translateX = useRef(new Animated.Value(0));
  const btnScale = useRef(new Animated.Value(1));
  const iconScale = useRef(new Animated.Value(1));
  const titleOpacity = useRef(new Animated.Value(0));
  const topForRb = useRef(new Animated.Value(0)); // rb == RubberBanding

  const isItemOutOfView = useRef(false);

  const scrollOffset = useRef(0);
  offset?.addListener(e => {
    scrollOffset.current = e.value;
    const isOut =
      itemEndPos < e.value || itemStartPos > e.value + TOOLBAR_HEIGHT;

    // For Scroll Rubberbanding effect
    if (e.value < 0) {
      topForRb.current.setValue((index + 1) * Math.abs(e.value / 10));
    } else if (e.value > endScrollLimit) {
      topForRb.current.setValue(
        -(BUTTONS_LIST.length - index + 1) *
          Math.abs((e.value - endScrollLimit) / 10),
      );
    } else if (e.value === 0 || e.value === endScrollLimit) {
      topForRb.current.setValue(0);
    }

    // If button's visibility changes in/out of the toolbar view, then animate the scaling, creating scrolling effect
    if (
      (isOut && !isItemOutOfView.current) ||
      (!isOut && isItemOutOfView.current)
    ) {
      isItemOutOfView.current = isOut;
      Animated.timing(btnScale.current, {
        toValue: isOut ? 0.4 : 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  });

  const isItemActive = useRef(false);

  activeY?.addListener(e => {
    const pressedPoint = e.value + scrollOffset.current;
    const isValid =
      e.value !== 0 &&
      pressedPoint >= itemStartPos &&
      pressedPoint < itemEndPos;

    if (
      (isValid && !isItemActive.current) ||
      (!isValid && isItemActive.current)
    ) {
      isItemActive.current = isValid;
      playAnimation();
    }
  });

  const playAnimation = () => {
    Animated.parallel([
      Animated.spring(btnWidth.current, {
        toValue: isItemActive.current ? 140 : 50,
        damping: 15,
        useNativeDriver: false,
      }),
      Animated.timing(translateX.current, {
        toValue: isItemActive.current ? 55 : 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(btnScale.current, {
        toValue: isItemActive.current ? 1.2 : 1,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(iconScale.current, {
        toValue: isItemActive.current ? 0.8 : 1,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(titleOpacity.current, {
        toValue: isItemActive.current ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    // Here the transform is applied to a separate view container, cause of an issue with rn-windows, so this is a workaround
    // details for the issue:- https://github.com/microsoft/react-native-windows/issues/8420
    // even though it still has some weird shifts to the nested views after transform, but it works.
    <Animated.View style={{ transform: [{ translateX: translateX.current }] }}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            width: btnWidth.current,
            transform: [{ scale: btnScale.current }],
            top: topForRb.current,
            backgroundColor: item.color,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: iconScale.current }] }}>
          {Config.isIos ? (
            <SFSymbol
              name={item.icon}
              weight="semibold"
              scale="large"
              color="white"
              size={20}
              resizeMode="center"
              multicolor={false}
              style={{ padding: 12 }}
            />
          ) : (
            <Icon name={item.icon} color="white" size={24} />
          )}
        </Animated.View>
        <Animated.Text
          style={[
            styles.buttonTitle,
            { opacity: titleOpacity.current },
            // Applying transform for Text on rn-macos throws error
            Config.isWindows && {
              // On Windows, the text after container scaling look too blurry & big, so just scaling it down
              transform: [{ scale: iconScale.current }],
            },
          ]}
          selectable={false} // To avoid drag conflict on web
        >
          {item.title}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

const ToolbarMacos = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const [isLongPressed, setLongPressed] = useState(false);

  const listRef = useRef<View | null>(null);
  const listViewOffset = useRef<number>(0);
  const longPressTimeout = useRef<number | null>(null);

  const activeY = useRef(new Animated.Value(0)).current;
  const scrollOffset = useRef(new Animated.Value(0)).current;

  const onTouchStart = useCallback(
    (e: GestureResponderEvent) => {
      const pageY = e.nativeEvent.pageY;
      longPressTimeout.current = setTimeout(() => {
        setLongPressed(() => true);
        activeY.setValue(pageY - listViewOffset.current);
      }, 200);
    },
    [activeY],
  );

  const onTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      // longPressTimeout.current && clearTimeout(longPressTimeout.current);
      if (isLongPressed) {
        isLongPressed &&
          activeY.setValue(e.nativeEvent.pageY - listViewOffset.current);
      }
    },
    [activeY, isLongPressed],
  );

  const onTouchEnd = useCallback(() => {
    longPressTimeout.current && clearTimeout(longPressTimeout.current);
    activeY.setValue(0);
    setLongPressed(() => false);
  }, [activeY]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: onTouchStart,
        onPanResponderMove: onTouchMove,
        onPanResponderRelease: onTouchEnd,
      }),
    [onTouchStart, onTouchMove, onTouchEnd],
  );

  let [panResponder, setPanResponder] = useState(pan);

  useEffect(() => {
    // Updating the pan gesture so that we can get latest value for isLongPressed is the callbacks
    setPanResponder(pan);
  }, [pan]);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.toolbar(isDarkMode).bg}
      />
      <SafeAreaView style={themeStyles(isDarkMode).container}>
        <BackButton />

        <View>
          <View
            style={[styles.toolbarView, themeStyles(isDarkMode).toolbarView]}
          />

          <View
            style={styles.buttonListView}
            // Here PanResponder is for web only, as even though it was working for all
            // but for mobile it was disabling the scroll for FlatList
            {...(Config.isWeb && panResponder.panHandlers)}
            // It is working fine for all platforms, except Web, where these touch event are not being detected
            {...{ onTouchStart, onTouchMove, onTouchEnd }}
            onTouchCancel={onTouchEnd}
            onLayout={() =>
              listRef.current?.measure((_x, _y, _w, _h, _pageX, pageY) => {
                // Adding the top inset, as layout measure doesn't consider the safe area in offset
                listViewOffset.current = pageY + insets.top;
              })
            }
            ref={listRef}
          >
            <Animated.FlatList
              contentContainerStyle={{ padding: 8 }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollOffset } } }],
                { useNativeDriver: false },
              )}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              canCancelContentTouches={!isLongPressed} // iOS only
              scrollEnabled={Config.isIos || !isLongPressed}
              data={BUTTONS_LIST}
              renderItem={({ item, index }) => (
                <Button offset={scrollOffset} {...{ item, index, activeY }} />
              )}
              keyExtractor={(item, index) => `${item.title}_${index}`}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  toolbarView: {
    width: 50 + 16,
    height: TOOLBAR_HEIGHT,
    backgroundColor: 'white',
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderRadius: 12,
    marginHorizontal: 24,
    marginVertical: 40,
    elevation: 32,
  },
  buttonListView: {
    position: 'absolute',
    height: TOOLBAR_HEIGHT,
    width: '100%',
    marginHorizontal: 24,
    marginVertical: 40,
    elevation: 32,
  },
  buttonContainer: {
    width: 50,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 8,
    padding: 13,
  },
  buttonTitle: {
    marginLeft: 12,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const themeStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.toolbar(isDarkMode).bg,
    },
    toolbarView: {
      backgroundColor: theme.toolbar(isDarkMode).bg,
      shadowColor: theme.toolbar(isDarkMode).shadow,
    },
  });

export default ToolbarMacos;
