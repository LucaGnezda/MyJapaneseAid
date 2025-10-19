let cacheKey = 'MJA|250820.1';


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
                    console.log("cachedResponse: ", event.request.url);
                    return cachedResponse;
                }

                /** @ts-ignore */
                let fetchResponse = await fetch(event.request);
        
                if (fetchResponse) {
                    /** @ts-ignore */
                    console.log("fetchResponse: ", event.request.url);
                    /** @ts-ignore */
                    await cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                }
            
            } catch (error) {
                
                console.log("Fetch failed: ", error);
                let cachedResponse = await cache.match("index.html");
                return cachedResponse;
            }
        })()
    );
});