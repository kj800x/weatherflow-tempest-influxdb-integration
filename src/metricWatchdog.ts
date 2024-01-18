import client from "prom-client";

// It looks like we get a UDP update every 5 minutes, so we'll set a TTL of 6 minutes
const SIX_MINUTES_IN_MS = 6 * 60 * 1000;
const WATCHDOG_CHECK_INTERVAL = 500;

export function withGaugeWatchdog<T extends string>(
  metric: client.Gauge<T>,
  timeout: number = SIX_MINUTES_IN_MS
) {
  const lastSeenMap: Map<string, Date> = new Map();

  setInterval(() => {
    for (const key of lastSeenMap.keys()) {
      if (lastSeenMap.get(key)!.getTime() + timeout < new Date().getTime()) {
        lastSeenMap.delete(key);
        metric.remove(JSON.parse(key));
      }
    }
  }, WATCHDOG_CHECK_INTERVAL);

  return {
    set(labels: Record<T, string | number>, value: number) {
      lastSeenMap.set(JSON.stringify(labels), new Date());
      metric.set(labels, value);
    },
    remove(labels: Record<T, string | number>) {
      lastSeenMap.delete(JSON.stringify(labels));
      metric.remove(labels);
    },
  };
}
