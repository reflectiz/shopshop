import React from 'react';
import { TrackingProbe } from '../components/Trackers';

const CCPATrackersPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">CCPA Trackers Demo</h1>
      <p className="text-gray-700 mb-6">
        This page simulates tracker activity for CCPA testing and scanning.
      </p>

      <TrackingProbe />
    </div>
  );
};

export default CCPATrackersPage;
