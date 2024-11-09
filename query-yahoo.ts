const getUrlFromTickerSymbol = (ts: string) => {
  return `https://query1.finance.yahoo.com/v8/finance/chart/${
    encodeURIComponent(ts)
  }?interval=1m&includePrePost=true&events=div%7Csplit%7Cearn&&lang=en-US&region=US`;
};

const fetchHtmlFromYahooFinance = async (
  ts: string,
): Promise<object> => {
  const url = getUrlFromTickerSymbol(ts);
  const res = await fetch(url);

  return await res.json();
};

type ParsedInfo = {
  price: string | null;
  currency: string | null;
  absoluteChange: string | null;
  relativeChange: string | null;
};

// deno-lint-ignore no-explicit-any
const parseInfo = (obj: any): ParsedInfo => {
  const { meta } = obj.chart.result[0];
  const {
    currency,
    regularMarketPrice,
    previousClose,
  } = meta;
  const absoluteChange = Number(
    Number(regularMarketPrice - previousClose).toFixed(5),
  );
  const relativeChange = `${
    Number(100 * absoluteChange / previousClose).toFixed(2)
  }%`;

  return {
    price: regularMarketPrice,
    currency,
    absoluteChange,
    relativeChange,
  };
};

export { fetchHtmlFromYahooFinance, parseInfo };
