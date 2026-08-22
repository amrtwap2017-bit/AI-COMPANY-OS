# Disaster Recovery Plan (DRP)
RTO and RPO boundaries for commercial properties.

## Operational Targets
- **Recovery Time Objective (RTO):** < 4 Hours (Maximum allowable outage window).
- **Recovery Point Objective (RPO):** < 24 Hours (Maximum allowable data loss window).

## Recovery Strategy
1. **Primary Node Outage:**
   - In the event of primary database node corruption, spin up an auxiliary PostgreSQL instance.
   - Restore the latest verified SQL backup from `/backups/db/`.
2. **Region Loss (SaaS Cluster):**
   - Spin up secondary cluster nodes using the production Docker Compose configurations (`production.yml`).
   - Re-route DNS parameters to point to the new healthy region.
