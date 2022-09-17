// Main Rope component (Skia and Svg)
export interface RopeProps {
  unitsInfo: UnitInfoType;
  activeUnit: ActiveUnitInfo;
  onPlugged: (activeUnit: ActiveUnitInfo) => void;
}

export type UnitCoords = {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};
export type UnitInfoType = {
  inputUnits: UnitCoords[];
  outputUnits: UnitCoords[];
};

export type ActiveUnitInfo = {
  input: number;
  output: number;
  isGestureActive: boolean;
};

export type UnitDataInfo = {
  // For icons we SFIcons for iOS and Material Community Icons for Android
  icon: string;
  color: { fill: string; stroke: string; icon: string; iconFill: string };
  activeIcon?: string;
};
