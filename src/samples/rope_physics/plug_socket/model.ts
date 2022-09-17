import Config from '../../../Config';
import { UnitDataInfo } from './types';

export const PLUG_RADIUS = 20;
export const PLUG_SIZE = PLUG_RADIUS * 2;

export const UNIT_SIZE = 120;

export const COLOR_UNITS = [
  {
    fill: 'rgb(110, 167, 249)',
    stroke: 'rgb(39, 93, 223)',
    icon: 'rgb(39, 103, 253)',
    iconFill: 'rgb(28, 69, 195)',
  },
  {
    fill: 'rgb(235, 126, 140)',
    stroke: 'rgb(213, 57, 42)',
    icon: 'rgb(213, 90, 72)',
    iconFill: 'rgb(190, 42, 30)',
  },
  {
    fill: 'rgb(240, 188, 111)',
    stroke: 'rgb(216, 129, 47)',
    icon: 'rgb(216, 149, 67)',
    iconFill: 'rgb(191, 105, 38)',
  },
];

export const UNPLUG_COLORS = {
  fill: 'rgb(167, 167, 174)',
  stroke: 'rgb(116, 114, 122)',
  icon: 'rgb(116, 124, 142)',
  iconFill: 'rgb(93, 90, 95)',
};

export const INPUT_UNITS: UnitDataInfo[] = [
  { icon: Config.isIos ? 'drop.fill' : 'water', color: COLOR_UNITS[0] },
  {
    icon: Config.isIos ? 'flame.fill' : 'fire',
    color: COLOR_UNITS[1],
  },
  {
    icon: Config.isIos ? 'bolt.fill' : 'lightning-bolt',
    color: COLOR_UNITS[2],
  },
];

export const OUTPUT_UNITS: UnitDataInfo[] = [
  {
    icon: Config.isIos ? 'lightbulb' : 'lightbulb-outline', // lightbulb.2.fill, iOS 16+
    color: UNPLUG_COLORS,
    activeIcon: Config.isIos ? 'lightbulb.fill' : 'lightbulb',
  },
  {
    icon: Config.isIos ? 'flashlight.off.fill' : 'flashlight-off', // spigot.fill, iOS 16+
    color: UNPLUG_COLORS,
    activeIcon: Config.isIos ? 'flashlight.on.fill' : 'flashlight',
  },
  {
    icon: Config.isIos ? 'printer' : 'printer-outline', // stove.fill, iOS 16+
    color: UNPLUG_COLORS,
    activeIcon: Config.isIos ? 'printer.fill' : 'printer',
  },
];
