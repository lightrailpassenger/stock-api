const getUrlFromTickerSymbol = (ts: string) => {
  return `https://finance.yahoo.com/quote/${encodeURIComponent(ts)}?p=${
    encodeURIComponent(ts)
  }&tsrc=fin-srch`;
};

const FIREFOX_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0" as const;

const fetchHtmlFromYahooFinance = async (
  ts: string,
): Promise<string | null> => {
  const url = getUrlFromTickerSymbol(ts);
  const result = await globalThis.fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": FIREFOX_USER_AGENT,
    },
  });

  return result.ok ? await result.text() : null;
};

type ParsedInfo = {
  price: string;
  absoluteChange: string;
  relativeChange: string;
};

const parseInfo = (html: string, ts: string): ParsedInfo => {
  const priceRegex = new RegExp(
    `<fin-streamer[^>]+data-symbol="${ts}"[^>]+data-test="qsp-price"[^>]+>([0-9\\.\\,]+)</fin-streamer>`,
    "g",
  );
  const absoluteChangeRegex = new RegExp(
    `<fin-streamer[^>]+data-symbol="${ts}" data-test="qsp-price-change"[^>]+><span[^>]+>([0-9\\-\\.\\,\\+]+)</span></fin-streamer>`,
    "g",
  );
  const relativeChangeRegex = new RegExp(
    `<fin-streamer[^>]+data-symbol="${ts}" data-field="regularMarketChangePercent"[^>]+><span[^>]+>\\(([0-9\\+\\-\\,\\.%]+)\\)</span></fin-streamer`,
    "g",
  );

  const [[, price = ""] = []] = html.matchAll(priceRegex);
  const [[, absoluteChange = ""] = []] = html.matchAll(absoluteChangeRegex);
  const [[, relativeChange = ""] = []] = html.matchAll(relativeChangeRegex);

  return { price, absoluteChange, relativeChange };
};

export { fetchHtmlFromYahooFinance, parseInfo };
