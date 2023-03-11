# Animated Toolbar

<a href="https://youtu.be/27pTWrcEDC4">
  <img alt="Animated toolbar in react-native" align="right" src="https://i.ytimg.com/vi/27pTWrcEDC4/maxresdefault.jpg" height="180px">
</a>

A Custom playful, interactive toolbar made in React Native with cool gesture based interruptible animations.

## 📽️ [Video](https://youtu.be/27pTWrcEDC4) | [Playlist](https://www.youtube.com/watch?v=27pTWrcEDC4&list=PLpnMM6hhRcchaS1uSpMZfAKYTxZWIlzzN&index=1)

- [Toolbar.tsx](./Toolbar.tsx):- Implementation using [reanimated](https://github.com/software-mansion/react-native-reanimated) & [gesture-handler](https://github.com/software-mansion/react-native-gesture-handler).
- [ToolbarAnimated.tsx](./ToolbarAnimated.tsx):- Implementation using built-in [Animated](https://reactnative.dev/docs/animations) and [Gesture APIs](https://reactnative.dev/docs/gesture-responder-system).

## 👀 This is how it looks

https://user-images.githubusercontent.com/46301285/174402436-43cdf090-443e-4022-85ba-1cfa93937dcb.mov

## ✨ Some features

1. Toolbar buttons expands on long click
2. After long press on any button, using gestures haptics play as you scrub through the items (No conflict with default list scrolling)
3. The items scale up/down as they become show/hide while scrolling.
4. Scroll Rubberbanding effect when scrolling past the top or bottom, which stretches the item's spacing out (works on iOS only)

## 📦 Packages used

1. [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler):- Long & Pan gesture to activate the items
2. [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated):- All the animation logic & also for scroll handler
3. [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons):- Google Material icons
4. [react-native-sfsymbols](https://github.com/birkir/react-native-sfsymbols):- Apple's SF Symbols (iOS only)

## 🌻 Motivation

Inspired by [this original iOS implementation](https://twitter.com/jmtrivedi/status/1517561485622321152) by [jtrivedi](https://github.com/jtrivedi).

## 🔗 Links

- **[YouTube Tutorial](https://youtu.be/27pTWrcEDC4)**
- **Demo: [twitter](https://twitter.com/aashudubey_ad/status/1539354978266935296) \| youtube [short 1](https://youtube.com/shorts/i7xw93xqkRE), [short 2](https://youtube.com/shorts/QMt18WcWyGw)**
