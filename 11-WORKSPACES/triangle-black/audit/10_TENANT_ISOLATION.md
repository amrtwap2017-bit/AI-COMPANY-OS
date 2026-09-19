# 10 Tenant Isolation

| Surface | Scope | CustomerDataScope | Result |
|---|---|---|---|
| Assets/WOs/PM/procurement active subset | often `get_hotel_id` | no | PARTIAL |
| V15 recommendations/evidence/attention/import/adoption | source `hotel_id` | no | routes absent |
| Reports/exports/search/AI | mixed | no | NOT VERIFIED |
| legacy root leads | none | no | FAIL |

`get_hotel_id` defaults to shared hotel and may accept header when no bound hotel. Object authorization is not universally traced. P0 FAIL.
