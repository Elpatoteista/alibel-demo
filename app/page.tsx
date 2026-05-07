'use client';

import { useCallback, useRef } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { useCamera } from '@/hooks/useCamera';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from '@/components/Header';
import CameraPanel from '@/components/CameraPanel';
import TelemetryPanel from '@/components/TelemetryPanel';
import AlertFlow from '@/components/AlertFlow';
import AlertSummary from '@/components/AlertSummary';
import StatusBanner from '@/components/StatusBanner';
import InfoCards from '@/components/InfoCards';

export default function Home() {
  const {
    simState,
    alertSteps,
    telemetry,
    alertSummary,
    activateCamera,
    startMonitoring,
    simulateEMS,
    resetSimulation,
    fullReset,
  } = useSimulation();

  const { videoRef, cameraStatus, startCamera, stopCamera } = useCamera();

  const faceDetectionActive = cameraStatus === 'active' && !['idle', 'cameraReady'].includes(simState);
  const { faceBox, modelLoaded } = useFaceDetection(videoRef, faceDetectionActive);

  const handleActivateCamera = useCallback(async () => {
    activateCamera();
    const ok = await startCamera();
    if (ok) {
      setTimeout(() => startMonitoring(), 400);
    }
  }, [activateCamera, startCamera, startMonitoring]);

  const handleReset = useCallback(() => resetSimulation(), [resetSimulation]);

  const handleFullReset = useCallback(() => {
    stopCamera();
    fullReset();
  }, [stopCamera, fullReset]);

  const isCritical = simState === 'criticalAlert' || simState === 'sendingAlert';

  // Parallax effect for the background
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 150]);

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-1000 relative overflow-hidden"
      style={{ background: isCritical ? '#0d0808' : '#0a0d0a' }}
    >
      {/* Subtle parallax grid background */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          y: yBg,
          backgroundImage: 'linear-gradient(rgba(0,230,118,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,230,118,0.5) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      <Header simState={simState} />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 relative z-10">

        {/* Status banner */}
        <StatusBanner simState={simState} />

        {/* Alert summary when delivered */}
        {alertSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="mb-6"
          >
            <AlertSummary data={alertSummary} onDismiss={handleReset} />
          </motion.div>
        )}

        {/* Main grid */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* LEFT: Camera + Alert flow */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <CameraPanel
              videoRef={videoRef}
              cameraStatus={cameraStatus}
              simState={simState}
              faceBox={faceBox}
              modelLoaded={modelLoaded}
              onActivateCamera={handleActivateCamera}
              onStartMonitoring={startMonitoring}
              onSimulateEMS={simulateEMS}
              onReset={handleReset}
            />
            <AlertFlow steps={alertSteps} />
          </div>

          {/* RIGHT: Telemetry */}
          <div className="xl:col-span-1">
            <TelemetryPanel data={telemetry} simState={simState} />
            {simState !== 'idle' && (
              <button
                onClick={handleFullReset}
                className="mt-4 w-full py-2.5 px-4 border rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-70"
                style={{ background: 'rgba(17,24,17,0.6)', borderColor: '#1f2d1f', color: '#475569' }}
              >
                Reinicio completo del sistema
              </button>
            )}
          </div>
        </motion.div>

        {/* Info cards */}
        <InfoCards />
      </main>
    </div>
  );
}
