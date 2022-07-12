import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ListItem from './ListItem';
import Config from '../Config';
import { DEMOS } from './models/demo';
import * as theme from '../theme';

const HomeScene: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const inset = useSafeAreaInsets();

  const [isGrid, setGrid] = useState(false);

  const marginTop = !Config.isAndroid ? inset.top : 0;

  return (
    <SafeAreaView
      style={themeStyles(isDarkMode).container}
      edges={['left', 'right']}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.home(isDarkMode).headerBg}
      />

      <View
        style={[
          themeStyles(isDarkMode).headerContainer,
          { height: 52 + marginTop, paddingTop: marginTop + 8 },
        ]}
      >
        <View style={{ width: 32 }} />
        <Text style={themeStyles(isDarkMode).headerText}>
          RN Animation Samples
        </Text>
        <Pressable
          style={({ pressed }) => [
            {
              marginRight: 8,
              opacity: !Config.isAndroid && pressed ? 0.6 : 1,
            },
          ]}
          android_ripple={{ color: 'grey', radius: 20, borderless: true }}
          onPress={() => setGrid(!isGrid)}
        >
          <Icon
            name={isGrid ? 'dashboard' : 'view-agenda'}
            size={24}
            color={isDarkMode ? 'white' : 'black'}
          />
        </Pressable>
      </View>

      <FlatList
        key={isGrid ? 'G' : 'L'}
        style={{ paddingTop: 8, marginHorizontal: 6 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: inset.bottom }}
        data={DEMOS}
        keyExtractor={item => item.name}
        numColumns={isGrid ? 2 : 1}
        renderItem={data => <ListItem data={data} isGrid={isGrid} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const themeStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.home(isDarkMode).headerBg },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      backgroundColor: theme.home(isDarkMode).headerBg,
      borderColor: theme.home(isDarkMode).borderColor,
    },
    headerText: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      textAlignVertical: 'center',
      color: isDarkMode ? 'white' : 'black',
    },
    listItemContainer: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#252525' : 'white',
      padding: 8,
      borderRadius: 8,
      shadowColor: isDarkMode ? 'rgb(128, 128, 128, 0.6)' : 'grey',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    listItemTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? 'white' : 'black',
    },
    listItemDesc: {
      fontSize: 12,
      color: isDarkMode ? 'whitesmoke' : 'grey',
      paddingVertical: 4,
    },
  });

export default HomeScene;
