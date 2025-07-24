import { useState, useEffect } from 'react';
import * as THREE from 'three';

export const useVideoTexture = (url: string) => {
  const [video] = useState(() => {
    const v = document.createElement('video');
    v.src = url;
    v.crossOrigin = 'anonymous';
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    v.load();
    return v;
  });

  const [texture] = useState(() => new THREE.VideoTexture(video));

  useEffect(() => {
    void video.play();
  }, [video]);

  return texture;
};
