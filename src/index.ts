import client from "prom-client";
import http from "http";
import dgram from "dgram";
import { DecodedEvent, Event, decodeEvent } from "./weatherflow.js";
import { AddressInfo } from "net";
import { withGaugeWatchdog } from "./metricWatchdog.js";

const metricsServer = http.createServer((__req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.writeHead(200);
  client.register.metrics().then((s) => {
    res.end(s);
  });
});

metricsServer.on("listening", () => {
  const address = metricsServer.address() as AddressInfo;
  console.log(`metrics on ${address.address}:${address.port}`);
});

metricsServer.listen(8080, "0.0.0.0");

const wind_lull = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_wind_lull",
    help: "wind_lull",
    labelNames: ["serial_number"],
  })
);
const wind_avg = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_wind_avg",
    help: "wind_avg",
    labelNames: ["serial_number"],
  })
);
const wind_gust = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_wind_gust",
    help: "wind_gust",
    labelNames: ["serial_number"],
  })
);
const wind_direction = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_wind_direction",
    help: "wind_direction",
    labelNames: ["serial_number"],
  })
);
const wind_sample_interval = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_wind_sample_interval",
    help: "wind_sample_interval",
    labelNames: ["serial_number"],
  })
);
const station_pressure = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_station_pressure",
    help: "station_pressure",
    labelNames: ["serial_number"],
  })
);
const air_temperature = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_air_temperature",
    help: "air_temperature",
    labelNames: ["serial_number"],
  })
);
const relative_humidity = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_relative_humidity",
    help: "relative_humidity",
    labelNames: ["serial_number"],
  })
);
const illuminance = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_illuminance",
    help: "illuminance",
    labelNames: ["serial_number"],
  })
);
const uv = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_uv",
    help: "uv",
    labelNames: ["serial_number"],
  })
);
const solar_radiation = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_solar_radiation",
    help: "solar_radiation",
    labelNames: ["serial_number"],
  })
);
const rain_amount = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_rain_amount",
    help: "rain_amount",
    labelNames: ["serial_number"],
  })
);
const precipitation_type = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_precipitation_type",
    help: "precipitation_type",
    labelNames: ["serial_number"],
  })
);
const lighting_count = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_lighting_count",
    help: "lighting_count",
    labelNames: ["serial_number"],
  })
);
const lighting_avg_distance = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_lighting_avg_distance",
    help: "lighting_avg_distance",
    labelNames: ["serial_number"],
  })
);
const battery = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_battery",
    help: "battery",
    labelNames: ["serial_number"],
  })
);
const report_interval = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_report_interval",
    help: "report_interval",
    labelNames: ["serial_number"],
  })
);
const uptime = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_uptime",
    help: "uptime",
    labelNames: ["serial_number"],
  })
);
const voltage = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_voltage",
    help: "voltage",
    labelNames: ["serial_number"],
  })
);
const firmware_revision = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_firmware_revision",
    help: "firmware_revision",
    labelNames: ["serial_number"],
  })
);
const rssi = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_rssi",
    help: "rssi",
    labelNames: ["serial_number"],
  })
);
const hub_rssi = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_hub_rssi",
    help: "hub_rssi",
    labelNames: ["serial_number"],
  })
);
const sensor_status = withGaugeWatchdog(
  new client.Gauge({
    name: "weatherflow_sensor_status",
    help: "sensor_status",
    labelNames: ["serial_number", "diagnostic"],
  })
);
const server = dgram.createSocket("udp4");

