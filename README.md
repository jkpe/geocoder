# geocoder

Tiny Cloudflare Worker that geocodes addresses via Nominatim and caches results in KV.

## Quick start

```bash
npm install
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy
```

## API

`GET /geocode?q=<address>`

Example:

```bash
curl "http://127.0.0.1:8787/geocode?q=1600+Pennsylvania+Ave+NW"
```
