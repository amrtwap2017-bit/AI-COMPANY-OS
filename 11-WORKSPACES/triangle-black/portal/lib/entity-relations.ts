
export function idText(value: any) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

export function textKey(value: any) {
  if (value === undefined || value === null) return "";
  return String(value).trim().toLowerCase();
}

export function firstText(...values: any[]) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

export function resolveById<T extends Record<string, any>>(items: T[], id?: string | null) {
  if (!id) return null;
  const needle = idText(id);
  return items.find((item) => idText(item?.id) === needle) || null;
}

export function customerKeyOf(record: any) {
  return firstText(
    record?.customer_name,
    record?.client_name,
    record?.company_name,
    record?.name,
    record?.email
  );
}

export function vendorKeyOf(record: any) {
  return firstText(
    record?.company_name,
    record?.name,
    record?.vendor_name,
    record?.email
  );
}

export function sameText(a: any, b: any) {
  return textKey(a) !== "" && textKey(a) === textKey(b);
}

export function filterByField<T extends Record<string, any>>(items: T[], field: string, value: any) {
  const needle = idText(value);
  if (!needle) return [];
  return items.filter((item) => idText(item?.[field]) === needle);
}

export function filterByAnyField<T extends Record<string, any>>(items: T[], fields: string[], value: any) {
  const needle = idText(value);
  if (!needle) return [];
  return items.filter((item) => fields.some((field) => idText(item?.[field]) === needle));
}

export function uniqueNonEmpty(values: any[]) {
  return [...new Set(values.map(idText).filter(Boolean))];
}
