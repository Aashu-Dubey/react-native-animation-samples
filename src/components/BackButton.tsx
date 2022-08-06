import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Config from '../Config';

interface Props {
  style?: StyleProp<ViewStyle>;
}

const BackButton: React.FC<Props> = ({ style }) => {
  const navigation = useNavigation();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.backBtn,
        { opacity: !Config.isAndroid && pressed ? 0.6 : 1 },
        style,
      ]}
      android_ripple={{ color: 'darkgrey', borderless: true, radius: 22 }}
      onPress={() => navigation.goBack()}
    >
      <Icon name="arrow-back-ios" size={18} color="white" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginLeft: 16,
    marginTop: 8,
    paddingLeft: 8, // To align icon in center
  },
});

export default BackButton;
