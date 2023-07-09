const rectifyTickerSymbol = (ts: string): string => {
  const tsStr = `${ts}`.toUpperCase();
  const tsNum = tsStr.endsWith(".HK")
    ? Number(tsStr.substring(0, tsStr.length - 3))
    : Number(tsStr);

  if (!Number.isNaN(tsNum)) {
    return `${`${tsNum}`.padStart(4, "0")}.HK`;
  }

  return ts;
};

export { rectifyTickerSymbol };
