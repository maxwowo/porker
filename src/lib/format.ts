const decimalFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatNumber(value: number): string {
  return decimalFormat.format(value);
}
