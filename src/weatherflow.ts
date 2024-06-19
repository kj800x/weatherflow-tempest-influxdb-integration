interface BaseEvent {
  serial_number: string;
  hub_sn: string;
  type: string;
}

interface RainStartEvent extends BaseEvent {
  type: "evt_precip";
  evt: [
    number // time epoch in second
  ];
}

interface RainStartEventDecoded extends BaseEvent {
  type: "evt_precip";
  /** time epoch in second */
  timestamp: number;
}

interface LightningStrikeEvent extends BaseEvent {
  type: "evt_strike";
  evt: [
    number, // time epoch in seconds
    number, // distance in km
    number // energy
  ];
}

interface LightningStrikeEventDecoded extends BaseEvent {
  type: "evt_strike";
  /** Time epoch in seconds */
  time: number;
  /** Distance in km */
  distance: number;
  /** Energy */
  energy: number;
}

interface RapidWindEvent extends BaseEvent {
  type: "rapid_wind";
  ob: [
    number, // time epoch in seconds
    number, // wind speed in mps
    number // wind direction in degrees
  ];
}

interface RapidWindEventDecoded extends BaseEvent {
  type: "rapid_wind";
  /** Time epoch in seconds */
  time: number;
  /** Wind speed in meters per second */
  speed: number;
  /** Wind direction in degrees */
  direction: number;
}

interface TempestObservation extends BaseEvent {
  type: "obs_st";
  obs: [
    number, // time epoch in seconds

    number | null, // wind lull in m/s
    number | null, // wind avg in m/s
    number | null, // wind gust in m/s
    number | null, // wind direction in degrees
    number | null, // wind sample interval in seconds

    number | null, // station pressure in MB
    number | null, // air temperature in C
    number | null, // relative humidity in %

    number | null, // illuminance in lux
    number | null, // uv in index
    number | null, // solar radiation in W/m^2

    number | null, // rain amount over previous minute in mm
    number | null, // precipitation type (0 = none, 1 = rain, 2 = hail)

    number | null, // lighting strike count
    number | null, // lighting strike avg distance in km

    number | null, // battery in volts
    number | null // report interval in minutes
  ][];
  firmware_revision: number;
}

interface TempestObservationDecoded extends BaseEvent {
  type: "obs_st";
  /** Firmware revision */
  firmwareRevision: number;
  observations: {
    /** Time epoch in seconds */
    time: number | null;
    /** Wind lull in meters per second */
    windLull: number | null;
    /** Wind average in meters per second */
    windAvg: number | null;
    /** Wind gust in meters per second */
    windGust: number | null;
    /** Wind direction in degrees */
    windDirection: number | null;
    /** Wind sample interval in seconds */
    windSampleInterval: number | null;
    /** Station pressure in millibars */
    stationPressure: number | null;
    /** Air temperature in degrees Celsius */
    temperature: number | null;
    /** Relative humidity in percent */
    humidity: number | null;
    /** Illuminance in lux */
    illuminance: number | null;
    /** UV index */
    uvIndex: number | null;
    /** Solar radiation in watts per square meter */
    solarRadiation: number | null;
    /** Rain amount over previous minute in millimeters */
    rainAmount: number | null;
    /** Precipitation type */
    precipitationType: "none" | "rain" | "hail" | "error";
    /** Lightning strike count */
    lightningCount: number | null;
    /** Lightning strike average distance in kilometers */
    lightningAvgDistance: number | null;
    /** Battery voltage in volts */
    battery: number | null;
    /** Report interval in minutes */
    reportInterval: number | null;
  }[];
}

interface HubStatus extends Omit<BaseEvent, "hub_sn"> {
  type: "hub_status";
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

interface HubStatusDecoded extends Omit<BaseEvent, "hub_sn"> {
  type: "hub_status";
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
    status: "off" | "on" | "active" | null;
    networkId: number;
  };
  mqtt_stats: [number, number]; // undocumented
}

interface DeviceStatus extends BaseEvent {
  type: "device_status";
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
  type: "device_status";
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
    case "evt_precip": {
      const [timestamp] = event.evt;
      return {
        hub_sn: event.hub_sn,
        type: event.type,
        serial_number: event.serial_number,
        timestamp,
      };
    }
    case "evt_strike": {
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
    case "rapid_wind": {
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
    case "obs_st": {
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
            precipitationType: (["none", "rain", "hail", "error"] as const)[
              precipitationType ?? 3
            ]!,
            lightningCount,
            lightningAvgDistance,
            battery,
            reportInterval,
          },
        ],
      };
    }
    case "device_status": {
      // Weatherflow has a bug where the sensor status is inverted
      // https://community.tempest.earth/t/udp-sensor-status-655871/23807
      // https://community.tempest.earth/t/sensor-status-bits/23272
      // corrected_sensor_status, but want to keep things on single lines for
      // readability
      const css = event.sensor_status ^ 0b111111111;

      return {
        serial_number: event.serial_number,
        hub_sn: event.hub_sn,
        type: "device_status",
        timestamp: event.timestamp,
        uptime: event.uptime,
        voltage: event.voltage,
        firmware_revision: event.firmware_revision,
        rssi: event.rssi,
        hub_rssi: event.hub_rssi,
        sensor_status: {
          sensors_ok: (css & 0b111111111) === 0,
          lightning_sensor_failed: (css & 0b000000001) !== 0,
          lightning_sensor_noise: (css & 0b000000010) !== 0,
          lightning_sensor_disturbance: (css & 0b000000100) !== 0,
          pressure_sensor_failed: (css & 0b000001000) !== 0,
          temperature_sensor_failed: (css & 0b000010000) !== 0,
          humidity_sensor_failed: (css & 0b000100000) !== 0,
          wind_sensor_failed: (css & 0b001000000) !== 0,
          precipitation_sensor_failed: (css & 0b010000000) !== 0,
          light_uv_sensor_failed: (css & 0b100000000) !== 0,
        },
        debug_enabled: event.debug === 1,
      };
    }
    case "hub_status": {
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
          BOR: reset_flags.includes("BOR"),
          PIN: reset_flags.includes("PIN"),
          POR: reset_flags.includes("POR"),
          SFT: reset_flags.includes("SFT"),
          WDG: reset_flags.includes("WDG"),
          WWD: reset_flags.includes("WWD"),
          LPW: reset_flags.includes("LPW"),
        },
        seq,
        fs,
        radio_stats: {
          version: radio_stats[0],
          rebootCount: radio_stats[1],
          i2cBusErrorCount: radio_stats[2],
          status: (["off", "on", null, "active"] as const)[radio_stats[3]]!,
          networkId: radio_stats[4],
        },
        mqtt_stats,
      };
    }
    default:
      throw new Error(`Unsupported event type: ${(event as any).type}`);
  }
}
