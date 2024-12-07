import { assertEquals } from "@std/assert";

import { rectifyTickerSymbol } from "../ticker-util.ts";

Deno.test("rectifyTickerSymbol - Can auto-fix 3-digit ticker symbol", () => {
  const ts = "293";
  const actualTs = rectifyTickerSymbol(ts);

  assertEquals(actualTs, "0293.HK");
});

Deno.test("rectifyTickerSymbol - Can auto-fix 4-digit ticker symbol", () => {
  const ts = "0293";
  const actualTs = rectifyTickerSymbol(ts);

  assertEquals(actualTs, "0293.HK");
});

Deno.test("rectifyTickerSymbol - Can auto-fix 4-digit ticker symbol with .HK", () => {
  const ts = "293.HK";
  const actualTs = rectifyTickerSymbol(ts);

  assertEquals(actualTs, "0293.HK");
});

Deno.test("rectifyTickerSymbol - Retain correct ticker symbol", () => {
  const ts = "0293.HK";
  const actualTs = rectifyTickerSymbol(ts);

  assertEquals(actualTs, "0293.HK");
});

Deno.test("rectifyTickerSymbol - Retain alphabets", () => {
  const ts = "BRK-B";
  const actualTs = rectifyTickerSymbol(ts);

  assertEquals(actualTs, "BRK-B");
});

Deno.test("rectifyTickerSymbol - Retain mixed", () => {
  const ts = "^N225";
  const actualTs = rectifyTickerSymbol(ts);

  assertEquals(actualTs, "^N225");
});
