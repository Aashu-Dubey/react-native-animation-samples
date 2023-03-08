import Config from '../../Config';

const COLORS = [
  'rgb(149, 135, 245)',
  'rgb(166, 210, 160)',
  'rgb(91, 139, 246)',
  'rgb(229, 168, 85)',
  'rgb(234, 125, 125)',
  'rgb(186, 134, 230)',
  'rgb(233, 198, 83)',
];

const ICONS = [
  Config.isIos ? 'scribble' : 'gesture',
  Config.isIos ? 'lasso' : 'voicemail',
  Config.isIos ? 'plus.bubble' : 'add-comment',
  Config.isIos ? 'wand.and.stars' : 'auto-fix-high',
  Config.isIos ? 'eyedropper' : 'colorize',
  Config.isIos ? 'rotate.3d' : '360',
  Config.isIos ? 'dial' : 'dialpad',
  Config.isIos ? 'perspective' : 'pie-chart-outlined',
];

export const BUTTONS_LIST = [
  { title: 'Draw', icon: ICONS[0], color: COLORS[0] },
  { title: 'Lasso', icon: ICONS[1], color: COLORS[1] },
  { title: 'Comment', icon: ICONS[2], color: COLORS[2] },
  { title: 'Enhance', icon: ICONS[3], color: COLORS[3] },
  { title: 'Picker', icon: ICONS[4], color: COLORS[4] },
  { title: 'Rotate', icon: ICONS[5], color: COLORS[5] },
  { title: 'Dial', icon: ICONS[6], color: COLORS[6] },
  { title: 'Graphic', icon: ICONS[7], color: COLORS[0] },

  { title: 'Draw', icon: ICONS[0], color: COLORS[1] },
  { title: 'Lasso', icon: ICONS[1], color: COLORS[2] },
  { title: 'Comment', icon: ICONS[2], color: COLORS[3] },
  { title: 'Enhance', icon: ICONS[3], color: COLORS[4] },
  { title: 'Picker', icon: ICONS[4], color: COLORS[5] },
  { title: 'Rotate', icon: ICONS[5], color: COLORS[6] },
  { title: 'Dial', icon: ICONS[6], color: COLORS[0] },
  { title: 'Graphic', icon: ICONS[7], color: COLORS[1] },

  { title: 'Draw', icon: ICONS[0], color: COLORS[2] },
  { title: 'Lasso', icon: ICONS[1], color: COLORS[3] },
  { title: 'Comment', icon: ICONS[2], color: COLORS[4] },
  { title: 'Enhance', icon: ICONS[3], color: COLORS[5] },
  { title: 'Picker', icon: ICONS[4], color: COLORS[6] },
  { title: 'Rotate', icon: ICONS[5], color: COLORS[0] },
  { title: 'Dial', icon: ICONS[6], color: COLORS[1] },
  { title: 'Graphic', icon: ICONS[7], color: COLORS[2] },
];
