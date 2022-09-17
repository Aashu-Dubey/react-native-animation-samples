import React from 'react';
import SamplesListView from './list/SamplesListView';
import { DEMOS } from '../models/demo';

const HomeScene: React.FC = () => {
  return (
    <SamplesListView
      title="RN Animation Samples"
      backEnabled={false}
      listData={DEMOS}
    />
  );
};

export default HomeScene;
