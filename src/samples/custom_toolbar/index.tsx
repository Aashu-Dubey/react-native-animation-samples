import React from 'react';
import { SamplesListView } from '../../screens';
import { TOOLBAR } from '../../models/demo';

export default () => (
  <SamplesListView title="Animated Toolbar" listData={TOOLBAR} />
);

export { default as ToolbarReanimated } from './Toolbar';
export { default as ToolbarAnimated } from './ToolbarAnimated';
