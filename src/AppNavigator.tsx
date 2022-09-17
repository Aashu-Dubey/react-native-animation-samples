import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScene } from './screens';
import Toolbar from './samples/custom_toolbar/Toolbar';
import ColorSwatch from './samples/color_swatch/ColorSwatch';
import GridMagSamples, {
  GridMagnification,
  GridMagnificationInitial,
  GridMagnificationSkia,
} from './samples/grid_magnification';
import { RopePhysics, RopeViewSkia, RopeViewSvg } from './samples/rope_physics';
import { PlugBulbsView } from './samples/rope_physics/plug_socket';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home_scene" component={HomeScene} />
      {/* Demos */}
      <Stack.Group>
        <Stack.Screen name="animated_toolbar" component={Toolbar} />
        <Stack.Screen name="color_swatch" component={ColorSwatch} />

        <Stack.Group>
          <Stack.Screen name="grid_mag_samples" component={GridMagSamples} />
          <Stack.Screen
            name="grid_magnification"
            component={GridMagnification}
          />
          <Stack.Screen
            name="grid_magnification_initial"
            component={GridMagnificationInitial}
          />
          <Stack.Screen
            name="grid_magnification_skia"
            component={GridMagnificationSkia}
          />
        </Stack.Group>

        <Stack.Group>
          <Stack.Screen name="rope_physics" component={RopePhysics} />
          <Stack.Screen name="rope-skia" component={RopeViewSkia} />
          <Stack.Screen name="rope-svg" component={RopeViewSvg} />
          <Stack.Screen name="rope-sockets-demo" component={PlugBulbsView} />
        </Stack.Group>
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AppNavigator;
