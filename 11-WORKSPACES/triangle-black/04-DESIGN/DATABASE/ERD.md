# Entity Relationship Diagram (ERD)

## Public Schema (Platform)

```
┌─────────────────────────────────────────────────────┐
│                     tenants                           │
├─────────────────────────────────────────────────────┤
│ id              UUID          PK                     │
│ name            VARCHAR(255)  NOT NULL               │
│ slug            VARCHAR(100)  NOT NULL UNIQUE        │
│ domain          VARCHAR(255)  NULL                   │
│ status          tenant_status NOT NULL DEFAULT 'active' │
│ config          JSONB         NOT NULL DEFAULT '{}'  │
│ created_at      TIMESTAMPTZ   NOT NULL               │
│ updated_at      TIMESTAMPTZ   NOT NULL               │
│ created_by      UUID          NOT NULL               │
│ updated_by      UUID          NOT NULL               │
│ deleted_at      TIMESTAMPTZ   NULL                   │
└──────────────────────┬──────────────────────────────┘
                       │ 1
                       │
                       │ N
┌──────────────────────┴──────────────────────────────┐
│                     users                             │
├─────────────────────────────────────────────────────┤
│ id              UUID          PK                     │
│ tenant_id       UUID          FK → tenants.id        │
│ email           VARCHAR(255)  NOT NULL UNIQUE        │
│ password_hash   VARCHAR(255)  NOT NULL               │
│ first_name      VARCHAR(100)  NOT NULL               │
│ last_name       VARCHAR(100)  NOT NULL               │
│ role            user_role     NOT NULL               │
│ is_active       BOOLEAN       NOT NULL DEFAULT true  │
│ last_login_at   TIMESTAMPTZ   NULL                   │
│ created_at      TIMESTAMPTZ   NOT NULL               │
│ updated_at      TIMESTAMPTZ   NOT NULL               │
│ created_by      UUID          NOT NULL               │
│ updated_by      UUID          NOT NULL               │
│ deleted_at      TIMESTAMPTZ   NULL                   │
└──────────────────────────────────────────────────────┘
```

## Per-Tenant Schema (tenant_{id})

