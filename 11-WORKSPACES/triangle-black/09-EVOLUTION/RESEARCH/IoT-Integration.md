# 11 — IoT Integration

> Internet of Things integration for smart hotel operations.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Research-Roadmap.md | Research areas |

## IoT Use Cases

| Use Case | Devices | Data | Value | Timeline |
|----------|---------|------|-------|----------|
| Room temperature control | Smart thermostats | Temperature, humidity | Energy savings 20% | H2 |
| Occupancy detection | Motion sensors | Room occupancy | Housekeeping trigger, energy | H2 |
| Energy monitoring | Smart meters | Energy consumption | Cost reduction, sustainability | H2 |
| Maintenance alerts | Vibration sensors | Equipment status | Predictive maintenance | H2-H3 |
| Smart locks | Electronic locks | Access logs | Security, keyless entry | H3 |
| Inventory tracking | RFID tags | Stock levels | Auto-reorder, theft prevention | H3 |

## IoT Architecture

```
IoT Devices ──► Gateway ──► MQTT Broker ──► IoT Platform ──► Triangle Black
   │             │            │              │                 │
Sensors,    Edge       EMQX or      Data          API
actuators   gateway    Mosquitto    processing    integration
```

## Device Management

| Function | Tool | Description |
|----------|------|-------------|
| Device registry | PostgreSQL | Device identity, metadata |
| Firmware updates | OTA (over-the-air) | Secure device updates |
| Device monitoring | Grafana | Device health, connectivity |
| Alerting | Prometheus + Alertmanager | Device offline, battery low |

## IoT Security

| Security Measure | Implementation |
|-----------------|---------------|
| Device authentication | Unique certificates per device |
| Data encryption | TLS 1.3 between device and broker |
| Network segmentation | IoT devices on separate VLAN |
| Firmware signing | Signed firmware images |
| Access control | Device-specific API tokens |
| Audit logging | All device communications logged |

## IoT Budget

| Item | H2 Cost | H3 Cost |
|------|---------|---------|
| Development hardware | $1K | $3K |
| Pilot deployment (1 hotel) | $2K | $5K |
| Cloud infrastructure | $200/mo | $500/mo |
| Device certification | $500 | $1K |
