// src/lib/alerts/evaluator.ts
import { prisma } from "@/lib/db/client";

interface AlertNotification {
  alertId: string;
  userId: string;
  channels: string[];
  title: string;
  message: string;
  value: number;
}

/**
 * Evaluates all active user alerts against latest observation data.
 * Triggers notifications for alerts whose conditions are met.
 */
export async function evaluateAlerts(): Promise<{
  evaluated: number;
  triggered: number;
  errors: number;
}> {
  let evaluated = 0;
  let triggered = 0;
  let errors = 0;

  const activeAlerts = await prisma.priceAlert.findMany({
    where: { status: "active" },
    include: {
      user: { select: { id: true, email: true, role: true } },
    },
  });

  for (const alert of activeAlerts) {
    try {
      evaluated++;

      // Get the latest observation for this alert's symbol (series ID)
      const latest = await getLatestValue(alert.symbol);
      if (latest === null) continue;

      // Check cooldown period
      if (alert.triggeredAt) {
        const cooldownMs = (alert.cooldownMinutes ?? 60) * 60_000;
        const elapsed = Date.now() - alert.triggeredAt.getTime();
        if (elapsed < cooldownMs) continue;
      }

      // Evaluate the condition
      const targetValue = alert.targetValue.toNumber();
      const isTriggered = checkCondition(alert.condition, latest, targetValue);

      if (!isTriggered) {
        // Update last evaluated timestamp
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { lastEvaluatedAt: new Date() },
        });
        continue;
      }

      // Alert triggered — prepare notification
      const notification: AlertNotification = {
        alertId: alert.id,
        userId: alert.userId,
        channels: alert.notifyVia,
        title: `Alert: ${alert.name}`,
        message: buildAlertMessage(alert.name, alert.condition, latest, targetValue),
        value: latest,
      };

      // Update alert status
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: {
          status: "triggered",
          triggeredAt: new Date(),
          lastEvaluatedAt: new Date(),
          triggerCount: { increment: 1 },
        },
      });

      // Queue notification dispatch
      await dispatchNotification(notification);
      triggered++;

      console.info(
        `[alerts] Triggered "${alert.name}" for user ${alert.userId}: ${alert.symbol} = ${latest} (target: ${alert.condition} ${targetValue})`
      );
    } catch (err) {
      errors++;
      console.error(`[alerts] Error evaluating alert ${alert.id}:`, err);
    }
  }

  console.info(`[alerts] Evaluation complete: ${evaluated} evaluated, ${triggered} triggered, ${errors} errors`);
  return { evaluated, triggered, errors };
}

/**
 * Get the latest value for a given series/symbol.
 */
async function getLatestValue(symbol: string): Promise<number | null> {
  // Try observations table first (normalized series ID)
  const obs = await prisma.observation.findFirst({
    where: { seriesId: symbol },
    orderBy: { date: "desc" },
    select: { value: true },
  });

  if (obs) return obs.value.toNumber();

  // Fall back to daily snapshot for computed metrics
  const snapshot = await prisma.dailySnapshot.findFirst({
    orderBy: { date: "desc" },
  });

  if (!snapshot) return null;

  // Map common symbols to snapshot fields
  const snapshotMap: Record<string, keyof typeof snapshot> = {
    "TREASURY:TOTAL_DEBT": "totalDebt",
    total_debt: "totalDebt",
    "TREASURY:TGA_BALANCE": "tgaBalance",
    tga: "tgaBalance",
    "FRED:WALCL": "fedBalanceSheet",
    fed_balance_sheet: "fedBalanceSheet",
    net_liquidity: "netLiquidity",
    "FRED:DGS10": "dgs10",
    dgs10: "dgs10",
    "FRED:FEDFUNDS": "fedFundsRate",
    fed_funds: "fedFundsRate",
  };

  const field = snapshotMap[symbol];
  if (field && snapshot[field] !== null) {
    const val = snapshot[field];
    return typeof val === "object" && "toNumber" in val ? val.toNumber() : null;
  }

  return null;
}

/**
 * Check if an alert condition is met.
 */
function checkCondition(
  condition: string,
  currentValue: number,
  targetValue: number
): boolean {
  switch (condition) {
    case "above":
      return currentValue > targetValue;
    case "below":
      return currentValue < targetValue;
    case "percent_change_up":
      // targetValue is the % threshold (e.g., 5 for 5%)
      // This would need the previous value to compute — simplified here
      return false; // TODO: implement with historical comparison
    case "percent_change_down":
      return false; // TODO: implement with historical comparison
    default:
      return false;
  }
}

/**
 * Build a human-readable alert message.
 */
function buildAlertMessage(
  name: string,
  condition: string,
  value: number,
  target: number
): string {
  const formattedValue = formatAlertValue(value);
  const formattedTarget = formatAlertValue(target);

  switch (condition) {
    case "above":
      return `${name} has risen above ${formattedTarget}. Current value: ${formattedValue}`;
    case "below":
      return `${name} has fallen below ${formattedTarget}. Current value: ${formattedValue}`;
    case "percent_change_up":
      return `${name} has increased by more than ${target}%. Current value: ${formattedValue}`;
    case "percent_change_down":
      return `${name} has decreased by more than ${target}%. Current value: ${formattedValue}`;
    default:
      return `${name} alert triggered. Current value: ${formattedValue}`;
  }
}

function formatAlertValue(value: number): string {
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) < 100) return value.toFixed(2);
  return value.toLocaleString();
}

/**
 * Dispatch a notification to the appropriate channels.
 * In production, this would queue to BullMQ notification workers.
 */
async function dispatchNotification(notification: AlertNotification): Promise<void> {
  for (const channel of notification.channels) {
    switch (channel) {
      case "email":
        // TODO: Integrate with Resend for email delivery
        console.info(`[alerts] Would send email to user ${notification.userId}: ${notification.title}`);
        break;
      case "push":
        // TODO: Integrate with Web Push API
        console.info(`[alerts] Would send push to user ${notification.userId}: ${notification.title}`);
        break;
      case "webhook":
        // TODO: Fetch user's webhook URL from NotificationPreference and POST
        console.info(`[alerts] Would send webhook for user ${notification.userId}: ${notification.title}`);
        break;
      default:
        console.warn(`[alerts] Unknown notification channel: ${channel}`);
    }
  }
}
