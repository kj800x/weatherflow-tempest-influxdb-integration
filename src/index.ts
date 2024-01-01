import client from "prom-client";
import http from "http";
import dgram from "dgram";
import { DecodedEvent, Event, decodeEvent } from "./weatherflow.js";
import { AddressInfo } from "net";

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

const wind_lull = new client.Gauge({
  name: "weatherflow_wind_lull",
  help: "wind_lull",
  labelNames: ["serial_number"],
});
const wind_avg = new client.Gauge({
  name: "weatherflow_wind_avg",
  help: "wind_avg",
  labelNames: ["serial_number"],
});
const wind_gust = new client.Gauge({
  name: "weatherflow_wind_gust",
  help: "wind_gust",
  labelNames: ["serial_number"],
});
const wind_direction = new client.Gauge({
  name: "weatherflow_wind_direction",
  help: "wind_direction",
  labelNames: ["serial_number"],
});
const wind_sample_interval = new client.Gauge({
  name: "weatherflow_wind_sample_interval",
  help: "wind_sample_interval",
  labelNames: ["serial_number"],
});
const station_pressure = new client.Gauge({
  name: "weatherflow_station_pressure",
  help: "station_pressure",
  labelNames: ["serial_number"],
});
const air_temperature = new client.Gauge({
  name: "weatherflow_air_temperature",
  help: "air_temperature",
  labelNames: ["serial_number"],
});
const relative_humidity = new client.Gauge({
  name: "weatherflow_relative_humidity",
  help: "relative_humidity",
  labelNames: ["serial_number"],
});
const illuminance = new client.Gauge({
  name: "weatherflow_illuminance",
  help: "illuminance",
  labelNames: ["serial_number"],
});
const uv = new client.Gauge({
  name: "weatherflow_uv",
  help: "uv",
  labelNames: ["serial_number"],
});
const solar_radiation = new client.Gauge({
  name: "weatherflow_solar_radiation",
  help: "solar_radiation",
  labelNames: ["serial_number"],
});
const rain_amount = new client.Gauge({
  name: "weatherflow_rain_amount",
  help: "rain_amount",
  labelNames: ["serial_number"],
});
const precipitation_type = new client.Gauge({
  name: "weatherflow_precipitation_type",
  help: "precipitation_type",
  labelNames: ["serial_number"],
});
const lighting_count = new client.Gauge({
  name: "weatherflow_lighting_count",
  help: "lighting_count",
  labelNames: ["serial_number"],
});
const lighting_avg_distance = new client.Gauge({
  name: "weatherflow_lighting_avg_distance",
  help: "lighting_avg_distance",
  labelNames: ["serial_number"],
});
const battery = new client.Gauge({
  name: "weatherflow_battery",
  help: "battery",
  labelNames: ["serial_number"],
});
const report_interval = new client.Gauge({
  name: "weatherflow_report_interval",
  help: "report_interval",
  labelNames: ["serial_number"],
});
const uptime = new client.Gauge({
  name: "weatherflow_uptime",
  help: "uptime",
  labelNames: ["serial_number"],
});
const voltage = new client.Gauge({
  name: "weatherflow_voltage",
  help: "voltage",
  labelNames: ["serial_number"],
});
const firmware_revision = new client.Gauge({
  name: "weatherflow_firmware_revision",
  help: "firmware_revision",
  labelNames: ["serial_number"],
});
const rssi = new client.Gauge({
  name: "weatherflow_rssi",
  help: "rssi",
  labelNames: ["serial_number"],
});
const hub_rssi = new client.Gauge({
  name: "weatherflow_hub_rssi",
  help: "hub_rssi",
  labelNames: ["serial_number"],
});
const sensor_status = new client.Gauge({
  name: "weatherflow_sensor_status",
  help: "sensor_status",
  labelNames: ["serial_number", "diagnostic"],
});
const server = dgram.createSocket("udp4");

