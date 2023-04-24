# Grid Magnification Effect

A grid list view that displays Magnify effect on long press & drag, focusing on the items near the touch area within a radius.

- [GridMagnificationInitial.tsx](./GridMagnificationInitial.tsx):- Initial implementation that I tried replicating this [demo](https://twitter.com/philipcdavis/status/1549416537789845506).
- [GridMagnification.tsx](./GridMagnification.tsx):- Mostly same in logic with the initial one, but here the interaction results in kind of a Bubble Magnifying effect replicating this [demo](https://twitter.com/philipcdavis/status/1549409119131488256), also using static app icons.

### [rn-skia](https://github.com/Shopify/react-native-skia) implementations

- [GridMagnificationSkia.tsx](./GridMagnificationSkia.tsx):- Reimplementing the same using RN-Skia provided components and APIs.
- [GridMagnifySkiaWithSelectors.tsx](./GridMagnifySkiaWithSelector.tsx):- Using RN-Skia with a more recommended approach with cobination of computedValues & Selectors.
- [GridMagnifySkiaReanimated.tsx](./GridMagnifySkiaReanimated.tsx): Using RN-Skia with [reanimated](https://github.com/software-mansion/react-native-reanimated) for animations

## 👀 This is how it looks

https://user-images.githubusercontent.com/46301285/183157173-e9e98fff-7ff0-42e4-a4ce-eaf5f36b1328.mp4

## 📦 Packages used

1. [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler):- To track user gestures
2. [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated):- To Animate the Grid items with respect to the user's gestures.
3. [@shopify/react-native-skia](https://github.com/Shopify/react-native-skia):- To Reimplement same effect using RN-Skia provided components and gesture & Animation APIs.

## 🗒 TODOs

1. Improve performance, especially on Android.
2. Fix and improve Skia implementation

## 🌻 Motivation

Inspired by [this original SwiftUI implementation](https://twitter.com/philipcdavis/status/1549409119131488256) by [@philipcdavis](https://twitter.com/philipcdavis).

## 🔗 Links

- [Flutter Grid Magnification](https://github.com/Aashu-Dubey/flutter-samples/tree/main/lib/samples/animations/grid_magnification): Flutter implementation of the same demo.
- [Twitter Post](https://twitter.com/aashudubey_ad/status/1553434985620656128)
