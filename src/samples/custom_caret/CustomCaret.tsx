import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import MaxLength from './MaxLength';
import PasswordStrength from './PasswordStrength';
import { BackButton } from '../../components';

const CustomCaret = () => {
  return (
    <SafeAreaView style={styles.container}>
      <BackButton style={{ marginTop: 0, marginLeft: 12 }} />
      <View style={styles.inputContainer}>
        <MaxLength />
        <PasswordStrength />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputContainer: {
    padding: 24,
    gap: 16,
  },
});

export default CustomCaret;