async function submitEvent(event: DecodedEvent) {
  // Special casing this because this event might generate multiple points
  if (event.type === "obs_st") {
    const obs = event.observations[event.observations.length - 1]!;
    if (obs.windLull != null) {
      wind_lull
        .labels({ serial_number: event.serial_number })
        .set(obs.windLull);
    } else {
      wind_lull.remove({ serial_number: event.serial_number });
    }
    if (obs.windAvg != null) {
      wind_avg.labels({ serial_number: event.serial_number }).set(obs.windAvg);
    } else {
      wind_avg.remove({ serial_number: event.serial_number });
    }
    if (obs.windGust != null) {
      wind_gust
        .labels({ serial_number: event.serial_number })
        .set(obs.windGust);
    } else {
      wind_gust.remove({ serial_number: event.serial_number });
    }
    if (obs.windDirection != null) {
      wind_direction
        .labels({ serial_number: event.serial_number })
        .set(obs.windDirection);
    } else {
      wind_direction.remove({ serial_number: event.serial_number });
    }
    if (obs.windSampleInterval != null) {
      wind_sample_interval
        .labels({ serial_number: event.serial_number })
        .set(obs.windSampleInterval);
    } else {
      wind_sample_interval.remove({ serial_number: event.serial_number });
    }
    if (obs.stationPressure != null) {
      station_pressure
        .labels({ serial_number: event.serial_number })
        .set(obs.stationPressure);
    } else {
      station_pressure.remove({ serial_number: event.serial_number });
    }
    if (obs.temperature != null) {
      air_temperature
        .labels({ serial_number: event.serial_number })
        .set(obs.temperature);
    } else {
      air_temperature.remove({ serial_number: event.serial_number });
    }
    if (obs.humidity != null) {
      relative_humidity
        .labels({ serial_number: event.serial_number })
        .set(obs.humidity);
    } else {
      relative_humidity.remove({ serial_number: event.serial_number });
    }
    if (obs.illuminance != null) {
      illuminance
        .labels({ serial_number: event.serial_number })
        .set(obs.illuminance);
    } else {
      illuminance.remove({ serial_number: event.serial_number });
    }
    if (obs.uvIndex != null) {
      uv.labels({ serial_number: event.serial_number }).set(obs.uvIndex);
    } else {
      uv.remove({ serial_number: event.serial_number });
    }
    if (obs.solarRadiation != null) {
      solar_radiation
        .labels({ serial_number: event.serial_number })
        .set(obs.solarRadiation);
    } else {
      solar_radiation.remove({ serial_number: event.serial_number });
    }
    if (obs.rainAmount != null) {
      rain_amount
        .labels({ serial_number: event.serial_number })
        .set(obs.rainAmount);
    } else {
      rain_amount.remove({ serial_number: event.serial_number });
    }
    precipitation_type.labels({ serial_number: event.serial_number }).set(
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
      lighting_count
        .labels({ serial_number: event.serial_number })
        .set(obs.lightningCount);
    } else {
      lighting_count.remove({ serial_number: event.serial_number });
    }
    if (obs.lightningAvgDistance != null) {
      lighting_avg_distance
        .labels({ serial_number: event.serial_number })
        .set(obs.lightningAvgDistance);
    } else {
      lighting_avg_distance.remove({ serial_number: event.serial_number });
    }
    if (obs.battery != null) {
      battery.labels({ serial_number: event.serial_number }).set(obs.battery);
    } else {
      battery.remove({ serial_number: event.serial_number });
    }
    if (obs.reportInterval != null) {
      report_interval
        .labels({ serial_number: event.serial_number })
        .set(obs.reportInterval);
    } else {
      report_interval.remove({ serial_number: event.serial_number });
    }
  } else if (event.type == "device_status") {
    uptime.labels({ serial_number: event.serial_number }).set(event.uptime);
    voltage.labels({ serial_number: event.serial_number }).set(event.voltage);
    firmware_revision
      .labels({ serial_number: event.serial_number })
      .set(event.firmware_revision);
    rssi.labels({ serial_number: event.serial_number }).set(event.rssi);
    hub_rssi.labels({ serial_number: event.serial_number }).set(event.hub_rssi);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "sensors_ok",
      })
      .set(event.sensor_status.sensors_ok ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "lightning_sensor_failed",
      })
      .set(event.sensor_status.lightning_sensor_failed ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "lightning_sensor_noise",
      })
      .set(event.sensor_status.lightning_sensor_noise ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "lightning_sensor_disturbance",
      })
      .set(event.sensor_status.lightning_sensor_disturbance ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "pressure_sensor_failed",
      })
      .set(event.sensor_status.pressure_sensor_failed ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "temperature_sensor_failed",
      })
      .set(event.sensor_status.temperature_sensor_failed ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "humidity_sensor_failed",
      })
      .set(event.sensor_status.humidity_sensor_failed ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "wind_sensor_failed",
      })
      .set(event.sensor_status.wind_sensor_failed ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "precipitation_sensor_failed",
      })
      .set(event.sensor_status.precipitation_sensor_failed ? 1 : 0);
    sensor_status
      .labels({
        serial_number: event.serial_number,
        diagnostic: "light_uv_sensor_failed",
      })
      .set(event.sensor_status.light_uv_sensor_failed ? 1 : 0);
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
