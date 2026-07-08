# 05-INVENTORY — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| stock.received | Goods receipt posted | Inventory value update |
| stock.issued | Materials issued to project | Project cost update, budget consumption |
| stock.transferred | Transfer completed | Destination warehouse stock update |
| stock.adjusted | Stock adjustment approved | Inventory valuation recalc |
| stock.low_stock | Stock below min_level | Reorder notification to procurement |
