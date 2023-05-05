interface BaseEvent {
  serial_number: string;
  hub_sn: string;
  type: string;
}

interface RainStartEvent extends BaseEvent {
  type: 'evt_precip';
  evt: [
    number // time epoch in second
  ];
}

interface RainStartEventDecoded extends BaseEvent {
  type: 'evt_precip';
  /** time epoch in second */
  timestamp: number;
}

interface LightningStrikeEvent extends BaseEvent {
  type: 'evt_strike';
  evt: [
    number, // time epoch in seconds
    number, // distance in km
    number // energy
  ];
}

interface LightningStrikeEventDecoded extends BaseEvent {
  type: 'evt_strike';
  /** Time epoch in seconds */
  time: number;
  /** Distance in km */
  distance: number;
  /** Energy */
  energy: number;
}

interface RapidWindEvent extends BaseEvent {
  type: 'rapid_wind';
  ob: [
    number, // time epoch in seconds
    number, // wind speed in mps
    number // wind direction in degrees
  ];
}

interface RapidWindEventDecoded extends BaseEvent {
  type: 'rapid_wind';
  /** Time epoch in seconds */
  time: number;
  /** Wind speed in meters per second */
  speed: number;
  /** Wind direction in degrees */
  direction: number;
}

interface TempestObservation extends BaseEvent {
  type: 'obs_st';
  obs: [
    number, // time epoch in seconds

    number, // wind lull in m/s
    number, // wind avg in m/s
    number, // wind gust in m/s
    number, // wind direction in degrees
    number, // wind sample interval in seconds

    number, // station pressure in MB
    number, // air temperature in C
    number, // relative humidity in %

    number, // illuminance in lux
    number, // uv in index
    number, // solar radiation in W/m^2

    number, // rain amount over previous minute in mm
    number, // precipitation type (0 = none, 1 = rain, 2 = hail)

    number, // lighting strike count
    number, // lighting strike avg distance in km

    number, // battery in volts
    number // report interval in minutes
  ][];
  firmware_revision: number;
}

interface TempestObservationDecoded extends BaseEvent {
  type: 'obs_st';
  /** Firmware revision */
  firmwareRevision: number;
  observations: {
    /** Time epoch in seconds */
    time: number;
    /** Wind lull in meters per second */
    windLull: number;
    /** Wind average in meters per second */
    windAvg: number;
    /** Wind gust in meters per second */
    windGust: number;
    /** Wind direction in degrees */
    windDirection: number;
    /** Wind sample interval in seconds */
    windSampleInterval: number;
    /** Station pressure in millibars */
    stationPressure: number;
    /** Air temperature in degrees Celsius */
    temperature: number;
    /** Relative humidity in percent */
    humidity: number;
    /** Illuminance in lux */
    illuminance: number;
    /** UV index */
    uvIndex: number;
    /** Solar radiation in watts per square meter */
    solarRadiation: number;
    /** Rain amount over previous minute in millimeters */
    rainAmount: number;
    /** Precipitation type */
    precipitationType: 'none' | 'rain' | 'hail';
    /** Lightning strike count */
    lightningCount: number;
    /** Lightning strike average distance in kilometers */
    lightningAvgDistance: number;
    /** Battery voltage in volts */
    battery: number;
    /** Report interval in minutes */
    reportInterval: number;
  }[];
}

interface HubStatus extends Omit<BaseEvent, 'hub_sn'> {
  type: 'hub_status';
  firmware_revision: string; // like '53'
  uptime: number;
  rssi: number;
  timestamp: number;

  reset_flags: string; // like 'BOR,PIN,POR';
  seq: number;
  fs: [number, number, number, number]; // undocumented
  radio_stats: [
    number, // version
    number, // reboot count
    number, // i2c bus error count
    number, // radio status (0 = radio off, 1 = radio on, 3 = radio active)
    number // radio network id
  ];
  mqtt_stats: [number, number]; // undocumented
}

interface HubStatusDecoded extends Omit<BaseEvent, 'hub_sn'> {
  type: 'hub_status';
  firmware_revision: string;
  uptime: number;
  rssi: number;
  timestamp: number;
  reset_flags: {
    /** Brownout Reset */
    BOR: boolean;
    /** PIN reset */
    PIN: boolean;
    /** Power reset */
    POR: boolean;
    /** Software reset */
    SFT: boolean;
    /** Watchdog reset */
    WDG: boolean;
    /** Window watchdog reset */
    WWD: boolean;
    /** Low-power reset */
    LPW: boolean;
  };
  seq: number;
  fs: [number, number, number, number]; // undocumented
  radio_stats: {
    version: number;
    rebootCount: number;
    i2cBusErrorCount: number;
    status: 'off' | 'on' | 'active' | null;
    networkId: number;
  };
  mqtt_stats: [number, number]; // undocumented
}

interface DeviceStatus extends BaseEvent {
  type: 'device_status';
  timestamp: number;
  uptime: number;
  voltage: number;
  firmware_revision: number;
  rssi: number;
  hub_rssi: number;
  /**
   * bit flags:
   * 0b000000000 = Sensors OK
   * 0b000000001 = Lightning Sensor Failed
   * 0b000000010 = Lightning Sensor detected noise
   * 0b000000100 = Lightning Sensor detected disturbance
   * 0b000001000 = Pressure Sensor Failed
   * 0b000010000 = Temperature Sensor Failed
   * 0b000100000 = Relative Humidity Sensor Failed
   * 0b001000000 = Wind Sensor Failed
   * 0b010000000 = Precipitation Sensor Failed
   * 0b100000000 = Light / UV Sensor Failed
   */
  sensor_status: number;
  debug: number; // 1 if enabled, 0 if disabled
}

