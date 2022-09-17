import React from 'react';
import { SamplesListView } from '../../screens';
import { ROPE_PHYSICS_DEMOS } from '../../models/demo';

const RopePhysics: React.FC = () => {
  return <SamplesListView title="Rope Physics" listData={ROPE_PHYSICS_DEMOS} />;
};

export default RopePhysics;
