/**
 * Persistent storage processing object, 
 * @class
 * @public
 */
class OfflineCaching {

    /**
     * Member attributes
     */



    /**
     * Constructor
     */



    /**
     * Getters/Setters
     */



    /**
     * Private Methods
     */



    /**
     * Public Methods
     */ 
    /** 
     * @param {String} serviceWorkerFilePath
     */
    static async registerServiceWorker(serviceWorkerFilePath) {
        
        if (window.location.protocol != "https:") {
            Log.info("Service worker registration bypassed for non-https deployed scenarios", "OFFLINECACHESERVICE");
            return;
        }

        if ("serviceWorker" in navigator) {
            try {
                await navigator.serviceWorker.register(
                    serviceWorkerFilePath,
                    { scope: './' }
                )
                .then(registration => {
                    let data = {
                        type: "CACHE_URLS",
                        payload: [
                            location.href,
                            ...performance.getEntriesByType("resource").map(r => r.name)
                        ]
                    }
                    registration.installing?.postMessage(data);
                });
                Log.debug("Service Worker registered with scope:", "OFFLINECACHESERVICE");
            } 
            catch (error) {
                Log.warn("Service Worker registration failed:", "OFFLINECACHESERVICE");
            }
        }
    }
}