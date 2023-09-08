import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScene } from './screens';
import Toolbar, {
  ToolbarAnimated,
  ToolbarReanimated,
} from './samples/custom_toolbar';
import ColorSwatch from './samples/color_swatch/ColorSwatch';
import GridMagSamples, {
  GridMagnification,
  GridMagnificationInitial,
  GridMagnificationSkia,
  GridMagnifySkiaReanimated,
  GridMagnifySkiaWithSelector,
} from './samples/grid_magnification';
import { RopePhysics, RopeViewSkia, RopeViewSvg } from './samples/rope_physics';
import { PlugSocketsView } from './samples/rope_physics/plug_socket';
import CustomCaret from './samples/custom_caret/CustomCaret';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home_scene" component={HomeScene} />
      {/* Demos */}
      <Stack.Group>
        <Stack.Group>
          <Stack.Screen name="toolbar" component={Toolbar} />
          <Stack.Screen name="toolbar-animated" component={ToolbarAnimated} />
          <Stack.Screen
            name="toolbar-reanimated"
            component={ToolbarReanimated}
          />
        </Stack.Group>

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
          <Stack.Screen
            name="grid_magnify_skia_with_selectors"
            component={GridMagnifySkiaWithSelector}
          />
          <Stack.Screen
            name="grid_magnify_skia_reanimated"
            component={GridMagnifySkiaReanimated}
          />
        </Stack.Group>

        <Stack.Group>
          <Stack.Screen name="rope_physics" component={RopePhysics} />
          <Stack.Screen name="rope-skia" component={RopeViewSkia} />
          <Stack.Screen name="rope-svg" component={RopeViewSvg} />
          <Stack.Screen name="rope-sockets-demo" component={PlugSocketsView} />
        </Stack.Group>
        <Stack.Screen name="custom_caret" component={CustomCaret} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AppNavigator;
