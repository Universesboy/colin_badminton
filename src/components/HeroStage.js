import React, { Component, Suspense, lazy, useCallback, useState } from 'react';
import { sceneTier } from './useMotionPrefs';

const CourtScene = lazy(() => import('./CourtScene'));
const HeroScene3D = lazy(() => import('./HeroScene3D'));

// Any failure inside the WebGL scene falls back to the 2D court
class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function HeroStage({ className }) {
  const [tier, setTier] = useState(() => (typeof window === 'undefined' ? 'static' : sceneTier()));
  const fallback = useCallback(() => setTier('2d'), []);

  return (
    <Suspense fallback={null}>
      {tier === '3d' ? (
        <SceneBoundary onError={fallback}>
          <HeroScene3D className={className} onFallback={fallback} />
        </SceneBoundary>
      ) : (
        <CourtScene className={className} />
      )}
    </Suspense>
  );
}

export default HeroStage;
