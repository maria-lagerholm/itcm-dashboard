// app/pdp-preview/[gid]/route.js
export const runtime = "nodejs";
import * as cheerio from "cheerio";

function absolutize(u, base) { try { return u ? new URL(u, base).toString() : null; } catch { return null; } }
function pick($img) { return $img.attr("src-zoom") || $img.attr("src-preview") || $img.attr("data-src") || $img.attr("src") || null; }

export async function GET(_req, { params }) {
  const gid = params?.gid;
  const pageUrl = `https://www.ashild.se/produkt/gidn/${encodeURIComponent(gid || "")}`;
  const resp = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    redirect: "follow",
    cache: "no-store",
  });

  const html = resp.ok ? await resp.text() : "";
  const $ = cheerio.load(html);
  const baseHref = $("base[href]").attr("href") || pageUrl;

  const img =
    pick($(".slick-main-image-container .slick-current img.slick-main-image").first()) ||
    pick($(".slick-main-image-container img.slick-main-image").first()) ||
    $('meta[property="og:image"]').attr("content") ||
    pick($("img[src-zoom],img[src-preview],img").first());

  const imageUrl = absolutize(img, baseHref);

  return new Response(JSON.stringify({ imageUrl: imageUrl || null }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
