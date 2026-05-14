const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const UNIVERSITIES = env.UNIVERSITIES;

    if (path === "/") {
      return jsonResponse({
        status: true,
        message: "University List API - Cloudflare Workers",
        endpoints: {
          all: "/api/v1/universities",
          search: "/api/v1/universities/search?q=...",
          by_id: "/api/v1/universities/{id}",
        },
      });
    }

    if (path === "/api/v1/universities") {
      const q = url.searchParams.get("q");
      if (q) {
        const keyword = q.toLowerCase().trim();
        const results = UNIVERSITIES.filter(
          (u) =>
            (u.label || "").toLowerCase().includes(keyword) ||
            (u.code || "").toLowerCase().includes(keyword) ||
            (u.eng || "").toLowerCase().includes(keyword) ||
            (u.shortName || "").toLowerCase().includes(keyword) ||
            (u.location || "").toLowerCase().includes(keyword)
        );
        return jsonResponse({
          status: true,
          message: "Success",
          count: results.length,
          data: results,
        });
      }
      return jsonResponse({
        status: true,
        message: "Success",
        count: UNIVERSITIES.length,
        data: UNIVERSITIES,
      });
    }

    const idMatch = path.match(/^\/api\/v1\/universities\/(\d+)$/);
    if (idMatch) {
      const item = UNIVERSITIES.find((u) => u.value === idMatch[1]);
      if (item) {
        return jsonResponse({ status: true, message: "Success", data: item });
      }
      return jsonResponse({ status: false, message: "Not found" }, 404);
    }

    return jsonResponse({ status: false, message: "Not found" }, 404);
  },
};
