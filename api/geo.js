// api/geo.js — tells Pal which country/state a visitor is in, so it can say hello in their language.
// Reads Vercel's IP geolocation headers and returns only two short codes (e.g. {"country":"IN","region":"KA"}).
// Nothing is stored or logged. Only called when someone interacts with Pal.

export function GET(request) {
  const country = request.headers.get("x-vercel-ip-country") || "";
  const region = request.headers.get("x-vercel-ip-country-region") || "";
  return new Response(JSON.stringify({ country, region }), {
    headers: { "content-type": "application/json", "cache-control": "private, no-store" },
  });
}
