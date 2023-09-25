import client from "prom-client";
import http from "http";
import dgram from "dgram";
import { DecodedEvent, Event, decodeEvent } from "./weatherflow.js";

const metricsServer = http.createServer((__req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.writeHead(200);
  client.register.metrics().then((s) => {
    res.end(s);
  });
});

metricsServer.listen(8080, "0.0.0.0");

const wind_lull = new client.Gauge({ name: "wind_lull", help: "wind_lull" });
const wind_avg = new client.Gauge({ name: "wind_avg", help: "wind_avg" });
const wind_gust = new client.Gauge({ name: "wind_gust", help: "wind_gust" });
const wind_direction = new client.Gauge({
  name: "wind_direction",
  help: "wind_direction",
});
const wind_sample_interval = new client.Gauge({
  name: "wind_sample_interval",
  help: "wind_sample_interval",
});
const station_pressure = new client.Gauge({
  name: "station_pressure",
  help: "station_pressure",
});
const air_temperature = new client.Gauge({
  name: "air_temperature",
  help: "air_temperature",
});
const relative_humidity = new client.Gauge({
  name: "relative_humidity",
  help: "relative_humidity",
});
const illuminance = new client.Gauge({
  name: "illuminance",
  help: "illuminance",
});
const uv = new client.Gauge({ name: "uv", help: "uv" });
const solar_radiation = new client.Gauge({
  name: "solar_radiation",
  help: "solar_radiation",
});
const rain_amount = new client.Gauge({
  name: "rain_amount",
  help: "rain_amount",
});
const precipitation_type = new client.Gauge({
  name: "precipitation_type",
  help: "precipitation_type",
});
const lighting_count = new client.Gauge({
  name: "lighting_count",
  help: "lighting_count",
});
const lighting_avg_distance = new client.Gauge({
  name: "lighting_avg_distance",
  help: "lighting_avg_distance",
});
const battery = new client.Gauge({ name: "battery", help: "battery" });
const reportInterval = new client.Gauge({
  name: "reportInterval",
  help: "reportInterval",
});

const server = dgram.createSocket("udp4");

async function submitEvent(event: DecodedEvent) {
  // Special casing this because this event might generate multiple points
  if (event.type === "obs_st") {
    const obs = event.observations[event.observations.length - 1]!;
    wind_lull.set(obs.windLull);
    wind_avg.set(obs.windAvg);
    wind_gust.set(obs.windGust);
    wind_direction.set(obs.windDirection);
    wind_sample_interval.set(obs.windSampleInterval);
    station_pressure.set(obs.stationPressure);
    air_temperature.set(obs.temperature);
    relative_humidity.set(obs.humidity);
    illuminance.set(obs.illuminance);
    uv.set(obs.uvIndex);
    solar_radiation.set(obs.solarRadiation);
    rain_amount.set(obs.rainAmount);
    precipitation_type.set(
      (() => {
        switch (obs.precipitationType) {
          case "none":
            return 0;
          case "rain":
            return 1;
          case "hail":
            return 2;
        }
      })()
    );
    lighting_count.set(obs.lightningCount);
    lighting_avg_distance.set(obs.lightningAvgDistance);
    battery.set(obs.battery);
    reportInterval.set(obs.reportInterval);
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
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(50222);
