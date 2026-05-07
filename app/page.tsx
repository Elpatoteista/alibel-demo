'use client';

import { useCallback } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { useCamera } from '@/hooks/useCamera';
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

  // When user activates camera: request media access + update sim state
  const handleActivateCamera = useCallback(async () => {
    activateCamera(); // move sim to cameraReady
    const ok = await startCamera();
    if (ok) {
      // small delay so video track is ready, then move to monitoring
      setTimeout(() => startMonitoring(), 400);
    }
  }, [activateCamera, startCamera, startMonitoring]);

  const handleReset = useCallback(() => {
    resetSimulation();
  }, [resetSimulation]);

  const handleFullReset = useCallback(() => {
    stopCamera();
    fullReset();
  }, [stopCamera, fullReset]);

  const isCritical = simState === 'criticalAlert' || simState === 'sendingAlert';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-1000 ${
        isCritical ? 'bg-[#0d0808]' : 'bg-[#0a0d0a]'
      }`}
    >
      <Header simState={simState} />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Status banner */}
        <StatusBanner simState={simState} />

        {/* Alert summary — shown when delivered */}
        {alertSummary && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <AlertSummary data={alertSummary} onDismiss={handleReset} />
          </div>
        )}

        {/* Main grid: camera (left/wide) + right sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT: Camera + Alert flow stacked */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <CameraPanel
              videoRef={videoRef}
              cameraStatus={cameraStatus}
              simState={simState}
              onActivateCamera={handleActivateCamera}
              onStartMonitoring={startMonitoring}
              onSimulateEMS={simulateEMS}
              onReset={handleReset}
            />
            <AlertFlow steps={alertSteps} />
          </div>

          {/* RIGHT: Telemetry sidebar */}
          <div className="xl:col-span-1">
            <TelemetryPanel data={telemetry} simState={simState} />

            {/* Full reset button */}
            {simState !== 'idle' && (
              <button
              onClick={handleFullReset}
              className="mt-4 w-full py-2 px-4 border text-xs font-medium rounded-lg transition-all duration-200"
              style={{ background: 'rgba(17,24,17,0.6)', borderColor: '#1f2d1f', color: '#64748b' }}
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
