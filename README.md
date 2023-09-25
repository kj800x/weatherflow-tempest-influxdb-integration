# weatherflow-tempest-influxdb-integration

Exports tempest data in a Prometheus exporter endpoint.

Previously was written for InfluxDB 2.0. Take a look into git history if you use Influx instead. Arguably Influx is a better fit for this type of data than Prometheus, but I'm trying something new :)

## Configuration

Just deploy it. It'll expose a Prometheus metrics endpoint on 0.0.0.0:8080

## Docker

The docker build doesn't run the TypeScript compiler or copy the `src` directory, so make sure that you've ran `npm run build` first.

Remember to map UDP port 50222 to the container so that it can listen to the Tempest broadcasting on the LAN.
Remember to map TCP 8080 to whatever port you want on the host and then configure Prometheus to scrape it

### Publishing instructions

```
npm run build
docker build . -t kj800x/weatherflow-tempest-sensor
docker run -p 50222:50222/udp -p 8080:8080/tcp -t kj800x/weatherflow-tempest-sensor
docker push kj800x/weatherflow-tempest-sensor
```
