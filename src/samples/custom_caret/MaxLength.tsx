import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const MAX_LENGTH = 12;
const PAD = 12;

const MaxLength = () => {
  const [name, setName] = useState('');
  const [isInputFocused, setInputFocused] = useState(false);
  const [inputDimension, setInputDimension] = useState({ width: 0, height: 0 });
  const [caretPosition, setCaretPosition] = useState({ start: 0, end: 0 });

  const cursorOpacity = useSharedValue(1);
  const cursorX = useSharedValue(0);
  const tickState = useSharedValue(0);

  useEffect(() => {
    if (name.length < MAX_LENGTH) {
      if (isInputFocused) {
        cursorOpacity.value = withRepeat(withTiming(0, { duration: 1000 }), -1);
      } else {
        cursorOpacity.value = 0;
      }
    } else {
      cursorOpacity.value = 1;
    }

    if (name.length <= MAX_LENGTH - 1) {
      tickState.value = 0;
    }

    return () => {
      cursorOpacity.value = 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, isInputFocused]);

  const cursorStyle = useAnimatedStyle(
    () => {
      let caretWidth = caretPosition.start < name.length ? 2 : 4;
      let caretPositionX = cursorX.value;
      if (name.length === MAX_LENGTH) {
        caretWidth = inputDimension.height;
        caretPositionX = inputDimension.width - inputDimension.height;
      } else {
        // Getting some incorrect ~3 width with no text, so setting it 0 here
        if (name.length === 0 || caretPosition.start === 0) {
          caretPositionX = 0;
        }
      }

      return {
        width: withTiming(caretWidth),
        transform: [
          {
            translateX: withTiming(
              caretPositionX,
              { duration: 250 },
              finished => {
                if (finished && name.length === MAX_LENGTH) {
                  tickState.value = 1;
                }
              },
            ),
          },
        ],
        opacity: cursorOpacity.value,
      };
    },
    //   , [cursorX, cursorOpacity]
  );

  const tickAnim = useAnimatedStyle(() => {
    return {
      opacity: withSpring(tickState.value),
      transform: [{ scale: withSpring(tickState.value) }],
    };
  });

  const fillPercent = (name.length / MAX_LENGTH) * 100;
  const caretFillHeight = (fillPercent / 100) * inputDimension.height;

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.fieldTitle}>Username</Text>
          <Text style={{ color: 'darkgrey' }}>
            {name.length}/{MAX_LENGTH}
          </Text>
        </View>
        <View>
          <TextInput
            style={styles.nameInput}
            autoFocus
            // react-native can't seem to show/hide caret on real time properly :(
            // caretHidden={caretPosition.start === name.length || name.length < MAX_LENGTH}
            caretHidden
            autoCapitalize="none"
            maxLength={MAX_LENGTH}
            value={name}
            onChangeText={setName}
            onSelectionChange={e => setCaretPosition(e.nativeEvent.selection)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onLayout={event => {
              const layout = event.nativeEvent.layout;
              const H_PAD = PAD * 2;
              setInputDimension({
                width: layout.width - H_PAD,
                height: layout.height - H_PAD,
              });
            }}
          />
          <Animated.View
            style={[
              styles.cursor,
              { height: inputDimension.height },
              cursorStyle,
            ]}
          >
            <View style={[styles.tickContainer, { height: caretFillHeight }]}>
              <Animated.Text style={[styles.tickUnicode, tickAnim]}>
                &#x2713;
              </Animated.Text>
            </View>
          </Animated.View>
        </View>
      </View>
      <View style={{ position: 'absolute', opacity: 0 }} pointerEvents="none">
        <TextInput
          value={name.substring(0, caretPosition.start)}
          onLayout={event => {
            // Update cursor position, shouldn't extend input total width
            cursorX.value = Math.min(
              event.nativeEvent.layout.width,
              inputDimension.width,
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  fieldTitle: {
    color: 'grey',
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: 'lightgrey',
    padding: PAD,
    borderRadius: 12,
  },
  cursor: {
    position: 'absolute',
    backgroundColor: 'lightgrey',
    borderRadius: 16,
    margin: PAD,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  tickContainer: {
    width: '100%',
    backgroundColor: 'royalblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickUnicode: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default MaxLength;
