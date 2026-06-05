/** Express 5 param coercion — safely extract string from string | string[] */
export const p = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) || '';
