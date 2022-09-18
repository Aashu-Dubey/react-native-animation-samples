import React, { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SFSymbol } from 'react-native-sfsymbols';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RopeViewSkia, RopeViewSvg } from '.';
import { BackButton } from '../../../components';
import { INPUT_UNITS, OUTPUT_UNITS, UNIT_SIZE } from './model';
import { ActiveUnitInfo, UnitDataInfo, UnitInfoType } from './types';
import Config from '../../../Config';
import * as theme from '../../../theme';

interface UnitViewProps {
  unit: UnitDataInfo;
  index: number;
  activeInput?: ActiveUnitInfo | null;
  onLayout: ((event: LayoutChangeEvent) => void) | undefined;
  getRef: React.LegacyRef<View> | undefined;
}

type UnitViewRefs = {
  input: Array<View | null>;
  output: Array<View | null>;
};

// Unit view showing on left and right indicating input and output
const UnitView: React.FC<UnitViewProps> = ({
  unit,
  index,
  activeInput,
  onLayout,
  getRef,
}) => {
  // Determine whether any output unit is active or not
  const isValidSelection = activeInput && !activeInput?.isGestureActive;
  const isActive = isValidSelection && activeInput?.output === index; // will be always false for Input units

  const activeUnit = isActive ? INPUT_UNITS[activeInput.input] : unit;

  return (
    <View
      style={[
        styles.unitContainer,
        {
          backgroundColor: activeUnit.color.fill,
          borderColor: activeUnit.color.stroke,
          marginBottom: index < INPUT_UNITS.length - 1 ? 12 : 0,
        },
      ]}
      onLayout={onLayout}
      ref={getRef}
    >
      <View>
        {/* SF Icons for iOS and Material Icons for Android */}
        {Config.isIos ? (
          <>
            <SFSymbol
              //   name="poweroutlet.type.f.fill" // iOS 16+
              name="house.circle.fill"
              weight="semibold"
              scale="large"
              color={activeUnit.color.icon}
              size={30}
              resizeMode="center"
              multicolor={false}
            />
            <SFSymbol
              // name="poweroutlet.type.f" // iOS 16+
              name="house.circle"
              weight="semibold"
              scale="large"
              color={activeUnit.color.iconFill}
              size={30}
              resizeMode="center"
              multicolor={false}
              style={{ ...StyleSheet.absoluteFillObject }}
            />
          </>
        ) : (
          <View style={{ alignSelf: 'center' }}>
            <Icon
              name="checkbox-blank-circle"
              color={activeUnit.color.icon}
              size={48}
            />
            <Icon
              style={{ ...StyleSheet.absoluteFillObject }}
              name="home-circle-outline"
              color={activeUnit.color.iconFill}
              size={48}
            />
          </View>
        )}
      </View>
      {Config.isIos ? (
        <SFSymbol
          name={isActive && unit.activeIcon ? unit.activeIcon : unit.icon}
          weight="semibold"
          scale="large"
          color="white"
          size={12}
          resizeMode="center"
          multicolor={false}
          style={[styles.unitSmallIcon, { padding: 12 }]}
        />
      ) : (
        <Icon
          style={styles.unitSmallIcon}
          name={isActive && unit.activeIcon ? unit.activeIcon : unit.icon}
          color="white"
          size={20}
        />
      )}
    </View>
  );
};

