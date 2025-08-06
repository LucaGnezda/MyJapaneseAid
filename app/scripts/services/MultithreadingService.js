/**
 * Multithreading processing object, 
 * @class
 * @public
 */
class MultithreadingService {

    /**
     * Member attributes
     */

    #threads = -1;
    /**
     * @type {Array<Worker>}
     */
    #workers = [];
    /**
     * @type {Array<Worker>}
     */
    #availableWorkers = [];
    /**
     * @type {*}
     */
    #requestBacklog = [];
    /**
     * @type {Function | Null}
     */
    #externalReturnCallback = null;
    /**
     * @param {MessageEvent & {currentTarget: Worker}} event
     */
    #internalReturnCallback = (event) => {

        let worker = event.currentTarget;

        if (!worker) {
            Log.error("No worker returned with event.", "THREADSERVICE");
            return;
        }

        if (this.#requestBacklog.length == 0) {
            this.#availableWorkers.push(worker);
        }
        else {
            let data = this.#requestBacklog.shift();
            worker.postMessage(data);
        }

        if (this.#externalReturnCallback) {
            this.#externalReturnCallback(event);
        }
    }


    /**
     * Constructor
     */
    /** 
     * @param {Number | null} [threadCap]
     */
    constructor(threadCap = null) {

        if (threadCap && Number.isInteger(navigator.hardwareConcurrency) && Number.isInteger(threadCap)) {
            this.#threads = Math.min(threadCap, navigator.hardwareConcurrency);
        }
        else if (Number.isInteger(navigator.hardwareConcurrency)) {
            this.#threads = navigator.hardwareConcurrency;
        }
        else if (threadCap && Number.isInteger(threadCap)) {
            this.#threads = threadCap;
        }
        else {
            this.#threads = 1; 
        }
    }


    /**
     * Getters/Setters
     */
    get workerCount() {
        return this.#workers.length;
    }

    get availableWorkerCount() {
        return this.#availableWorkers.length;
    }


    /**
     * Private Methods
     */


    /**
     * Public Methods
     */
    /** 
     * @param {String} workerCode
     * @param {Function} returnCallback
     */
    provisionWorkers(workerCode, returnCallback) {

        this.#externalReturnCallback = returnCallback;

        for (let i = 0; i < this.#threads; i++) {
            this.#workers[i] = new Worker(workerCode, {name: i.toString()});
            /** @ts-ignore */
            this.#workers[i].onmessage = this.#internalReturnCallback;
            this.#availableWorkers.push(this.#workers[i]);
        }

    }

    /** 
     * @param {*} data
     */
    request(data) {

        if (this.#availableWorkers.length > 0) {
            let useWorker = this.#availableWorkers.shift();
            /** @ts-ignore */
            useWorker.postMessage(data);
        }
        else {
            this.#requestBacklog.push(data);
        }

    }

    purgeBacklog () {
        this.#requestBacklog = [];
    }

    deprovisionWorkers() {
        
        for (let i = 0; i < this.#threads; i++) {
            this.#workers[i].terminate();
        }

    }

}