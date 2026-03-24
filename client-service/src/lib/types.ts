export type MonitorStatus = "UP" | "DOWN" | "UNKNOWN";

export interface Monitor {
  id: number;
  url: string;
  status: MonitorStatus;
  sslStatus: string;
  sslExpiresAt: string | null;
  lastCheckedAt: string | null;
  emailSent: boolean;
  latency: number | null;
  httpStatus: number | null;
  createdAt: string;
}
