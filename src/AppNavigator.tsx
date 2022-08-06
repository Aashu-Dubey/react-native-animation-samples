import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScene from './home/HomeScene';
import Toolbar from './samples/custom_toolbar/Toolbar';
import ColorSwatch from './samples/color_swatch/ColorSwatch';
import GridMagnification from './samples/grid_magnification/GridMagnification';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home_scene" component={HomeScene} />
      <Stack.Screen name="animated_toolbar" component={Toolbar} />
      <Stack.Screen name="color_swatch" component={ColorSwatch} />
      <Stack.Screen name="grid_magnification" component={GridMagnification} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