async function submitEvent(event: DecodedEvent) {
  // Special casing this because this event might generate multiple points
  if (event.type === "obs_st") {
    const obs = event.observations[event.observations.length - 1]!;
    if (obs.windLull != null) {
      wind_lull.set({ serial_number: event.serial_number }, obs.windLull);
    } else {
      wind_lull.remove({ serial_number: event.serial_number });
    }
    if (obs.windAvg != null) {
      wind_avg.set({ serial_number: event.serial_number }, obs.windAvg);
    } else {
      wind_avg.remove({ serial_number: event.serial_number });
    }
    if (obs.windGust != null) {
      wind_gust.set({ serial_number: event.serial_number }, obs.windGust);
    } else {
      wind_gust.remove({ serial_number: event.serial_number });
    }
    if (obs.windDirection != null) {
      wind_direction.set(
        { serial_number: event.serial_number },
        obs.windDirection
      );
    } else {
      wind_direction.remove({ serial_number: event.serial_number });
    }
    if (obs.windSampleInterval != null) {
      wind_sample_interval.set(
        { serial_number: event.serial_number },
        obs.windSampleInterval
      );
    } else {
      wind_sample_interval.remove({ serial_number: event.serial_number });
    }
    if (obs.stationPressure != null) {
      station_pressure.set(
        { serial_number: event.serial_number },
        obs.stationPressure
      );
    } else {
      station_pressure.remove({ serial_number: event.serial_number });
    }
    if (obs.temperature != null) {
      air_temperature.set(
        { serial_number: event.serial_number },
        obs.temperature
      );
    } else {
      air_temperature.remove({ serial_number: event.serial_number });
    }
    if (obs.humidity != null) {
      relative_humidity.set(
        { serial_number: event.serial_number },
        obs.humidity
      );
    } else {
      relative_humidity.remove({ serial_number: event.serial_number });
    }
    if (obs.illuminance != null) {
      illuminance.set({ serial_number: event.serial_number }, obs.illuminance);
    } else {
      illuminance.remove({ serial_number: event.serial_number });
    }
    if (obs.uvIndex != null) {
      uv.set({ serial_number: event.serial_number }, obs.uvIndex);
    } else {
      uv.remove({ serial_number: event.serial_number });
    }
    if (obs.solarRadiation != null) {
      solar_radiation.set(
        { serial_number: event.serial_number },
        obs.solarRadiation
      );
    } else {
      solar_radiation.remove({ serial_number: event.serial_number });
    }
    if (obs.rainAmount != null) {
      rain_amount.set({ serial_number: event.serial_number }, obs.rainAmount);
    } else {
      rain_amount.remove({ serial_number: event.serial_number });
    }
    precipitation_type.set(
      { serial_number: event.serial_number },
      (() => {
        switch (obs.precipitationType) {
          case "none":
            return 0;
          case "rain":
            return 1;
          case "hail":
            return 2;
          case "error":
            return 3;
        }
      })()
    );
    if (obs.lightningCount != null) {
      lighting_count.set(
        { serial_number: event.serial_number },
        obs.lightningCount
      );
    } else {
      lighting_count.remove({ serial_number: event.serial_number });
    }
    if (obs.lightningAvgDistance != null) {
      lighting_avg_distance.set(
        { serial_number: event.serial_number },
        obs.lightningAvgDistance
      );
    } else {
      lighting_avg_distance.remove({ serial_number: event.serial_number });
    }
    if (obs.battery != null) {
      battery.set({ serial_number: event.serial_number }, obs.battery);
    } else {
      battery.remove({ serial_number: event.serial_number });
    }
    if (obs.reportInterval != null) {
      report_interval.set(
        { serial_number: event.serial_number },
        obs.reportInterval
      );
    } else {
      report_interval.remove({ serial_number: event.serial_number });
    }
  } else if (event.type == "device_status") {
    uptime.set({ serial_number: event.serial_number }, event.uptime);
    voltage.set({ serial_number: event.serial_number }, event.voltage);
    firmware_revision.set(
      { serial_number: event.serial_number },
      event.firmware_revision
    );
    rssi.set({ serial_number: event.serial_number }, event.rssi);
    hub_rssi.set({ serial_number: event.serial_number }, event.hub_rssi);
    sensor_status.set(
      { serial_number: event.serial_number, diagnostic: "sensors_ok" },
      event.sensor_status.sensors_ok ? 1 : 0
    );
    sensor_status.set(
      {
        serial_number: event.serial_number,
        diagnostic: "lightning_sensor_failed",
      },
      event.sensor_status.lightning_sensor_failed ? 1 : 0
    );
    sensor_status.set(
      {
        serial_number: event.serial_number,
        diagnostic: "lightning_sensor_noise",
      },
      event.sensor_status.lightning_sensor_noise ? 1 : 0
    );
    sensor_status.set(
      {
        serial_number: event.serial_number,
        diagnostic: "lightning_sensor_disturbance",
      },
      event.sensor_status.lightning_sensor_disturbance ? 1 : 0
    );
    sensor_status.set(
      {
        serial_number: event.serial_number,
        diagnostic: "pressure_sensor_failed",
      },
      event.sensor_status.pressure_sensor_failed ? 1 : 0
    );
    sensor_status.set(
      {
        serial_number: event.serial_number,
        diagnostic: "temperature_sensor_failed",
      },
      event.sensor_status.temperature_sensor_failed ? 1 : 0
    );
    sensor_status.set(
      {
        serial_number: event.serial_number,
        diagnostic: "humidity_sensor_failed",
      },
      event.sensor_status.humidity_sensor_failed ? 1 : 0
    );
    sensor_status.set(
      { serial_number: event.serial_number, diagnostic: "wind_sensor_failed" },
      event.sensor_status.wind_sensor_failed ? 1 : 0
    );
    sensor_status.set(
      {
        serial_number: event.serial_number,
        diagnostic: "precipitation_sensor_failed",
      },
      event.sensor_status.precipitation_sensor_failed ? 1 : 0
    );
    sensor_status.set(
      {
        serial_number: event.serial_number,
        diagnostic: "light_uv_sensor_failed",
      },
      event.sensor_status.light_uv_sensor_failed ? 1 : 0
    );
  }
}

server.on("error", (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on("message", (msg, rinfo) => {
  console.log(`received message from ${rinfo.address}:${rinfo.port}: ${msg}`);

  const rawMessage: Event = JSON.parse(msg.toString("utf8"));
  const decoded = decodeEvent(rawMessage);
  submitEvent(decoded);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`monitoring UDP ${address.address}:${address.port}`);
});

server.bind(50222);
