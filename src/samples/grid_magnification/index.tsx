import React from 'react';
import { GRID_MAGNIFICATION } from '../../models/demo';
import { SamplesListView } from '../../screens';

export default () => (
  <SamplesListView title="Grid Magnification" listData={GRID_MAGNIFICATION} />
);

export { default as GridMagnification } from './GridMagnification';
export { default as GridMagnificationInitial } from './GridMagnificationInitial';
export { default as GridMagnificationSkia } from './GridMagnificationSkia';
