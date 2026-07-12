from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
Triangle Black — Enterprise PDF Quote Generator
World-class engineering services proposal document
"""
import io
from datetime import datetime
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)

NAVY       = colors.HexColor("#1B2B4B")
AMBER      = colors.HexColor("#F59E0B")
DARK_GRAY  = colors.HexColor("#374151")
MID_GRAY   = colors.HexColor("#6B7280")
LIGHT_GRAY = colors.HexColor("#F3F4F6")
WHITE      = colors.white
GREEN      = colors.HexColor("#059669")
LIGHT_NAVY = colors.HexColor("#EFF3FA")

COMPANY = {
    "name":    "Triangle Black Engineering",
    "tagline": "Premier Hotel Engineering Solutions",
    "address": "Cairo, Egypt | Sharm El Sheikh | Hurghada",
    "phone":   "+20 100 123 4567",
    "email":   "contracts@triangleblack.com",
    "website": "www.triangleblack.com",
    "cr":      "Commercial Registration: 123456",
    "tax":     "Tax ID: 987-654-321",
    "bank":    "Banque Misr | IBAN: EG12 0002 0000 0000 0123 4567 8901",
}

SERVICES_DETAIL = {
    "HVAC Maintenance": {
        "scope": "Preventive and corrective maintenance of all HVAC systems including chillers, AHUs, FCUs, cooling towers, and VRF systems. Monthly inspections, filter replacement, refrigerant checks, and 4-hour emergency response.",
        "standards": "ASHRAE 62.1 | EN 13779 | Egyptian Standards ES 4174",
    },
    "Electrical Systems": {
        "scope": "Maintenance of HV/LV switchgear, transformers, UPS systems, emergency generators, lighting systems, and BMS integration. Thermographic surveys, load balancing, and 24/7 emergency support.",
        "standards": "IEC 60364 | NEC 2023 | Egyptian Electrical Code",
    },
    "Plumbing Systems": {
        "scope": "Maintenance of domestic water systems, sewage systems, fire suppression, water treatment, and legionella prevention programs. Monthly water quality testing and annual pipe inspection.",
        "standards": "WHO Water Quality Guidelines | BS 8558 | Egyptian Plumbing Code",
    },
    "Fire Fighting Systems": {
        "scope": "Inspection, testing, and maintenance of fire suppression systems, sprinklers, fire alarm panels, smoke detectors, emergency lighting, and evacuation systems per NFPA standards.",
        "standards": "NFPA 25 | NFPA 72 | BS 5839 | Egyptian Civil Defense Requirements",
    },
    "General Engineering": {
        "scope": "Comprehensive engineering management including facility assessments, energy audits, preventive maintenance scheduling, vendor management, and technical consulting for all MEP systems.",
        "standards": "ISO 55001 Asset Management | ISO 50001 Energy Management",
    },
    "Procurement Services": {
        "scope": "Strategic procurement of spare parts, equipment, and supplies. Vendor qualification, purchase order management, quality control, and supply chain optimization.",
        "standards": "ISO 9001:2015 Quality Management | ISO 20400 Sustainable Procurement",
    },
    "Kitchen Equipment": {
        "scope": "Maintenance and repair of commercial kitchen equipment including cooking ranges, ovens, refrigeration units, dishwashers, ventilation hoods, and grease management systems.",
        "standards": "HACCP Guidelines | BS EN 203 | NSF International Standards",
    },
    "Laundry Systems": {
        "scope": "Maintenance of industrial laundry equipment, linen management systems, ironers, folders, and associated utility connections including steam, water, and electrical systems.",
        "standards": "EN ISO 10472 | Textile Care Alliance Standards",
    },
    "Pool Systems": {
        "scope": "Maintenance of swimming pools, spa facilities, water features, and aquatic systems. Chemical management, filtration systems, heating, and compliance with health authority requirements.",
        "standards": "WHO Pool Water Quality | PWTAG Technical Standards | Egyptian Health Authority",
    },
}

TERMS = [
    ("Payment Terms", "30% advance payment upon contract signing. 70% monthly invoicing payable within 15 days of invoice date."),
    ("Response Time", "Emergency response within 4 hours. Routine maintenance as per agreed schedule. Preventive maintenance monthly unless otherwise specified."),
    ("Warranty", "All repair work carries a 90-day warranty. Replaced parts carry manufacturer warranty transferred to client."),
    ("Exclusions", "Major capital replacements, structural modifications, and consumables not listed in scope are excluded unless separately quoted."),
    ("Termination", "Either party may terminate with 60 days written notice. Early termination penalty of 3 months service value applies."),
    ("Governing Law", "This agreement is governed by the laws of the Arab Republic of Egypt. Disputes subject to Cairo arbitration."),
    ("Force Majeure", "Neither party liable for delays caused by circumstances beyond reasonable control including natural disasters or pandemic conditions."),
    ("Confidentiality", "Both parties agree to maintain strict confidentiality of all proprietary information shared during the term of this agreement."),
]

USPS = [
    ("24/7 Emergency Response", "4-hour emergency response guarantee across all Egypt. Dedicated hotline with senior engineer on-call."),
    ("Certified Engineering Team", "ISO 9001 certified operations. Engineers with ASHRAE, CIBSE, and IEC certifications from Egypt and internationally."),
    ("Real-Time Reporting", "Monthly performance reports, energy consumption analysis, and maintenance history via our digital portal."),
    ("Genuine Parts Only", "We use only OEM-approved parts with full traceability documentation and manufacturer warranty transfer."),
]


def _make_styles():
    base = getSampleStyleSheet()["Normal"]

    def s(name, **kw):
        return ParagraphStyle(name, parent=base, **kw)

    return {
        "company_name":  s("cn", fontSize=22, textColor=WHITE, fontName="Helvetica-Bold", leading=26),
        "company_ref":   s("cr2", fontSize=13, textColor=WHITE, fontName="Helvetica-Bold",
                           alignment=TA_RIGHT, leading=20),
        "section_head":  s("sh", fontSize=13, textColor=NAVY, fontName="Helvetica-Bold", spaceAfter=4),
        "label":         s("lb", fontSize=8, textColor=MID_GRAY, fontName="Helvetica", spaceAfter=1),
        "value":         s("vl", fontSize=10, textColor=DARK_GRAY, fontName="Helvetica-Bold"),
        "body":          s("bd", fontSize=9, textColor=DARK_GRAY, fontName="Helvetica",
                           leading=14, alignment=TA_JUSTIFY),
        "small":         s("sm", fontSize=8, textColor=MID_GRAY, fontName="Helvetica"),
        "footer":        s("ft", fontSize=7, textColor=MID_GRAY, fontName="Helvetica", alignment=TA_CENTER),
        "term_title":    s("tt", fontSize=9, textColor=NAVY, fontName="Helvetica-Bold"),
        "term_body":     s("tb2", fontSize=8, textColor=DARK_GRAY, fontName="Helvetica",
                           leading=12, alignment=TA_JUSTIFY),
        "table_head":    s("th2", fontSize=9, textColor=WHITE, fontName="Helvetica-Bold",
                           alignment=TA_CENTER),
        "table_right":   s("tr2", fontSize=9, textColor=DARK_GRAY, fontName="Helvetica",
                           alignment=TA_RIGHT),
        "table_total":   s("ttt", fontSize=11, textColor=WHITE, fontName="Helvetica-Bold",
                           alignment=TA_RIGHT),
        "highlight":     s("hl", fontSize=9, textColor=NAVY, fontName="Helvetica-Bold",
                           alignment=TA_RIGHT),
        "ref_num":       s("rn", fontSize=9, textColor=AMBER, fontName="Helvetica-Bold"),
        "grand_total_v": s("gtv", fontSize=12, textColor=AMBER, fontName="Helvetica-Bold",
                           alignment=TA_RIGHT),
        "sign_label":    s("sl", fontSize=8, textColor=MID_GRAY, fontName="Helvetica"),
        "sign_value":    s("sv", fontSize=9, textColor=DARK_GRAY, fontName="Helvetica"),
        "tagline_text":  s("tlt", fontSize=8, textColor=WHITE, fontName="Helvetica-Bold",
                           alignment=TA_CENTER),
        "conf":          s("cf", fontSize=6, textColor=colors.HexColor("#9CA3AF"),
                           fontName="Helvetica", alignment=TA_CENTER),
        "amount_words":  s("aw", fontSize=8, textColor=NAVY,
                           fontName="Helvetica-BoldOblique"),
    }


def _usp_cell(title, body, S):
    return Table(
        [[Paragraph(title, S["term_title"])],
         [Paragraph(body, S["term_body"])]],
        style=[
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_NAVY),
            ("PADDING",    (0, 0), (-1, -1), 8),
            ("LINEBELOW",  (0, 0), (-1, -1), 2, AMBER),
        ],
    )


def _num_to_words(n: int) -> str:
    ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
            "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
            "Seventeen","Eighteen","Nineteen"]
    tens_w = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"]

    if n == 0:
        return "Zero"

    def below1000(num):
        if num == 0:
            return ""
        if num < 20:
            return ones[num]
        if num < 100:
            return tens_w[num // 10] + (" " + ones[num % 10] if num % 10 else "")
        return ones[num // 100] + " Hundred" + (" " + below1000(num % 100) if num % 100 else "")

    parts = []
    if n >= 1_000_000:
        parts.append(below1000(n // 1_000_000) + " Million")
        n %= 1_000_000
    if n >= 1_000:
        parts.append(below1000(n // 1_000) + " Thousand")
        n %= 1_000
    if n > 0:
        parts.append(below1000(n))
    return " ".join(parts)


def generate_quote_pdf(
    quote_id: str,
    quote_title: str,
    quote_description: str,
    items: list,
    total: float,
    status: str,
    validity_date: Optional[str],
    created_at: str,
    lead_name: str = "",
    lead_email: str = "",
    lead_phone: str = "",
    lead_company: str = "",
    prepared_by: str = "Triangle Black Engineering Team",
) -> bytes:

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=15*mm,
        bottomMargin=20*mm,
        title="Engineering Services Proposal — " + (lead_company or lead_name),
        author="Triangle Black Engineering",
        subject="Hotel Engineering Services Proposal",
        creator="Triangle Black Platform v1.3.0",
    )

    S = _make_styles()
    W = doc.width
    story = []
    ref_no = "TB-" + quote_id[:8].upper()

    # ── HEADER ────────────────────────────────────────────────────────────────
    header_data = [[
        Paragraph(COMPANY["name"], S["company_name"]),
        Paragraph(
            "<b>ENGINEERING SERVICES PROPOSAL</b><br/>"
            "<font size='9' color='#CBD5E1'>"
            "Ref: " + ref_no + "  |  "
            "Date: " + datetime.now().strftime("%d %B %Y") +
            "</font>",
            S["company_ref"]
        ),
    ]]
    header_table = Table(header_data, colWidths=[W * 0.55, W * 0.45])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("PADDING",    (0, 0), (-1, -1), 14),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW",  (0, 0), (-1, -1), 4, AMBER),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))

    story.append(Table(
        [[Paragraph(COMPANY["tagline"].upper(), S["tagline_text"])]],
        colWidths=[W],
        style=[("BACKGROUND", (0,0), (-1,-1), AMBER), ("PADDING", (0,0), (-1,-1), 5)],
    ))
    story.append(Spacer(1, 8*mm))

    # ── CLIENT + SUMMARY ──────────────────────────────────────────────────────
    client_rows = [
        [Paragraph("PREPARED FOR", S["label"])],
        [Paragraph(lead_company or lead_name or "Hotel Client", S["value"])],
        [Spacer(1, 3)],
    ]
    if lead_name and lead_name != lead_company:
        client_rows.append([Paragraph(lead_name, S["body"])])
    if lead_email:
        client_rows.append([Paragraph(lead_email, S["body"])])
    if lead_phone:
        client_rows.append([Paragraph(lead_phone, S["body"])])

    client_table = Table(client_rows, colWidths=[W * 0.45])
    client_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_NAVY),
        ("PADDING",    (0, 0), (-1, -1), 8),
        ("LINEBELOW",  (0, 0), (0,  0),  1, AMBER),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
    ]))

    valid_str = validity_date[:10] if validity_date else "30 days from issue"
    status_color = "#059669" if status == "approved" else "#F59E0B"

    summary_rows = [
        [Paragraph("PROPOSAL DETAILS", S["label"]), ""],
        [Paragraph("Reference No.", S["small"]),
         Paragraph(ref_no, S["ref_num"])],
        [Paragraph("Issue Date", S["small"]),
         Paragraph(datetime.now().strftime("%d %B %Y"), S["body"])],
        [Paragraph("Valid Until", S["small"]),
         Paragraph(valid_str, S["body"])],
        [Paragraph("Status", S["small"]),
         Paragraph(
             "<font color='" + status_color + "'><b>" + status.upper() + "</b></font>",
             S["body"]
         )],
        [Paragraph("Total Value", S["small"]),
         Paragraph("EGP {:,.2f}".format(total), S["value"])],
    ]
    summary_table = Table(summary_rows, colWidths=[W * 0.25, W * 0.25])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
        ("BACKGROUND", (0, 0), (-1,  0), NAVY),
        ("TEXTCOLOR",  (0, 0), (-1,  0), WHITE),
        ("PADDING",    (0, 0), (-1, -1), 7),
        ("LINEBELOW",  (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("SPAN",       (0, 0), (-1,  0)),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
    ]))

    top = Table(
        [[client_table, Spacer(W * 0.04, 1), summary_table]],
        colWidths=[W * 0.45, W * 0.04, W * 0.51],
    )
    top.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(top)
    story.append(Spacer(1, 8*mm))

    # ── SCOPE ─────────────────────────────────────────────────────────────────
    story.append(Paragraph("SCOPE OF SERVICES", S["section_head"]))
    story.append(HRFlowable(width=W, thickness=2, color=AMBER, spaceAfter=4))
    story.append(Paragraph(quote_title, ParagraphStyle(
        "qt", parent=S["body"], fontSize=13, textColor=NAVY,
        fontName="Helvetica-Bold", spaceAfter=4)))
    if quote_description:
        story.append(Paragraph(quote_description, S["body"]))
    story.append(Spacer(1, 6*mm))

    # ── PRICING TABLE ─────────────────────────────────────────────────────────
    story.append(Paragraph("PRICING SCHEDULE", S["section_head"]))
    story.append(HRFlowable(width=W, thickness=2, color=AMBER, spaceAfter=6))

    table_data = [[
        Paragraph("SERVICE DESCRIPTION", S["table_head"]),
        Paragraph("SCOPE AND STANDARDS", S["table_head"]),
        Paragraph("DURATION", S["table_head"]),
        Paragraph("MONTHLY\nRATE (EGP)", S["table_head"]),
        Paragraph("TOTAL\nVALUE (EGP)", S["table_head"]),
    ]]

    for i, item in enumerate(items):
        svc_name = item.get("service", "")
        detail = SERVICES_DETAIL.get(svc_name, {})
        scope = detail.get("scope", "Professional maintenance and management services.")
        std = detail.get("standards", "International engineering standards.")
        table_data.append([
            Paragraph(
                "<b>" + svc_name + "</b><br/>"
                "<font size='7' color='#6B7280'>" + scope[:110] + "...</font>",
                S["body"]
            ),
            Paragraph("<font size='7' color='#374151'>" + std + "</font>", S["body"]),
            Paragraph(str(item.get("qty", 12)) + " months", S["table_right"]),
            Paragraph("{:,.0f}".format(item.get("unit_price", 0)), S["table_right"]),
            Paragraph("{:,.0f}".format(item.get("total", 0)), S["table_right"]),
        ])

    subtotal = total
    vat_amount = round(subtotal * 0.14, 2)
    grand_total = round(subtotal + vat_amount, 2)
    row_count = len(items)

    table_data.append([
        "", "", "",
        Paragraph("Sub-Total (EGP)", S["highlight"]),
        Paragraph("{:,.2f}".format(subtotal), S["highlight"]),
    ])
    table_data.append([
        "", "", "",
        Paragraph("VAT 14% (EGP)", S["highlight"]),
        Paragraph("{:,.2f}".format(vat_amount), S["highlight"]),
    ])
    table_data.append([
        "", "", "",
        Paragraph("GRAND TOTAL (EGP)", ParagraphStyle(
            "gt2", parent=S["table_total"], textColor=WHITE, fontSize=10)),
        Paragraph("{:,.2f}".format(grand_total), S["grand_total_v"]),
    ])

    col_w = [W*0.28, W*0.28, W*0.10, W*0.17, W*0.17]
    items_table = Table(table_data, colWidths=col_w, repeatRows=1)
    items_table.setStyle(TableStyle([
        ("BACKGROUND",     (0, 0),            (-1,  0),             NAVY),
        ("TEXTCOLOR",      (0, 0),            (-1,  0),             WHITE),
        ("ALIGN",          (0, 0),            (-1,  0),             "CENTER"),
        ("VALIGN",         (0, 0),            (-1,  0),             "MIDDLE"),
        ("FONTNAME",       (0, 0),            (-1,  0),             "Helvetica-Bold"),
        ("FONTSIZE",       (0, 0),            (-1,  0),             8),
        ("VALIGN",         (0, 1),            (-1, row_count),      "TOP"),
        ("PADDING",        (0, 0),            (-1, -1),             7),
        ("LINEBELOW",      (0, 0),            (-1, -1),             0.5,
         colors.HexColor("#E5E7EB")),
        ("BACKGROUND",     (0, row_count+1),  (-1, row_count+2),    LIGHT_NAVY),
        ("BACKGROUND",     (0, row_count+3),  (-1, row_count+3),    NAVY),
        ("LINEABOVE",      (0, row_count+3),  (-1, row_count+3),    2, AMBER),
        ("PADDING",        (0, row_count+3),  (-1, row_count+3),    10),
        ("VALIGN",         (0, row_count+1),  (-1, -1),             "MIDDLE"),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 4))

    piastres = int((grand_total % 1) * 100)
    story.append(Paragraph(
        "<b>Amount in Words:</b> Egyptian Pounds "
        + _num_to_words(int(grand_total))
        + " and {:02d}/100 Piastres Only".format(piastres),
        S["amount_words"]
    ))
    story.append(Spacer(1, 8*mm))

    # ── WHY TRIANGLE BLACK ────────────────────────────────────────────────────
    story.append(KeepTogether([
        Paragraph("WHY TRIANGLE BLACK ENGINEERING", S["section_head"]),
        HRFlowable(width=W, thickness=2, color=AMBER, spaceAfter=6),
        Table(
            [[_usp_cell(title, body, S) for title, body in USPS]],
            colWidths=[W/4]*4,
            style=[("VALIGN",(0,0),(-1,-1),"TOP"), ("PADDING",(0,0),(-1,-1),4)],
        ),
    ]))
    story.append(Spacer(1, 8*mm))

    # ── TERMS ─────────────────────────────────────────────────────────────────
    story.append(KeepTogether([
        Paragraph("TERMS AND CONDITIONS", S["section_head"]),
        HRFlowable(width=W, thickness=2, color=AMBER, spaceAfter=6),
    ]))

    terms_rows = []
    for i in range(0, len(TERMS), 2):
        row = []
        for j in range(2):
            if i + j < len(TERMS):
                t_title, t_body = TERMS[i + j]
                cell = Table(
                    [[Paragraph(str(i+j+1) + ". " + t_title, S["term_title"])],
                     [Paragraph(t_body, S["term_body"])]],
                    colWidths=[(W - 6*mm) / 2],
                    style=[("BACKGROUND",(0,0),(-1,-1),LIGHT_GRAY),
                           ("PADDING",(0,0),(-1,-1),7),
                           ("LINEBELOW",(0,0),(-1,-1),0.5,
                            colors.HexColor("#E5E7EB"))],
                )
                row.append(cell)
            else:
                row.append("")
        terms_rows.append(row)

    terms_table = Table(
        terms_rows,
        colWidths=[(W-4*mm)/2, (W-4*mm)/2],
        style=[("VALIGN",(0,0),(-1,-1),"TOP"), ("PADDING",(0,0),(-1,-1),2)],
    )
    story.append(terms_table)
    story.append(Spacer(1, 8*mm))

    # ── SIGNATURES ────────────────────────────────────────────────────────────
    client_label = (lead_company or lead_name or "CLIENT").upper()
    sig_data = [[
        Table([
            [Paragraph("FOR TRIANGLE BLACK ENGINEERING", S["sign_label"])],
            [Spacer(1, 18*mm)],
            [HRFlowable(width=55*mm, thickness=1, color=NAVY)],
            [Paragraph("Authorized Signatory", S["sign_label"])],
            [Paragraph(prepared_by, S["sign_value"])],
            [Paragraph("Date: " + datetime.now().strftime("%d %B %Y"), S["sign_label"])],
            [Paragraph("Company Stamp", S["sign_label"])],
        ], colWidths=[W*0.44],
        style=[("BACKGROUND",(0,0),(-1,-1),LIGHT_NAVY),
               ("PADDING",(0,0),(-1,-1),8)]),

        Spacer(W*0.04, 1),

        Table([
            [Paragraph("FOR " + client_label, S["sign_label"])],
            [Spacer(1, 18*mm)],
            [HRFlowable(width=55*mm, thickness=1, color=NAVY)],
            [Paragraph("Authorized Signatory", S["sign_label"])],
            [Paragraph("Name: ________________________", S["sign_value"])],
            [Paragraph("Date: ________________________", S["sign_label"])],
            [Paragraph("Company Stamp", S["sign_label"])],
        ], colWidths=[W*0.44],
        style=[("BACKGROUND",(0,0),(-1,-1),LIGHT_NAVY),
               ("PADDING",(0,0),(-1,-1),8)]),
    ]]
    sig_table = Table(
        sig_data,
        colWidths=[W*0.44, W*0.04, W*0.44],
        style=[("VALIGN",(0,0),(-1,-1),"TOP")],
    )
    story.append(KeepTogether([
        Paragraph("ACCEPTANCE AND AUTHORIZATION", S["section_head"]),
        HRFlowable(width=W, thickness=2, color=AMBER, spaceAfter=8),
        sig_table,
    ]))
    story.append(Spacer(1, 6*mm))

    # ── FOOTER ────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width=W, thickness=1, color=NAVY, spaceAfter=4))
    footer_cells = [
        Paragraph("Tel: " + COMPANY["phone"], S["footer"]),
        Paragraph("Email: " + COMPANY["email"], S["footer"]),
        Paragraph("Web: " + COMPANY["website"], S["footer"]),
        Paragraph("Address: " + COMPANY["address"], S["footer"]),
    ]
    story.append(Table(
        [footer_cells],
        colWidths=[W/4]*4,
        style=[("BACKGROUND",(0,0),(-1,-1),LIGHT_NAVY),
               ("PADDING",(0,0),(-1,-1),5)],
    ))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        COMPANY["cr"] + "  |  " + COMPANY["tax"] + "  |  " + COMPANY["bank"],
        S["footer"],
    ))
    story.append(Paragraph(
        "This proposal is confidential and intended solely for "
        + (lead_company or lead_name or "the addressee")
        + ". Document generated by Triangle Black Engineering Platform. Ref: "
        + ref_no,
        S["conf"],
    ))

    doc.build(story)
    return buf.getvalue()
