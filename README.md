# weatherflow-tempest-influxdb-integration

Pipes data from a Weatherflow Tempest into an influx server.

Supports InfluxDB 2.0 as that's what I'm running. Influx 1.8 also has an easy integration with Node so if you fork this you'd probably be able to update it to use that instead, it's just a different library and slightly different functions in `index.ts`.

## Configuration

Environment Variables:

- `INFLUX_BUCKET`
- `INFLUX_ORG`
- `INFLUX_TOKEN`
- `INFLUX_URL`

## Docker

The docker build doesn't run the TypeScript compiler or copy the `src` directory, so make sure that you've ran `npm run build` first.

Remember to map UDP port 50222 to the container so that it can listen to the Tempest broadcasting on the LAN.

### Publishing instructions

```
npm run build
docker build . -t kj800x/weatherflow-tempest-sensor
docker run -p 50222:50222/udp --env-file .env -t kj800x/weatherflow-tempest-sensor
docker push kj800x/weatherflow-tempest-sensor
```
