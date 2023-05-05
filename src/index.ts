import { InfluxDB, Point } from '@influxdata/influxdb-client';
import dgram from 'dgram';
import { ENV } from './env.js';
import { DecodedEvent, Event, decodeEvent } from './weatherflow.js';

const server = dgram.createSocket('udp4');

const influx = new InfluxDB({
  url: ENV('INFLUX_URL'),
  token: ENV('INFLUX_TOKEN'),
});

const writeApi = influx.getWriteApi(ENV('INFLUX_ORG'), ENV('INFLUX_BUCKET'));

async function submitEvent(event: DecodedEvent) {
  // Special casing this because this event might generate multiple points
  if (event.type === 'obs_st') {
    const points = event.observations.map((obs) => {
      const point = new Point(event.type);
      point.tag('serial_number', event.serial_number);
      point.tag('hub_sn', event.hub_sn);
      point.intField('firmware_revision', event.firmwareRevision);
      point.floatField('wind_lull', obs.windLull);
      point.floatField('wind_avg', obs.windAvg);
      point.floatField('wind_gust', obs.windGust);
      point.intField('wind_direction', obs.windDirection);
      point.intField('wind_sample_interval', obs.windSampleInterval);
      point.floatField('station_pressure', obs.stationPressure);
      point.floatField('air_temperature', obs.temperature);
      point.floatField('relative_humidity', obs.humidity);
      point.intField('illuminance', obs.illuminance);
      point.floatField('uv', obs.uvIndex);
      point.intField('solar_radiation', obs.solarRadiation);
      point.floatField('rain_amount', obs.rainAmount);
      point.stringField('precipitation_type', obs.precipitationType);
      point.intField('lighting_count', obs.lightningCount);
      point.floatField('lighting_avg_distance', obs.lightningAvgDistance);
      point.floatField('battery', obs.battery);
      point.intField('reportInterval', obs.reportInterval);
      point.timestamp(new Date(obs.time * 1000));
      return point;
    });
    points.forEach((point) => writeApi.writePoint(point));
    writeApi.flush();
    return;
  }

  const point = new Point(event.type);
  switch (event.type) {
    case 'rapid_wind': {
      point.tag('serial_number', event.serial_number);
      point.tag('hub_sn', event.hub_sn);
      point.intField('direction', event.direction);
      point.floatField('speed', event.speed);
      point.timestamp(new Date(event.time * 1000));
      break;
    }
    case 'evt_precip': {
      point.tag('serial_number', event.serial_number);
      point.tag('hub_sn', event.hub_sn);
      point.timestamp(new Date(event.timestamp * 1000));
      break;
    }
    case 'evt_strike': {
      point.tag('serial_number', event.serial_number);
      point.tag('hub_sn', event.hub_sn);
      point.intField('distance', event.distance);
      point.intField('energy', event.energy);
      point.timestamp(new Date(event.time * 1000));
      break;
    }
    case 'hub_status': {
      point.tag('serial_number', event.serial_number);
      point.intField(
        'firmware_revision',
        parseInt(event.firmware_revision, 10)
      );
      point.intField('uptime', event.uptime);
      point.intField('rssi', event.rssi);
      point.booleanField('reset-BOR', event.reset_flags.BOR);
      point.booleanField('reset-PIN', event.reset_flags.PIN);
      point.booleanField('reset-POR', event.reset_flags.POR);
      point.booleanField('reset-SFT', event.reset_flags.SFT);
      point.booleanField('reset-WDG', event.reset_flags.WDG);
      point.booleanField('reset-WWD', event.reset_flags.WWD);
      point.booleanField('reset-LPW', event.reset_flags.LPW);
      point.timestamp(new Date(event.timestamp * 1000));
      break;
    }
    case 'device_status': {
      point.tag('serial_number', event.serial_number);
      point.tag('hub_sn', event.hub_sn);
      point.intField('firmware_revision', event.firmware_revision);
      point.intField('uptime', event.uptime);
      point.floatField('voltage', event.voltage);
      point.intField('rssi', event.rssi);
      point.intField('hub_rssi', event.hub_rssi);
      point.booleanField('sensorStatus-ok', event.sensor_status.sensors_ok);
      point.booleanField(
        'sensorStatus-lightingFailed',
        event.sensor_status.lightning_sensor_failed
      );
      point.booleanField(
        'sensorStatus-lightingNoise',
        event.sensor_status.lightning_sensor_noise
      );
      point.booleanField(
        'sensorStatus-lightingDisturbance',
        event.sensor_status.lightning_sensor_disturbance
      );
      point.booleanField(
        'sensorStatus-pressureFailed',
        event.sensor_status.pressure_sensor_failed
      );
      point.booleanField(
        'sensorStatus-temperatureFailed',
        event.sensor_status.temperature_sensor_failed
      );
      point.booleanField(
        'sensorStatus-humidityFailed',
        event.sensor_status.humidity_sensor_failed
      );
      point.booleanField(
        'sensorStatus-windFailed',
        event.sensor_status.wind_sensor_failed
      );
      point.booleanField(
        'sensorStatus-precipitationFailed',
        event.sensor_status.precipitation_sensor_failed
      );
      point.booleanField(
        'sensorStatus-lightUvFailed',
        event.sensor_status.light_uv_sensor_failed
      );
      point.booleanField('debug_enabled', event.debug_enabled);
      point.timestamp(new Date(event.timestamp * 1000));
      break;
    }
    default: {
      throw new Error(`Unknown event type: ${(event as any).type}`);
    }
  }
  writeApi.writePoint(point);
  writeApi.flush();
}

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`received message from ${rinfo.address}:${rinfo.port}: ${msg}`);

  const rawMessage: Event = JSON.parse(msg.toString('utf8'));
  const decoded = decodeEvent(rawMessage);
  submitEvent(decoded);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(50222);
