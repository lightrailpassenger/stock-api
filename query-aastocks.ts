import * as regexp from "regexp";

const getUrlFromTickerSymbol = (ts: string): string => {
  return `http://www.aastocks.com/tc/stocks/analysis/dividend.aspx?symbol=${
    encodeURIComponent(ts)
  }`;
};

const getHKTickerSymbol = (ts: string): string | null => {
  const numTs = parseInt(ts, 10);

  if (!numTs) {
    return null;
  }

  return `${numTs}`.padStart(5, "0");
};

const fetchDividendHtmlFromAASTOCKS = async (ts: string): string => {
  const numTs = getHKTickerSymbol(ts);

  if (!numTs) {
    throw Object.assign(new Error("Cannot parse ticker symbol"), {
      status: 404,
    });
  }

  const url = getUrlFromTickerSymbol(numTs);
  const result = await globalThis.fetch(
    url,
    {
      method: "GET",
      headers: {
        "Cookie": "__utmt_a3=1; __utmt_a2=1; AALTP=1",
      },
    },
  );

  if (!result.ok) {
    throw Object.assign(new Error("Cannot fetch from AASTOCKS"), {
      status: result.status,
    });
  }

  return await result.text();
};

const currencySymbolToFirstCharacterRegex = {
  "HKD": "港",
  "USD": "美",
  "EUR": "歐",
  "JPY": "日",
  "CNH": "人",
} as const;
const dividendRegex = new RegExp(
  `\\s*<td class="[^"]+">(?<year>20[0-9][0-9])/(?<date>[0-9]{2}/[0-9]{2})[^${
    regexp.escape("普")
  }]*${regexp.escape("普通股息")}</a>[\x00-\x7f]*${
    regexp.escape("：")
  }?(?<currency>[${
    Object.values(currencySymbolToFirstCharacterRegex).map((
      c,
    ) => (regexp.escape(c)))
  }])[^0-9]*(?<amount>[0-9.]+)`,
  "g",
);

type DividendEntry = {
  year: string;
  date: string;
  currency: string;
  amount: number;
};

const parseDividend = (html: string): DividendEntry[] => {
  const matched = html.split("<tr>").flatMap((
    item,
  ) => [...item.matchAll(dividendRegex)]);

  return matched.filter(({ groups }) => groups)
    .map(({ groups }) => ({
      year: groups.year,
      date: groups.date,
      amount: Number(groups.amount),
      currency: Object.entries(currencySymbolToFirstCharacterRegex).find((
        [, c],
      ) => (c === groups.currency))[0] ?? "Unknown",
    }));
};

export { fetchDividendHtmlFromAASTOCKS, parseDividend };
