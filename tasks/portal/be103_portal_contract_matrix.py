#!/usr/bin/env python3
import json, datetime

OUT = "/home/amr/AI-COMPANY-OS/tasks/logs/portal_contract_matrix.json"

matrix = {
    "/dashboard": {
        "api": ["/api/v1/actions/dashboard/stats", "/api/v1/actions/pipeline/summary"],
        "status": "PARTIAL",
    },
    "/leads": {
        "api": ["/api/v1/actions/leads/search", "/api/v1/actions/leads/{lead_id}", "/api/v1/actions/leads/create"],
        "status": "WORKING",
    },
    "/work-orders": {
        "api": ["/api/v1/work-orders/"],
        "status": "WORKING",
    },
    "/technicians": {
        "api": ["/api/v1/technicians/"],
        "status": "WORKING",
    },
    "/assets": {
        "api": ["/api/v1/assets/"],
        "status": "WORKING",
    },
    "/inventory": {
        "api": ["/api/v1/inventory/items/", "/api/v1/actions/inventory/stock-balances"],
        "status": "PARTIAL",
    },
    "/warehouses": {
        "api": ["/api/v1/inventory/warehouses/"],
        "status": "WORKING",
    },
    "/reports": {
        "api": ["/api/v1/actions/reports/dashboard", "/api/v1/actions/reports/agent-leaderboard"],
        "status": "WORKING",
    },
    "/maintenance/*": {
        "api": ["/api/v1/maintenance/*"],
        "status": "MISSING",
    },
    "/executive/*": {
        "api": ["/api/v1/actions/executive/*"],
        "status": "MISSING",
    },
    "/analytics/*": {
        "api": ["/api/v1/analytics/*"],
        "status": "MISSING",
    },
    "/approvals": {
        "api": ["/api/v1/approvals/"],
        "status": "MISSING",
    },
    "/customers/*": {
        "api": ["/api/v1/customers/*"],
        "status": "MISSING",
    },
    "/projects-center/*": {
        "api": ["/api/v1/projects/*"],
        "status": "MISSING",
    },
}

with open(OUT, "w") as f:
    json.dump({
        "timestamp": str(datetime.datetime.now()),
        "matrix": matrix,
    }, f, indent=2)

print("Portal Contract Matrix")
print("=" * 40)
for route, info in matrix.items():
    print(route.ljust(24), info["status"])
print("\nSaved:", OUT)
