const CACHE = 'english-reading-studio-v3';
const ASSETS = [
  './manifest.webmanifest'
];

function improveUi(html) {
  return html
    .replace(
      'プロンプトだけ、または現在の英文付きでコピーできます。選択モードに合わせて内容が変わります。',
      '使い方：①英文を貼る → ②モードを選ぶ → ③「この英文をAI用にコピー」 → ④ChatGPTへ貼る → ⑤返ってきた整形済み英文をこのアプリへ戻します。読書画面では日本語や発音記号は常時表示せず、英単語・表現をタップしたときだけ表示します。'
    )
    .replaceAll('プロンプトだけコピー', '整形ルールだけコピー')
    .replaceAll('現在の英文＋プロンプト', 'この英文をAI用にコピー')
    .replace(
      '<div class="small">現在のモード</div>',
      '<div class="small"><strong>AI整形の手順</strong><br>① 読みたい英文を入力<br>② 下のモードを選択<br>③ 「この英文をAI用にコピー」<br>④ ChatGPTへ貼って送信<br>⑤ 返ってきた整形済み英文をコピーして、このアプリの英文欄へ戻す<br><br>読書中は意味・発音記号を常時表示しません。必要な単語や表現をタップしたときだけ、その上に表示されます。</div><div class="small">注釈モード</div>'
    );
}

async function transformedIndex(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    const html = improveUi(await response.text());
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    const transformed = new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
    const cache = await caches.open(CACHE);
    await cache.put('./index.html', transformed.clone());
    return transformed;
  } catch (error) {
    const cached = await caches.match('./index.html');
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isIndex = event.request.mode === 'navigate' ||
    url.pathname.endsWith('/english-reading/') ||
    url.pathname.endsWith('/english-reading/index.html');

  if (isIndex) {
    event.respondWith(transformedIndex(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
    )
  );
});
