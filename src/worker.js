export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/geocode') {
      return handleGeocode(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleGeocode(request, env) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();

  if (!q) {
    return Response.json({ error: 'Missing query parameter: q' }, { status: 400 });
  }

  const cacheKey = `geocode:${q.toLowerCase()}`;

  const cached = await env.CACHE.get(cacheKey, 'json');
  if (cached) {
    return Response.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`;
  const nominatimRes = await fetch(nominatimUrl, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'Geocoder/1.0 (geocoder.top)',
    },
  });

  if (!nominatimRes.ok) {
    return Response.json({ error: 'Geocoding service unavailable' }, { status: 502 });
  }

  const data = await nominatimRes.json();

  if (!data.length) {
    return Response.json(
      { error: 'No results found. Try a more specific address.' },
      { status: 404 }
    );
  }

  const place = data[0];
  const result = {
    lat: parseFloat(place.lat).toFixed(6),
    lng: parseFloat(place.lon).toFixed(6),
    display_name: place.display_name,
  };

  // Cache for 1000 days
  await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 86400000 });

  return Response.json(result, { headers: { 'X-Cache': 'MISS' } });
}
