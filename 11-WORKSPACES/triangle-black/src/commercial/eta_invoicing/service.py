from __future__ import annotations
import os
import uuid
import json
from datetime import datetime
from typing import Optional

class ETAService:
    """
    ETA E-Invoicing service for Egypt.
    Sandbox: https://api.invoicing.eta.gov.eg/apis/portalintegrationtest
    Production: https://api.invoicing.eta.gov.eg/
    
    NOTE: Requires ETA portal registration to get client_id and client_secret.
    Set environment variables:
      ETA_CLIENT_ID, ETA_CLIENT_SECRET, ETA_SANDBOX=1
    """
    
    def __init__(self):
        self.client_id = os.environ.get("ETA_CLIENT_ID", "")
        self.client_secret = os.environ.get("ETA_CLIENT_SECRET", "")
        self.sandbox = os.environ.get("ETA_SANDBOX", "1") == "1"
        self.base_url = (
            "https://api.invoicing.eta.gov.eg/apis/portalintegrationtest"
            if self.sandbox
            else "https://api.invoicing.eta.gov.eg"
        )
        self._token: Optional[str] = None
        self._token_expiry: Optional[datetime] = None

    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)

    async def get_token(self) -> Optional[str]:
        if not self.is_configured():
            return None
        if self._token and self._token_expiry and datetime.utcnow() < self._token_expiry:
            return self._token
        try:
            import httpx
            r = httpx.post(f"{self.base_url}/api/auth/token",
                json={"client_id": self.client_id, "client_secret": self.client_secret,
                      "grant_type": "client_credentials"})
            if r.status_code == 200:
                data = r.json()
                self._token = data.get("access_token")
                from datetime import timedelta
                self._token_expiry = datetime.utcnow() + timedelta(minutes=55)
                return self._token
        except Exception as e:
            print(f"ETA token error: {e}")
        return None

    def build_invoice_payload(self, data: dict, hotel_tax_id: str = "") -> dict:
        return {
            "issuer": {
                "type": "B",
                "id": hotel_tax_id or "000000000",
                "name": data.get("hotel_name", "Triangle Black Hotel"),
                "address": {
                    "branchID": "0",
                    "country": "EG",
                    "governate": "Cairo",
                    "regionCity": "Cairo",
                    "street": "Hotel Street",
                    "buildingNumber": "1",
                },
            },
            "receiver": {
                "type": "B",
                "id": data.get("buyer_tax_id", "000000000"),
                "name": data.get("buyer_name", "Unknown Buyer"),
                "address": {"country": "EG"},
            },
            "documentType": "I",
            "documentTypeVersion": "1.0",
            "dateTimeIssued": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "taxpayerActivityCode": "5010",
            "internalID": data.get("invoice_number", str(uuid.uuid4())[:8]),
            "invoiceLines": [{
                "description": "Engineering Services",
                "itemType": "EGS",
                "itemCode": "EG-SRV-001",
                "unitType": "SRV",
                "quantity": 1,
                "unitValue": {"currencySold": "EGP",
                              "amountEGP": data.get("total_amount", 0)},
                "salesTotal": data.get("total_amount", 0),
                "total": data.get("total_amount", 0),
                "valueDifference": 0,
                "totalTaxableFees": 0,
                "netTotal": data.get("total_amount", 0),
                "itemsDiscount": 0,
                "taxableItems": [{
                    "taxType": "T1", "amount": data.get("tax_amount", 0),
                    "subType": "V009", "rate": 14
                }],
                "totalItemsDiscount": 0,
                "discount": {"rate": 0, "amount": 0},
            }],
            "totalSalesAmount": data.get("total_amount", 0),
            "totalDiscountAmount": 0,
            "netAmount": data.get("total_amount", 0),
            "taxTotals": [{"taxType": "T1", "amount": data.get("tax_amount", 0)}],
            "totalAmount": data.get("total_amount", 0) + data.get("tax_amount", 0),
            "extraDiscountAmount": 0,
            "totalItemsDiscountAmount": 0,
        }

    async def submit_invoice(self, payload: dict) -> dict:
        if not self.is_configured():
            return {"ok": False, "error": "ETA not configured. Set ETA_CLIENT_ID and ETA_CLIENT_SECRET.",
                    "sandbox": self.sandbox}
        token = await self.get_token()
        if not token:
            return {"ok": False, "error": "Failed to get ETA token"}
        try:
            import httpx
            r = httpx.post(f"{self.base_url}/api/v1/documentsubmissions",
                json={"documents": [payload]},
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
            return {"ok": r.status_code in (200, 202), "status": r.status_code,
                    "data": r.json() if r.content else {}}
        except Exception as e:
            return {"ok": False, "error": str(e)}

eta_service = ETAService()