interface DeviceStatusDecoded extends BaseEvent {
  type: 'device_status';
  timestamp: number;
  uptime: number;
  voltage: number;
  firmware_revision: number;
  rssi: number;
  hub_rssi: number;
  sensor_status: {
    sensors_ok: boolean;
    lightning_sensor_failed: boolean;
    lightning_sensor_noise: boolean;
    lightning_sensor_disturbance: boolean;
    pressure_sensor_failed: boolean;
    temperature_sensor_failed: boolean;
    humidity_sensor_failed: boolean;
    wind_sensor_failed: boolean;
    precipitation_sensor_failed: boolean;
    light_uv_sensor_failed: boolean;
  };
  debug_enabled: boolean;
}

export type Event =
  | RainStartEvent
  | LightningStrikeEvent
  | RapidWindEvent
  | TempestObservation
  | DeviceStatus
  | HubStatus;

export type DecodedEvent =
  | RainStartEventDecoded
  | LightningStrikeEventDecoded
  | RapidWindEventDecoded
  | TempestObservationDecoded
  | DeviceStatusDecoded
  | HubStatusDecoded;

export function decodeEvent(event: Event): DecodedEvent {
  switch (event.type) {
    case 'evt_precip': {
      const [timestamp] = event.evt;
      return {
        hub_sn: event.hub_sn,
        type: event.type,
        serial_number: event.serial_number,
        timestamp,
      };
    }
    case 'evt_strike': {
      const [time, distance, energy] = event.evt;
      return {
        hub_sn: event.hub_sn,
        type: event.type,
        serial_number: event.serial_number,
        time,
        distance,
        energy,
      };
    }
    case 'rapid_wind': {
      const [time, speed, direction] = event.ob;
      return {
        hub_sn: event.hub_sn,
        type: event.type,
        serial_number: event.serial_number,
        time,
        speed,
        direction,
      };
    }
    case 'obs_st': {
      const [obs] = event.obs;
      const [
        time,
        windLull,
        windAvg,
        windGust,
        windDirection,
        windSampleInterval,
        stationPressure,
        temperature,
        humidity,
        illuminance,
        uvIndex,
        solarRadiation,
        rainAmount,
        precipitationType,
        lightningCount,
        lightningAvgDistance,
        battery,
        reportInterval,
      ] = obs!;
      return {
        hub_sn: event.hub_sn,
        type: event.type,
        serial_number: event.serial_number,
        firmwareRevision: event.firmware_revision,
        observations: [
          {
            time,
            windLull,
            windAvg,
            windGust,
            windDirection,
            windSampleInterval,
            stationPressure,
            temperature,
            humidity,
            illuminance,
            uvIndex,
            solarRadiation,
            rainAmount,
            precipitationType: (['none', 'rain', 'hail'] as const)[
              precipitationType
            ]!,
            lightningCount,
            lightningAvgDistance,
            battery,
            reportInterval,
          },
        ],
      };
    }
    case 'device_status': {
      return {
        serial_number: event.serial_number,
        hub_sn: event.hub_sn,
        type: 'device_status',
        timestamp: event.timestamp,
        uptime: event.uptime,
        voltage: event.voltage,
        firmware_revision: event.firmware_revision,
        rssi: event.rssi,
        hub_rssi: event.hub_rssi,
        sensor_status: {
          sensors_ok: (event.sensor_status & 0b000000000) !== 0,
          lightning_sensor_failed: (event.sensor_status & 0b000000001) !== 0,
          lightning_sensor_noise: (event.sensor_status & 0b000000010) !== 0,
          lightning_sensor_disturbance:
            (event.sensor_status & 0b000000100) !== 0,
          pressure_sensor_failed: (event.sensor_status & 0b000001000) !== 0,
          temperature_sensor_failed: (event.sensor_status & 0b000010000) !== 0,
          humidity_sensor_failed: (event.sensor_status & 0b000100000) !== 0,
          wind_sensor_failed: (event.sensor_status & 0b001000000) !== 0,
          precipitation_sensor_failed:
            (event.sensor_status & 0b010000000) !== 0,
          light_uv_sensor_failed: (event.sensor_status & 0b100000000) !== 0,
        },
        debug_enabled: event.debug === 1,
      };
    }
    case 'hub_status': {
      const {
        firmware_revision,
        uptime,
        rssi,
        timestamp,
        reset_flags,
        seq,
        fs,
        radio_stats,
        mqtt_stats,
        serial_number,
        type,
      } = event;
      return {
        serial_number,
        type,
        firmware_revision,
        uptime,
        rssi,
        timestamp,
        reset_flags: {
          BOR: reset_flags.includes('BOR'),
          PIN: reset_flags.includes('PIN'),
          POR: reset_flags.includes('POR'),
          SFT: reset_flags.includes('SFT'),
          WDG: reset_flags.includes('WDG'),
          WWD: reset_flags.includes('WWD'),
          LPW: reset_flags.includes('LPW'),
        },
        seq,
        fs,
        radio_stats: {
          version: radio_stats[0],
          rebootCount: radio_stats[1],
          i2cBusErrorCount: radio_stats[2],
          status: (['off', 'on', null, 'active'] as const)[radio_stats[3]]!,
          networkId: radio_stats[4],
        },
        mqtt_stats,
      };
    }
    default:
      throw new Error(`Unsupported event type: ${(event as any).type}`);
  }
}
