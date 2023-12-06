# stock-api

An API that provides stock, bond and ETF information.

## To run

```bash
PORT=3000 deno run --allow-env --allow-net app.ts
```

## To query

```bash
curl localhost:3000/price-info?ts=0001.HK
```
