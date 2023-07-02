import { Application, Router } from "oak";

import { fetchHtmlFromYahooFinance, parseInfo } from "./query-yahoo.ts";

const router = new Router();

router.get("/health-check", (context) => {
  context.response.body = { res: "ok" };
  context.response.statusCode = 200;
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

    const tsStr = `${ts}`;
    const html = await fetchHtmlFromYahooFinance(tsStr);
    const info = parseInfo(html, tsStr);

    if (!(info.price || info.relativeChange || info.absoluteChange)) {
      context.response.body = { err: "NOT_FOUND" };
      context.response.status = 404;

      return;
    }

    context.response.body = info;
    context.response.status = 200;
  } catch (err) {
    console.error(err);

    context.response.body = { err: "INTERNAL_SERVER_ERROR" };
    context.response.status = 500;
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = Deno.env.get("PORT") ?? 3000;
console.log(`Listening at port: ${PORT}`);

await app.listen({ port: PORT });
