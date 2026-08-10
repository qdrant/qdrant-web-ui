// Shared building blocks for the MSW mock handlers.
// See request-handlers.js for how scenarios are assembled.
import { http, HttpResponse } from 'msw';

export const BASE_URL = 'http://localhost:6333';

// Qdrant response envelope.
export const ok = (result) => HttpResponse.json({ result, status: 'ok', time: 0.00002 });
export const acknowledged = () => ok({ operation_id: 0, status: 'acknowledged' });

// Safety net — keep it LAST in every scenario. Any request to the Qdrant origin
// that no handler matched is answered locally with a 501 instead of being
// forwarded, so mock mode can never read or mutate a real backend on the same
// URL (including arbitrary Console commands or endpoints not yet mocked).
export const catchAll = http.all(`${BASE_URL}/*`, ({ request }) => {
  const { pathname } = new URL(request.url);
  console.warn(`[msw] Blocked un-mocked request in mock mode: ${request.method} ${pathname}`);
  return HttpResponse.json(
    {
      status: {
        error: `Not mocked: ${request.method} ${pathname} is not handled in MSW mock mode, so it was not sent to a real backend.`,
      },
      time: 0,
    },
    { status: 501 }
  );
});
