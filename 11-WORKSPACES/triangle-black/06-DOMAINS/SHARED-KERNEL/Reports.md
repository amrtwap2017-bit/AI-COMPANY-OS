# 00-SHARED-KERNEL — Reports

## Report Engine

Reports are generated on-demand from domain data with shared templates.

| Report Template | Used By | Format |
|----------------|---------|--------|
| Quotation PDF | 01-COMMERCIAL | PDF |
| Contract PDF | 01-COMMERCIAL | PDF |
| Invoice PDF | 06-FINANCIAL-CONTROL | PDF |
| Purchase Order PDF | 03-PROCUREMENT | PDF |
| Survey Report PDF | 01-COMMERCIAL | PDF |
| Pipeline Report | 01-COMMERCIAL | PDF/CSV |
| Financial Report | 06-FINANCIAL-CONTROL | PDF/CSV |
| Maintenance Report | 07-MAINTENANCE | PDF |

## Template Engine

```
templates/
  quotations/
    standard.hbs          (Handlebars template)
  contracts/
    standard.hbs
  invoices/
    standard.hbs
  surveys/
    standard.hbs
```
