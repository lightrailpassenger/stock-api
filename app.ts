import { Application, Router } from "oak";

import { fetchHtmlFromYahooFinance, parseInfo } from "./query-yahoo.ts";
import {
  fetchDividendHtmlFromAASTOCKS,
  parseDividend,
} from "./query-aastocks.ts";
import { rectifyTickerSymbol } from "./ticker-util.ts";

const router = new Router();

router.get("/health-check", (context) => {
  context.response.body = { res: "ok" };
  context.response.status = 200;
});

router.get("/price-info", async (context) => {
  try {
    const query = context.request.url.searchParams;
    const urlSearchParams = new URLSearchParams(query);
    const ts = urlSearchParams.get("ts");

    if (!ts) {
      context.response.body = { err: "BAD_REQUEST" };
      context.response.status = 400;

      return;
    }

    const actualTs = rectifyTickerSymbol(ts);

    if (actualTs !== ts) {
      console.info(
        `[Info] Auto adjusting ticker symbol from ${ts} to ${actualTs}`,
      );
    }

    const html = await fetchHtmlFromYahooFinance(actualTs);
    const info = parseInfo(html, actualTs);

    if (!(info.price || info.relativeChange || info.absoluteChange)) {
      context.response.body = { err: "NOT_FOUND" };
      context.response.status = 404;

      return;
    }

    context.response.body = { ts: actualTs, ...info };
    context.response.status = 200;
  } catch (err) {
    console.error(err);

    context.response.body = { err: "INTERNAL_SERVER_ERROR" };
    context.response.status = 500;
  }
});

router.get("/dividend", async (context) => {
  try {
    const query = context.request.url.searchParams;
    const urlSearchParams = new URLSearchParams(query);
    const ts = urlSearchParams.get("ts");

    if (!ts) {
      context.response.body = { err: "BAD_REQUEST" };
      context.response.status = 400;

      return;
    }

    const html = await fetchDividendHtmlFromAASTOCKS(ts);
    const entries = parseDividend(html);

    context.response.body = { div: entries };
    context.response.status = 200;
  } catch (err) {
    const { status } = err;

    if (status === 404) {
      context.response.body = { err: "NOT_FOUND" };
      context.response.status = 404;

      return;
    }

    console.error(err);

    context.response.body = { err: "INTERNAL_SERVER_ERROR" };
    context.response.status = 500;
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = Number(Deno.env.get("PORT")) || 3000;
console.log(`Listening at port: ${PORT}`);

await app.listen({ port: PORT });
