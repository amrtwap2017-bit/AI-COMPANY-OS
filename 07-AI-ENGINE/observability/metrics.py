from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

HTTP_REQUESTS = Counter(
    "hub_http_requests_total",
    "Total HTTP requests",
    ["path", "method", "status"],
)

HTTP_LATENCY = Histogram(
    "hub_http_request_latency_seconds",
    "HTTP request latency",
    ["path", "method"],
)

TOOL_CALLS = Counter(
    "hub_tool_calls_total",
    "Total tool calls",
    ["tool_name", "ok"],
)

BENCH_RUNS = Counter(
    "hub_benchmark_runs_total",
    "Total benchmark runs",
    ["benchmark_id", "ok", "is_regression"],
)

def render_metrics():
    return generate_latest(), CONTENT_TYPE_LATEST
