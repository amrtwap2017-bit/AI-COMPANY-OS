"""Fallback tests for: Service Request to Work Order Auto-Routing"""


def test_service_request_to_work_order_auto_routi_health(client):
    res = client.get("/api/v1/service_request_to_work_order_auto_routi/health")
    assert res.status_code == 200
