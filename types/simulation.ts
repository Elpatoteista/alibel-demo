export type SimulationState =
  | 'idle'
  | 'cameraReady'
  | 'monitoring'
  | 'anomalyDetected'
  | 'validating'
  | 'criticalAlert'
  | 'sendingAlert'
  | 'delivered';

export type OperatorStatus = 'Normal' | 'Observación' | 'Evento crítico';

export type AlertStepStatus = 'pending' | 'active' | 'completed';

export interface AlertStep {
  id: string;
  label: string;
  description: string;
  status: AlertStepStatus;
}

export interface TelemetryData {
  operatorId: string;
  machineryId: string;
  location: string;
  movementLevel: number; // 0-100
  noResponseTime: number; // seconds
  monitoringStatus: string;
  alertSeverity: string;
  alertChannel: string;
  heartRateVariability: number;
  cabinTemp: string;
}

export interface AlertSummaryData {
  operatorId: string;
  operatorName: string;
  machineryId: string;
  location: string;
  eventTime: string;
  eventType: string;
  receptionStatus: string;
  recipients: string[];
}
