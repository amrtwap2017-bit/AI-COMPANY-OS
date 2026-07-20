#!/usr/bin/env python3
import os, glob, json, datetime

ROOT = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/commercial"
OUT  = "/home/amr/AI-COMPANY-OS/tasks/logs/orm_model_inventory.json"

inventory = {}

for models_py in glob.glob(ROOT + "/**/models.py", recursive=True):
    domain = models_py.replace(ROOT + "/", "").replace("/models.py", "")
    with open(models_py) as f:
        content = f.read()
    inventory[domain] = {
        "file": models_py,
        "has_tablename": "__tablename__" in content,
        "uses_hotel_id": "hotel_id" in content,
        "uses_uuid": "uuid" in content or "String(36)" in content,
        "uses_integer_id": "Integer, primary_key=True" in content or "Column(Integer, primary_key=True" in content,
    }

report = {
    "timestamp": str(datetime.datetime.now()),
    "domains": inventory,
}

with open(OUT, "w") as f:
    json.dump(report, f, indent=2)

print("ORM Model Inventory")
print("=" * 40)
for domain, info in sorted(inventory.items()):
    print(domain.ljust(30), "hotel_id=", info["uses_hotel_id"], "int_id=", info["uses_integer_id"])
print("\nSaved:", OUT)
