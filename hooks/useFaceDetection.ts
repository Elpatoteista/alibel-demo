'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface FaceBox {
  x: number;      // 0-1 normalized (relative to video width)
  y: number;      // 0-1 normalized
  width: number;  // 0-1 normalized
  height: number; // 0-1 normalized
  confidence: number;
}

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean
) {
  const [faceBox, setFaceBox] = useState<FaceBox | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelRef = useRef<unknown>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(active);

  useEffect(() => { activeRef.current = active; }, [active]);

  // Load the BlazeFace model once
  useEffect(() => {
    if (modelLoaded) return;

    let cancelled = false;
    (async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        const blazeface = await import('@tensorflow-models/blazeface');
        const model = await blazeface.load();
        if (!cancelled) {
          modelRef.current = model;
          setModelLoaded(true);
        }
      } catch (e) {
        console.warn('BlazeFace model failed to load:', e);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detection loop
  useEffect(() => {
    if (!modelLoaded || !active) {
      cancelAnimationFrame(rafRef.current);
      if (!active) setFaceBox(null);
      return;
    }

    let lastDetection = 0;
    const INTERVAL = 120; // ms between detections (~8 fps) for performance

    const detect = async () => {
      if (!activeRef.current) return;

      const video = videoRef.current;
      const model = modelRef.current as { estimateFaces: (input: HTMLVideoElement, returnTensors: boolean) => Promise<Array<{ topLeft: number[], bottomRight: number[], probability: number[] }>> } | null;

      if (
        video &&
        model &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        Date.now() - lastDetection > INTERVAL
      ) {
        try {
          lastDetection = Date.now();
          const predictions = await model.estimateFaces(video, false);

          if (predictions.length > 0) {
            // Pick the largest face (most prominent)
            const best = predictions.reduce((a, b) => {
              const aArea = (a.bottomRight[0] - a.topLeft[0]) * (a.bottomRight[1] - a.topLeft[1]);
              const bArea = (b.bottomRight[0] - b.topLeft[0]) * (b.bottomRight[1] - b.topLeft[1]);
              return aArea > bArea ? a : b;
            });

            const vw = video.videoWidth;
            const vh = video.videoHeight;

            // Add some padding around the face for a better-looking box
            const padding = 0.15;
            const rawX = best.topLeft[0] / vw;
            const rawY = best.topLeft[1] / vh;
            const rawW = (best.bottomRight[0] - best.topLeft[0]) / vw;
            const rawH = (best.bottomRight[1] - best.topLeft[1]) / vh;

            setFaceBox({
              x: Math.max(0, rawX - rawW * padding / 2),
              y: Math.max(0, rawY - rawH * padding / 2),
              width:  Math.min(1, rawW + rawW * padding),
              height: Math.min(1, rawH + rawH * padding),
              confidence: best.probability?.[0] ?? 1,
            });
          } else {
            setFaceBox(null);
          }
        } catch (_) {
          // silently ignore per-frame errors
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafRef.current);
  }, [modelLoaded, active, videoRef]);

  return { faceBox, modelLoaded };
}
