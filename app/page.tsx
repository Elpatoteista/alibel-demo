'use client';

import { useCallback } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { useCamera } from '@/hooks/useCamera';
import { useFaceDetection } from '@/hooks/useFaceDetection';
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

  // Face detection — active whenever camera is on and monitoring
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

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-1000"
      style={{ background: isCritical ? '#0d0808' : '#0a0d0a' }}
    >
      <Header simState={simState} />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">

        {/* Status banner */}
        <StatusBanner simState={simState} />

        {/* Alert summary when delivered */}
        {alertSummary && (
          <div className="mb-6 animate-in-scale">
            <AlertSummary data={alertSummary} onDismiss={handleReset} />
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
        </div>

        {/* Info cards */}
        <InfoCards />
      </main>
    </div>
  );
}
