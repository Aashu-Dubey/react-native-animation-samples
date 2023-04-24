import React, { useCallback, useEffect } from 'react';
import {
  Image,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Config from '../../Config';
import { DEMOS } from '../../models/demo';
import * as theme from '../../theme';

interface ListItemProps {
  data: ListRenderItemInfo<(typeof DEMOS)[0]>;
  isGrid: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ data, isGrid }) => {
  const { index, item } = data;

  const navigation = useNavigation<any>();
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  const widthWithoutInset = width - insets.left - insets.right;
  const itemWidth = isGrid
    ? (widthWithoutInset - 36) / 2
    : widthWithoutInset - 24;

  useEffect(() => {
    const easing = Easing.bezier(0.4, 0.0, 0.2, 1.0);

    translateY.value = withDelay(
      index * 200,
      withTiming(0, { duration: 1000, easing }),
    );
    opacity.value = withDelay(
      index * 200,
      withTiming(1, { duration: 1000, easing }),
    );
  }, [index, translateY, opacity]);

  const viewStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const onSamplePressed = useCallback(
    () => item.screenName && navigation.navigate(item.screenName),
    [item, navigation],
  );

  const renderGridView = () => (
    <Animated.View
      style={[
        {
          width: itemWidth,
          height: itemWidth,
          margin: 6,
          borderRadius: 8,
          overflow: 'hidden',
        },
        viewStyle,
      ]}
    >
      <Image
        style={styles.gridItemImage}
        source={item.background}
        resizeMode="cover"
      />

      <Pressable
        style={({ pressed }) => [
          styles.gridItemPressable,
          { opacity: !Config.isAndroid && pressed ? 0.8 : 1 },
        ]}
        android_ripple={{ color: 'rgba(128,128,128,0.3)' }}
        onPress={onSamplePressed}
      >
        <Text style={styles.gridItemTitle}>{item.name}</Text>
      </Pressable>
    </Animated.View>
  );

  const renderListView = () => (
    <Animated.View
      style={[
        themeStyles(isDarkMode).listItemContainer,
        { width: itemWidth },
        viewStyle,
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          {
            width: itemWidth,
            flexDirection: 'row',
            padding: 8,
            opacity: !Config.isAndroid && pressed ? 0.8 : 1,
          },
        ]}
        android_ripple={{ color: 'rgba(128,128,128,0.3)' }}
        onPress={onSamplePressed}
      >
        <Image
          style={styles.listItemImage}
          source={item.background}
          resizeMode="cover"
        />
        <View style={{ padding: 8, flex: 1 }}>
          <Text style={themeStyles(isDarkMode).listItemTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={themeStyles(isDarkMode).listItemDesc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );

  return isGrid ? renderGridView() : renderListView();
};

const styles = StyleSheet.create({
  // List Item Grid
  gridItemImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
  gridItemPressable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 4,
  },
  gridItemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  // List Item vertical
  listItemImage: {
    width: 80,
    height: 80,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgrey',
  },
});

const themeStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    listItemContainer: {
      backgroundColor: theme.home(isDarkMode).listItemBg,
      borderRadius: 8,
      margin: 4,
      marginVertical: 8,
      overflow: Config.isAndroid ? 'hidden' : 'visible',
      shadowColor: theme.home(isDarkMode).shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 16,
    },
    listItemTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.home(isDarkMode).itemTextColor,
    },
    listItemDesc: {
      fontSize: 12,
      color: theme.home(isDarkMode).itemDescColor,
      paddingVertical: 4,
    },
  });

export default ListItem;