const PlugSocketsView = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const inset = useSafeAreaInsets();

  // to switch between Skia <---> SVG solution
  const [solutionSvg, SwitchSolution] = useState(false);

  // Current active input that we use to Activate the output unit with same theme
  const [activeUnit, setActiveUnit] = useState<ActiveUnitInfo>({
    input: 0,
    output: 0,
    isGestureActive: false,
  });

  // This stores the unit's coordinates (helpful to calculate plug position)
  const [unitsInfo, setUnitsInfo] = useState<UnitInfoType>({
    inputUnits: Array(INPUT_UNITS.length),
    outputUnits: Array(OUTPUT_UNITS.length),
  });

  // Here we store all the Unit's reference to get their actual position on the screen using 'measure' func, in 'onLayout'.
  const viewRefs = useRef<UnitViewRefs>({
    input: Array(INPUT_UNITS.length),
    output: Array(OUTPUT_UNITS.length),
  });

  return (
    <View
      style={[
        themeStyles(isDarkMode).container,
        { paddingTop: inset.top + 16 + 42 + 8 }, // 42 + 8 = back button height + paddingTop
      ]}
    >
      <StatusBar
        barStyle={`${isDarkMode ? 'light' : 'dark'}-content`}
        backgroundColor={theme.rope(isDarkMode).bg}
      />

      {/* Input and Output units */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          {INPUT_UNITS.map((unit, index) => (
            <UnitView
              key={`${unit.icon}_${index}`}
              {...{ unit, index }}
              onLayout={_e => {
                // 'measureInWindow' was for some reason, initially returning 0, so instead using 'measure'
                viewRefs.current.input[index]?.measure(
                  (_x, _y, _w, _h, pageX, pageY) =>
                    setUnitsInfo(units => {
                      units.inputUnits[index] = {
                        startX: pageX,
                        endX: pageX + UNIT_SIZE,
                        startY: pageY,
                        endY: pageY + UNIT_SIZE,
                      };
                      return { ...units };
                    }),
                );
              }}
              getRef={ref => (viewRefs.current.input[index] = ref)}
            />
          ))}
        </View>
        <View>
          {OUTPUT_UNITS.map((unit, index) => (
            <UnitView
              key={`${unit.icon}_${index}`}
              {...{ unit, index }}
              activeInput={activeUnit}
              onLayout={_e => {
                viewRefs.current.output[index]?.measure(
                  (_x, _y, _w, _h, pageX, pageY) =>
                    setUnitsInfo(units => {
                      units.outputUnits[index] = {
                        startX: pageX,
                        endX: pageX + UNIT_SIZE,
                        startY: pageY,
                        endY: pageY + UNIT_SIZE,
                      };
                      return { ...units };
                    }),
                );
              }}
              getRef={ref => (viewRefs.current.output[index] = ref)}
            />
          ))}
        </View>
      </View>

      {/* Rope View */}
      <View style={{ ...StyleSheet.absoluteFillObject }}>
        {unitsInfo.inputUnits?.[0] &&
          unitsInfo.outputUnits?.[0] &&
          (solutionSvg ? (
            <RopeViewSvg
              {...{ unitsInfo, activeUnit }}
              onPlugged={setActiveUnit}
            />
          ) : (
            <RopeViewSkia
              {...{ unitsInfo, activeUnit }}
              onPlugged={setActiveUnit}
            />
          ))}
      </View>

      {/* Header */}
      <View style={[styles.headerContainer, { top: inset.top + 8 }]}>
        <BackButton style={{ marginTop: 0 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[
              themeStyles(isDarkMode).headerText,
              solutionSvg && { color: 'grey' },
            ]}
          >
            Skia
          </Text>
          <Switch
            style={{ marginHorizontal: 8 }}
            trackColor={{ false: '#6EA7F9', true: '#6EA7F9' }}
            thumbColor="#2767FD"
            ios_backgroundColor="#6EA7F9"
            onValueChange={() => SwitchSolution(!solutionSvg)}
            value={solutionSvg}
          />
          <Text
            style={[
              themeStyles(isDarkMode).headerText,
              !solutionSvg && { color: 'grey' },
            ]}
          >
            SVG
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitContainer: {
    width: UNIT_SIZE,
    height: UNIT_SIZE,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
  unitSmallIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 8,
  },
});

const themeStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.rope(isDarkMode).bg,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.rope(isDarkMode).blackWhite,
    },
  });

export default PlugSocketsView;