```
┌───────────────────────────────────────────────────────┐
│                    properties                           │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ name            VARCHAR(255)  NOT NULL                 │
│ slug            VARCHAR(100)  NOT NULL                 │
│ description     TEXT          NULL                     │
│ address         JSONB         NOT NULL                 │
│ contact_email   VARCHAR(255)  NULL                     │
│ contact_phone   VARCHAR(50)   NULL                     │
│ timezone        VARCHAR(50)   NOT NULL DEFAULT 'UTC'   │
│ currency        VARCHAR(3)    NOT NULL DEFAULT 'USD'   │
│ status          prop_status   NOT NULL DEFAULT 'active'│
│ config          JSONB         NOT NULL DEFAULT '{}'    │
│ created_at      TIMESTAMPTZ   NOT NULL                 │
│ updated_at      TIMESTAMPTZ   NOT NULL                 │
│ created_by      UUID          NOT NULL                 │
│ updated_by      UUID          NOT NULL                 │
│ deleted_at      TIMESTAMPTZ   NULL                     │
└──────────┬────────────────────────────────────────────┘
           │ 1
           │
           │ N
┌──────────┴────────────────────────────────────────────┐
│                      units                              │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ property_id     UUID          FK → properties.id       │
│ name            VARCHAR(255)  NOT NULL                 │
│ description     TEXT          NULL                     │
│ unit_type       unit_type     NOT NULL                 │
│ max_occupancy   INTEGER       NOT NULL                 │
│ bedrooms        INTEGER       NOT NULL DEFAULT 1       │
│ bathrooms       INTEGER       NOT NULL DEFAULT 1       │
│ size_sqft       INTEGER       NULL                     │
│ amenities       JSONB         NOT NULL DEFAULT '[]'    │
│ images          JSONB         NOT NULL DEFAULT '[]'    │
│ base_rate       DECIMAL(10,2) NOT NULL                 │
│ status          unit_status   NOT NULL DEFAULT 'available' │
│ created_at      TIMESTAMPTZ   NOT NULL                 │
│ updated_at      TIMESTAMPTZ   NOT NULL                 │
│ created_by      UUID          NOT NULL                 │
│ updated_by      UUID          NOT NULL                 │
│ deleted_at      TIMESTAMPTZ   NULL                     │
└──────────┬────────────────────────────────────────────┘
           │ 1
           │
           │ N
┌──────────┴────────────────────────────────────────────┐
│                  rate_plans                              │
├───────────────────────────────────────────────────┬───┤
│ id              UUID          PK                  │   │
│ property_id     UUID          FK → properties.id  │   │
│ name            VARCHAR(255)  NOT NULL            │   │
│ description     TEXT          NULL                │   │
│ base_rate       DECIMAL(10,2) NOT NULL            │   │
│ currency        VARCHAR(3)    NOT NULL DEFAULT 'USD'  │
│ min_nights      INTEGER       NOT NULL DEFAULT 1  │   │
│ max_nights      INTEGER       NULL                │   │
│ cancellation_policy cancellation_policy NOT NULL  │   │
│ rules           JSONB         NOT NULL DEFAULT '{}'   │
│ is_active       BOOLEAN       NOT NULL DEFAULT true   │
│ created_at      TIMESTAMPTZ   NOT NULL            │   │
│ updated_at      TIMESTAMPTZ   NOT NULL            │   │
│ created_by      UUID          NOT NULL            │   │
│ updated_by      UUID          NOT NULL            │   │
│ deleted_at      TIMESTAMPTZ   NULL                │   │
└───────────────────────────────────────────────────┴───┘

┌───────────────────────────────────────────────────────┐
│                   reservations                          │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ property_id     UUID          FK → properties.id       │
│ guest_id        UUID          FK → guests.id           │
│ confirmation_code VARCHAR(20) NOT NULL UNIQUE          │
│ source          booking_source NOT NULL DEFAULT 'direct'│
│ status          booking_status NOT NULL DEFAULT 'pending' │
│ check_in        DATE          NOT NULL                 │
│ check_out       DATE          NOT NULL                 │
│ adults          INTEGER       NOT NULL DEFAULT 1       │
│ children        INTEGER       NOT NULL DEFAULT 0       │
│ total_amount    DECIMAL(12,2) NOT NULL                 │
│ balance_due     DECIMAL(12,2) NOT NULL                 │
│ currency        VARCHAR(3)    NOT NULL DEFAULT 'USD'   │
│ notes           TEXT          NULL                     │
│ channel_data    JSONB         NULL                     │
│ cancelled_at    TIMESTAMPTZ   NULL                     │
│ cancellation_reason TEXT      NULL                     │
│ check_in_at     TIMESTAMPTZ   NULL                     │
│ check_out_at    TIMESTAMPTZ   NULL                     │
│ created_at      TIMESTAMPTZ   NOT NULL                 │
│ updated_at      TIMESTAMPTZ   NOT NULL                 │
│ created_by      UUID          NOT NULL                 │
│ updated_by      UUID          NOT NULL                 │
│ deleted_at      TIMESTAMPTZ   NULL                     │
└──────────┬────────────────────────────────────────────┘
           │ 1
           │
           │ N                         1 │
┌──────────┴─────────────┐  ┌───────────┴────────────┐
│   reservation_units     │  │    reservation_guests   │
├─────────────────────────┤  ├────────────────────────┤
│ id             UUID  PK │  │ id             UUID PK │
│ reservation_id UUID FK  │  │ reservation_id UUID FK │
│ unit_id        UUID FK  │  │ guest_id       UUID FK │
│ rate_plan_id   UUID FK  │  │ is_primary BOOLEAN     │
│ nightly_rate   DECIMAL  │  │ created_at TIMESTAMPTZ │
│ total          DECIMAL  │  └────────────────────────┘
│ created_at TIMESTAMPTZ  │
└──────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                      guests                              │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ property_id     UUID          FK → properties.id       │
│ first_name      VARCHAR(100)  NOT NULL                 │
│ last_name       VARCHAR(100)  NOT NULL                 │
│ email           VARCHAR(255)  NULL                     │
│ phone           VARCHAR(50)   NULL                     │
│ address         JSONB         NULL                     │
│ date_of_birth   DATE          NULL                     │
│ id_document     JSONB         NULL                     │
│ preferences     JSONB         NOT NULL DEFAULT '{}'    │
│ notes           TEXT          NULL                     │
│ total_stays     INTEGER       NOT NULL DEFAULT 0       │
│ total_revenue   DECIMAL(12,2) NOT NULL DEFAULT 0       │
| created_at      TIMESTAMPTZ   NOT NULL                 │
│ updated_at      TIMESTAMPTZ   NOT NULL                 │
│ created_by      UUID          NOT NULL                 │
│ updated_by      UUID          NOT NULL                 │
│ deleted_at      TIMESTAMPTZ   NULL                     │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                      folios                              │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ reservation_id  UUID          FK → reservations.id      │
│ folio_number    VARCHAR(50)   NOT NULL UNIQUE          │
│ status          folio_status  NOT NULL DEFAULT 'open'  │
│ subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0       │
│ tax_total       DECIMAL(12,2) NOT NULL DEFAULT 0       │
│ grand_total     DECIMAL(12,2) NOT NULL DEFAULT 0       │
│ balance         DECIMAL(12,2) NOT NULL DEFAULT 0       │
│ closed_at       TIMESTAMPTZ   NULL                     │
│ created_at      TIMESTAMPTZ   NOT NULL                 │
│ updated_at      TIMESTAMPTZ   NOT NULL                 │
│ created_by      UUID          NOT NULL                 │
│ updated_by      UUID          NOT NULL                 │
│ deleted_at      TIMESTAMPTZ   NULL                     │
└──────────┬────────────────────────────────────────────┘
           │ 1
           │
           │ N
┌──────────┴────────────────────────────────────────────┐
│                    folio_entries                          │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ folio_id        UUID          FK → folios.id           │
│ description     VARCHAR(500)  NOT NULL                 │
│ entry_type      entry_type    NOT NULL                 │
│ amount          DECIMAL(12,2) NOT NULL                 │
│ quantity        INTEGER       NOT NULL DEFAULT 1       │
│ reference_id    UUID          NULL                     │
│ reference_type  VARCHAR(50)   NULL                     │
│ posted_at       TIMESTAMPTZ   NOT NULL                 │
│ created_at      TIMESTAMPTZ   NOT NULL                 │
│ updated_at      TIMESTAMPTZ   NOT NULL                 │
│ created_by      UUID          NOT NULL                 │
│ updated_by      UUID          NOT NULL                 │
│ deleted_at      TIMESTAMPTZ   NULL                     │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                     payments                             │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ folio_id        UUID          FK → folios.id           │
│ reservation_id  UUID          FK → reservations.id      │
│ payment_method  payment_method NOT NULL                │
│ amount          DECIMAL(12,2) NOT NULL                 │
│ currency        VARCHAR(3)    NOT NULL DEFAULT 'USD'   │
│ status          payment_status NOT NULL                │
│ gateway_response JSONB        NULL                     │
│ transaction_id  VARCHAR(255)  NULL                     │
│ paid_at         TIMESTAMPTZ   NOT NULL                 │
│ refunded_at     TIMESTAMPTZ   NULL                     │
│ created_at      TIMESTAMPTZ   NOT NULL                 │
│ updated_at      TIMESTAMPTZ   NOT NULL                 │
│ created_by      UUID          NOT NULL                 │
│ updated_by      UUID          NOT NULL                 │
│ deleted_at      TIMESTAMPTZ   NULL                     │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                housekeeping_tasks                        │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ property_id     UUID          FK → properties.id       │
│ unit_id         UUID          FK → units.id            │
│ assigned_to     UUID          FK → users.id            │
│ task_type       task_type     NOT NULL                 │
│ status          task_status   NOT NULL DEFAULT 'pending'│
│ priority        task_priority NOT NULL DEFAULT 'normal'│
│ notes           TEXT          NULL                     │
│ scheduled_date  DATE          NOT NULL                 │
│ completed_at    TIMESTAMPTZ   NULL                     │
│ created_at      TIMESTAMPTZ   NOT NULL                 │
│ updated_at      TIMESTAMPTZ   NOT NULL                 │
│ created_by      UUID          NOT NULL                 │
│ updated_by      UUID          NOT NULL                 │
│ deleted_at      TIMESTAMPTZ   NULL                     │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                   audit_log (all schemas)                │
├───────────────────────────────────────────────────────┤
│ id              BIGSERIAL     PK                       │
│ tenant_id       UUID          NULL (null for platform) │
│ table_name      VARCHAR(100)  NOT NULL                 │
│ record_id       UUID          NOT NULL                 │
│ action          audit_action  NOT NULL                 │
│ old_values      JSONB         NULL                     │
│ new_values      JSONB         NULL                     │
│ changed_by      UUID          NOT NULL                 │
│ changed_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()   │
│ ip_address      INET          NULL                     │
│ user_agent      VARCHAR(500)  NULL                     │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                 refresh_tokens (public schema)            │
├───────────────────────────────────────────────────────┤
│ id              UUID          PK                       │
│ user_id         UUID          FK → users.id            │
│ token_hash      VARCHAR(255)  NOT NULL                 │
│ expires_at      TIMESTAMPTZ   NOT NULL                 │
│ created_at      TIMESTAMPTZ   NOT NULL                 │
│ revoked_at      TIMESTAMPTZ   NULL                     │
└───────────────────────────────────────────────────────┘
```

## Relationship Summary

| Entity | Parent | Type |
|--------|--------|------|
| users | tenants | N:1 |
| units | properties | N:1 |
| rate_plans | properties | N:1 |
| reservations | properties | N:1 |
| reservations | guests | N:1 |
| reservation_units | reservations | N:1 |
| reservation_units | units | N:1 |
| reservation_guests | reservations | N:1 |
| reservation_guests | guests | N:1 |
| folios | reservations | N:1 |
| folio_entries | folios | N:1 |
| payments | folios | N:1 |
| payments | reservations | N:1 |
| housekeeping_tasks | properties | N:1 |
| housekeeping_tasks | units | N:1 |
| housekeeping_tasks | users | N:1 |
