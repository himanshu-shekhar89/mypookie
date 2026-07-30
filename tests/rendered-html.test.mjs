import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the mypookie application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>mypookie\. — A gift they experience<\/title>/i);
  assert.match(html, /Build a beautiful interactive gift/);
  assert.match(html, /class="contribution-loading"/);
  assert.doesNotMatch(html, /Your site is taking shape|Starter Project/);
});

test("keeps the personalized experience and privacy controls in source", async () => {
  const [page, preview, tiny, secret, migration] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/BuilderLivePreview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/TinyBlockPreview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../backend/src/main/java/com/mypookie/api/service/GiftSecretService.java", import.meta.url), "utf8"),
    readFile(new URL("../backend/src/main/resources/db/migration/V9__sender_song_and_encrypted_gift_secrets.sql", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Repeat this block/);
  assert.match(page, /Your name/);
  assert.match(preview, /Flower burst/);
  assert.match(preview, /scrapbook-album/);
  assert.match(tiny, /bond-analysis/);
  assert.match(tiny, /If We Were a Song|mode-\$\{id\}/);
  assert.match(secret, /AES\/GCM\/NoPadding/);
  assert.match(secret, /__MYPOOKIE_SECURE__/);
  assert.match(migration, /CREATE TABLE gift_secret/);
  assert.match(migration, /If We Were a Song/);
});
