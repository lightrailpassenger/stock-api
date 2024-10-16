import * as regexp from "regexp";

import curl from "./curl.ts";

const getUrlFromTickerSymbol = (ts: string) => {
  return `https://finance.yahoo.com/quote/${encodeURIComponent(ts)}/`;
};

const FIREFOX_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0" as const;

const fetchHtmlFromYahooFinance = async (
  ts: string,
): Promise<string> => {
  const url = getUrlFromTickerSymbol(ts);
  const result = await curl(url, {
    method: "GET",
    headers: {
      "User-Agent": FIREFOX_USER_AGENT,
    },
  });

  return result;
};

type ParsedInfo = {
  price: string | null;
  currency: string | null;
  absoluteChange: string | null;
  relativeChange: string | null;
};

const parseInfo = (html: string, ts: string): ParsedInfo => {
  const priceRegex = new RegExp(
    `<fin-streamer[^>]+data-symbol="${
      regexp.escape(ts)
    }"[^>]+data-testid="qsp-price"[^>]+><span>([0-9\\.\\,]+)</span></fin-streamer>`,
    "g",
  );
  const currencyRegex =
    /<span aria-hidden="true" data-svelte-h="svelte-jnvkjn">•<\/span> <span>([^<]{3})</g;
  const absoluteChangeRegex = new RegExp(
    `<fin-streamer[^>]+data-symbol="${
      regexp.escape(ts)
    }" data-testid="qsp-price-change"[^>]+><span[^>]+>([0-9\\-\\.\\,\\+]+)</span></fin-streamer>`,
    "g",
  );
  const relativeChangeRegex = new RegExp(
    `<fin-streamer[^>]+data-symbol="${
      regexp.escape(ts)
    }" data-field="regularMarketChangePercent"[^>]+><span[^>]+>\\(([0-9\\+\\-\\,\\.%]+)\\)</span></fin-streamer`,
    "g",
  );

  const [[, price = null] = []] = html.matchAll(priceRegex);
  const [[, currency = null] = []] = html.matchAll(currencyRegex);
  const [[, absoluteChange = null] = []] = html.matchAll(absoluteChangeRegex);
  const [[, relativeChange = null] = []] = html.matchAll(relativeChangeRegex);

  return { price, currency, absoluteChange, relativeChange };
};

export { fetchHtmlFromYahooFinance, parseInfo };
