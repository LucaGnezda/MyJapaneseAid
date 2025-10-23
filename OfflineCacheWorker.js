let cacheAppPrefix = 'MJA|';
let cacheKey = 'MJA|251023.1';

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
                    Log.debug("Dynamically adding file keys to cache: " + cacheKey, "OFFLINECACHEWORKER");
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
                        Log.info("Removing old cache: " + key, "OFFLINECACHEWORKER");
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
                    Log.debug("Cache response url " + event.request.url, "OFFLINECACHEWORKER");
                    return cachedResponse;
                }

                /** @ts-ignore */
                let fetchResponse = await fetch(event.request);
        
                if (fetchResponse) {
                    /** @ts-ignore */
                    Log.debug("Fetch response url " + event.request.url, "OFFLINECACHEWORKER");
                    /** @ts-ignore */
                    await cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                }
            
            } catch (error) {
                /** @ts-ignore */
                Log.error("Fetch failed for url " + event.request.url, "OFFLINECACHEWORKER");
                let cachedResponse = await cache.match("index.html");
                return cachedResponse;
            }
        })()
    );
});