const tracks: Record<string, string> = {
  "until-i-found-you": "until-i-found-you.mp3",
  blue: "blue.mp3",
  "i-think-they-call-this-love": "i-think-they-call-this-love.mp3",
  "somewhere-only-we-know": "somewhere-only-we-know.mp3",
  "treat-you-better": "treat-you-better.mp3",
  "the-night-we-met": "the-night-we-met.mp3",
  "ive-got-my-eye-on-you": "ive-got-my-eye-on-you.mp3",
  perfect: "perfect.mp3",
  "i-wanna-be-yours": "i-wanna-be-yours.mp3",
  "i-thought-i-saw-your-face-today": "i-thought-i-saw-your-face-today.mp3",
};

export async function GET(
  request: Request,
  context: { params: Promise<{ track: string }> },
) {
  const { track } = await context.params;
  const filename = tracks[track];
  if (!filename) return new Response("Soundtrack not found", { status: 404 });

  const sourceUrl = new URL(`/music/${filename}`, request.url);
  const range = request.headers.get("range");
  const source = await fetch(sourceUrl, {
    headers: range ? { Range: range } : undefined,
  });
  if (!source.ok || !source.body)
    return new Response("Soundtrack unavailable", { status: 502 });

  const headers = new Headers();
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=86400");
  for (const name of ["content-length", "content-range", "etag"]) {
    const value = source.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(source.body, { status: source.status, headers });
}
