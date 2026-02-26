// src/types/alert.ts

export type AlertCondition = "above" | "below" | "percent_change_up" | "percent_change_down";

export type AlertStatus = "active" | "triggered" | "paused" | "expired";

export type AlertNotificationChannel = "email" | "push" | "sms";

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  condition: AlertCondition;
  targetValue: number;
  currentValue: number | null;
  status: AlertStatus;
  notifyVia: AlertNotificationChannel[];
  triggeredAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertInput {
  symbol: string;
  condition: AlertCondition;
  targetValue: number;
  notifyVia?: AlertNotificationChannel[];
  expiresAt?: string;
}

export interface UpdateAlertInput {
  condition?: AlertCondition;
  targetValue?: number;
  notifyVia?: AlertNotificationChannel[];
  status?: AlertStatus;
  expiresAt?: string;
}
