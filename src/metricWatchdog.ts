import client from "prom-client";

const TWO_MINUTES_IN_MS = 2 * 60 * 1000;

export function withGaugeWatchdog<T extends string>(
  metric: client.Gauge<T>,
  timeout: number = TWO_MINUTES_IN_MS
) {
  const lastSeenMap: Map<string, Date> = new Map();

  setInterval(() => {
    for (const key of lastSeenMap.keys()) {
      if (lastSeenMap.get(key)!.getTime() + timeout < new Date().getTime()) {
        // console.log(
        //   "watchdog remove",
        //   // @ts-expect-error private for debugging
        //   metric.name,
        //   "with labels",
        //   JSON.parse(key)
        // );
        lastSeenMap.delete(key);
        metric.remove(JSON.parse(key));
      }
    }
  }, 500);

  return {
    set(labels: Record<T, string | number>, value: number) {
      // // @ts-expect-error private for debugging
      // console.log("seen", metric.name, "with labels", labels);
      lastSeenMap.set(JSON.stringify(labels), new Date());
      metric.set(labels, value);
    },
    remove(labels: Record<T, string | number>) {
      // // @ts-expect-error private for debugging
      // console.log("manual remove", metric.name, "with labels", labels);
      lastSeenMap.delete(JSON.stringify(labels));
      metric.remove(labels);
    },
  };
}
