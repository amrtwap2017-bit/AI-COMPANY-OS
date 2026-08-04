"""
Sprint-013: Employee Timesheets Tests
"""
import pytest
from datetime import date


def test_create_timesheet(client, auth_headers):
    res = client.post("/api/v1/timesheets/", json={
        "employee_id": "emp-001",
        "work_date": str(date.today()),
        "work_type": "regular",
        "hours_worked": 8,
        "overtime_hours": 0,
        "notes": "Normal work day",
    }, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["employee_id"] == "emp-001"
    assert data["status"] == "pending"
    assert float(data["hours_worked"]) == 8.0


def test_list_timesheets(client, auth_headers):
    res = client.get("/api/v1/timesheets/?limit=10", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "count" in data
    assert "results" in data
    assert isinstance(data["results"], list)


def test_get_timesheet(client, auth_headers):
    create = client.post("/api/v1/timesheets/", json={
        "employee_id": "emp-002",
        "work_date": str(date.today()),
        "work_type": "overtime",
        "hours_worked": 10,
    }, headers=auth_headers)
    assert create.status_code == 201
    ts_id = create.json()["id"]

    res = client.get(f"/api/v1/timesheets/{ts_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["id"] == ts_id


def test_approve_timesheet(client, auth_headers):
    create = client.post("/api/v1/timesheets/", json={
        "employee_id": "emp-003",
        "work_date": str(date.today()),
        "work_type": "regular",
        "hours_worked": 8,
    }, headers=auth_headers)
    ts_id = create.json()["id"]

    res = client.post(f"/api/v1/timesheets/{ts_id}/approve",
        json={"approved_by": "manager-001"},
        headers=auth_headers
    )
    assert res.status_code == 200
    assert res.json()["status"] == "approved"
    assert res.json()["approved_by"] == "manager-001"


def test_reject_timesheet(client, auth_headers):
    create = client.post("/api/v1/timesheets/", json={
        "employee_id": "emp-004",
        "work_date": str(date.today()),
        "work_type": "sick",
        "hours_worked": 8,
    }, headers=auth_headers)
    ts_id = create.json()["id"]

    res = client.post(f"/api/v1/timesheets/{ts_id}/reject",
        json={"approved_by": "manager-001", "rejection_reason": "No medical certificate"},
        headers=auth_headers
    )
    assert res.status_code == 200
    assert res.json()["status"] == "rejected"


def test_employee_summary(client, auth_headers):
    client.post("/api/v1/timesheets/", json={
        "employee_id": "emp-summary-test",
        "work_date": str(date.today()),
        "work_type": "regular",
        "hours_worked": 8,
    }, headers=auth_headers)

    res = client.get("/api/v1/timesheets/employee/emp-summary-test/summary", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["employee_id"] == "emp-summary-test"
    assert data["total_entries"] >= 1
    assert data["total_hours"] >= 8.0


def test_filter_by_employee(client, auth_headers):
    client.post("/api/v1/timesheets/", json={
        "employee_id": "emp-filter-test",
        "work_date": str(date.today()),
        "work_type": "regular",
        "hours_worked": 8,
    }, headers=auth_headers)

    res = client.get("/api/v1/timesheets/?employee_id=emp-filter-test", headers=auth_headers)
    assert res.status_code == 200
    results = res.json()["results"]
    assert all(r["employee_id"] == "emp-filter-test" for r in results)


def test_tenant_isolation(client, auth_headers):
    res = client.get("/api/v1/timesheets/nonexistent-id-xyz", headers=auth_headers)
    assert res.status_code == 404
