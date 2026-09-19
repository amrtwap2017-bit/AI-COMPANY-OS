# 23 Background Jobs

FastAPI BackgroundTasks and ad hoc non-blocking calls are used. Celery is a dependency but durable job use was not verified. Failures are commonly swallowed and lack demonstrated persistence/retry/observability/recovery. PARTIAL.
