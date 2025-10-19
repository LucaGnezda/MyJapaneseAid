let cacheAppPrefix = 'MJA|';
let cacheKey = 'MJA|251019.10';

importScripts("./framework/scripts/logging/LoggingEnums.js");
importScripts("./framework/scripts/logging/Log.js");

Log.setLoggingLevel(LogLevel.Infomation);

self.addEventListener('install', (event) => {
    /** @ts-ignore */
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_URLS') {
        /** @ts-ignore */
        event.waitUntil(
            caches.open(cacheKey)
                .then( (cache) => {
                    return cache.addAll(event.data.payload);
                })
        );
    }
});

self.addEventListener("activate", (event) => {
    /** @ts-ignore */
    event.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (key.startsWith(cacheAppPrefix) && key != cacheKey) {
                        return caches.delete(key);
                    }
                    return undefined;
                }),
            ),
        ),
    );
});

self.addEventListener("fetch", (event) => {
    /** @ts-ignore */
    event.respondWith(
        (async () => {
            
            let cache = await caches.open(cacheKey);

            try {
                /** @ts-ignore */
                let cachedResponse = await cache.match(event.request);
        
                if (cachedResponse) {
                    /** @ts-ignore */
                    //console.log("%cWorkr%c | [OFFLINECACHEWORKER] Cache response url " + event.request.url, "color:#808080;", "");
                    Log.info("Cache response url " + event.request.url, "[OFFLINECACHEWORKER]");
                    return cachedResponse;
                }

                /** @ts-ignore */
                let fetchResponse = await fetch(event.request);
        
                if (fetchResponse) {
                    /** @ts-ignore */
                    //console.log("%cWorkr%c | [OFFLINECACHEWORKER] Fetch response url " + event.request.url, "color:#808080;", "");
                    Log.info("Fetch response url " + event.request.url, "[OFFLINECACHEWORKER]");
                    /** @ts-ignore */
                    await cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                }
            
            } catch (error) {
                /** @ts-ignore */
                //console.log("%cWorkr%c | [OFFLINECACHEWORKER] Fetch response url " + event.request.url, "color:#ec9e30;", "");
                Log.error("Fetch failed for url " + event.request.url, "[OFFLINECACHEWORKER]");
                let cachedResponse = await cache.match("index.html");
                return cachedResponse;
            }
        })()
    );
});