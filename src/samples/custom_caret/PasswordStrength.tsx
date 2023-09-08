import React, { useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const MAX_LENGTH = 8;
const PAD = 12;

const PASS_COLORS = [
  'lightgrey',
  'red',
  'orange',
  'rosybrown',
  'darkseagreen',
  'royalblue',
];

const PASS_VALID_INTIAIL = {
  lowercase: false,
  uppercase: false,
  numeric: false,
  specialChar: false,
  minChar: false,
};

function checkpasswordStrength(value: string) {
  var strength = 0;
  let validity = { ...PASS_VALID_INTIAIL };
  if (value.length >= 8) {
    strength += 1;
    validity.minChar = true;
  }
  if (value.match(/[a-z]+/)) {
    strength += 1;
    validity.lowercase = true;
  }
  if (value.match(/[A-Z]+/)) {
    strength += 1;
    validity.uppercase = true;
  }
  if (value.match(/[0-9]+/)) {
    strength += 1;
    validity.numeric = true;
  }
  if (value.match(/[$@#&!]+/)) {
    strength += 1;
    validity.specialChar = true;
  }

  return { strength, validity };
}

const PasswordStrength = () => {
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    validity: { ...PASS_VALID_INTIAIL },
  });
  const [isInputFocused, setInputFocused] = useState(false);
  const [inputDimension, setInputDimension] = useState({ width: 0, height: 0 });
  const [caretPosition, setCaretPosition] = useState({ start: 0, end: 0 });

  const inputRef = useRef<TextInput>(null);

  const cursorOpacity = useSharedValue(1);
  const cursorX = useSharedValue(0);
  const tickState = useSharedValue(0);

  useEffect(() => {
    if (isInputFocused) {
      cursorOpacity.value = withRepeat(withTiming(0, { duration: 1000 }), -1);
      tickState.value = 0;
    } else {
      cursorOpacity.value = password.length > 0 ? 1 : 0;
    }

    return () => {
      cursorOpacity.value = 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, isInputFocused]);

  const cursorStyle = useAnimatedStyle(
    () => {
      let caretWidth = caretPosition.start < password.length ? 2 : 4;
      let caretPositionX = cursorX.value;
      if (!isInputFocused && password.length > 0) {
        caretWidth = inputDimension.height;
        caretPositionX = inputDimension.width - inputDimension.height;
      } else {
        // Getting some incorrect ~3 width with no text, so setting it 0 here
        if (password.length === 0 || caretPosition.start === 0) {
          caretPositionX = 0;
        }
      }

      return {
        width: withTiming(caretWidth),
        //   left: cursorX.value,
        transform: [
          {
            translateX: withTiming(
              caretPositionX,
              { duration: 250 },
              finished => {
                if (finished && !isInputFocused) {
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

  const caretFillStyle = useAnimatedStyle(() => {
    const fillPercent = (password.length / MAX_LENGTH) * 100;
    const caretFillHeight = (fillPercent / 100) * inputDimension.height;

    return {
      height: !isInputFocused ? inputDimension.height : caretFillHeight,
      backgroundColor: !isInputFocused
        ? passwordStrength.strength < 5
          ? 'red'
          : 'royalblue'
        : PASS_COLORS[passwordStrength.strength],
    };
  });

  const renderErrText = (
    error: string,
    valid: keyof typeof passwordStrength.validity,
  ) => {
    const color =
      isInputFocused || password.length === 0
        ? 'grey'
        : passwordStrength.validity[valid]
        ? 'royalblue'
        : 'red';

    return <Text style={{ color: color, fontWeight: '600' }}>{error}</Text>;
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.fieldTitle}>Password</Text>
          <Text style={{ color: 'darkgrey' }}>
            {password.length}/{MAX_LENGTH}
          </Text>
        </View>
        <View>
          <TextInput
            style={styles.nameInput}
            // autoFocus
            // react-native can't seem to show/hide caret on real time properly :(
            // caretHidden={caretPosition.start === name.length || name.length < MAX_LENGTH}
            caretHidden
            autoCapitalize="none"
            // secureTextEntry
            clearTextOnFocus={false}
            value={password}
            onChangeText={value => {
              setPassword(value);
              setPasswordStrength(checkpasswordStrength(value));
            }}
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
            ref={inputRef}
          />
          <Text style={{ fontSize: 11, color: 'grey', marginTop: 4 }}>
            Password must contain at least{' '}
            {renderErrText('one small', 'lowercase')}
            {' & '}
            {renderErrText('one capital', 'uppercase')}
            {' alphabet, '}
            {renderErrText('one numeric digit', 'numeric')}
            {', '}
            {renderErrText('one Special character', 'specialChar')}
            {' and be at least '}
            {renderErrText(`${MAX_LENGTH} characters long`, 'minChar')}
          </Text>
          <Animated.View
            style={[
              styles.cursor,
              { height: inputDimension.height },
              cursorStyle,
            ]}
          >
            <Animated.View style={[styles.tickContainer, caretFillStyle]}>
              <Animated.Text style={[styles.tickUnicode, tickAnim]}>
                {passwordStrength.strength === 5 ? '\u2713' : '\u2717'}
              </Animated.Text>
            </Animated.View>
          </Animated.View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            { opacity: pressed ? 0.4 : 1 },
          ]}
          onPress={() => inputRef.current?.blur()}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Submit</Text>
        </Pressable>
      </View>
      <View style={{ position: 'absolute', opacity: 0 }} pointerEvents="none">
        <TextInput
          //   secureTextEntry
          value={password.substring(0, caretPosition.start)}
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgrey',
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
  submitBtn: {
    backgroundColor: 'royalblue',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 8,
  },
});

export default PasswordStrength;
