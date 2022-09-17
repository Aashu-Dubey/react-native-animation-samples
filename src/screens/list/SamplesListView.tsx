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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ListItem from './ListItem';
import Config from '../../Config';
import { ListType } from '../../models/demo';
import * as theme from '../../theme';

interface Props {
  title: string;
  listData: ListType[];
  backEnabled?: boolean;
}

const SamplesListView: React.FC<Props> = ({
  title,
  listData,
  backEnabled = true,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const navigation = useNavigation();

  const inset = useSafeAreaInsets();

  const [isGrid, setGrid] = useState(false);

  const marginTop = !Config.isAndroid ? inset.top : 0;

  const renderIcon = (icon: string, onPress: () => void) => (
    <Pressable
      style={({ pressed }) => [
        {
          // marginLeft: 8,
          opacity: !Config.isAndroid && pressed ? 0.6 : 1,
        },
      ]}
      android_ripple={{ color: 'grey', radius: 20, borderless: true }}
      onPress={onPress}
    >
      <Icon name={icon} size={24} color={isDarkMode ? 'white' : 'black'} />
    </Pressable>
  );

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
        {backEnabled ? (
          renderIcon('arrow-back-ios', () => navigation.goBack())
        ) : (
          <View style={{ width: 32 }} />
        )}
        <Text style={themeStyles(isDarkMode).headerText}>{title}</Text>
        {renderIcon(isGrid ? 'dashboard' : 'view-agenda', () =>
          setGrid(!isGrid),
        )}
      </View>

      <FlatList
        key={isGrid ? 'G' : 'L'}
        style={{ paddingTop: 8, marginHorizontal: 6 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: inset.bottom }}
        data={listData}
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
      paddingHorizontal: 16,
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
  });

export default SamplesListView;
