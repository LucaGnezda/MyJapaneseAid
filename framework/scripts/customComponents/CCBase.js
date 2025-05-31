/**
 * Base class for custom components
 * @class
 * @constructor
 * @public
 */
class CCBase extends HTMLElement {
    /**
     * The id of the custom component
     * @type {string}
     */
    id = "";

    /** @type {AbortController} #preDisposeController */
    #abortController = new AbortController();

    constructor() {
        super();
    }


    /**
     * getPreDisposeSignal
     */
    getPreDisposeSignal() {
        let { signal } = this.#abortController;
        return { signal };
    }


    /**
     * PreDispose
     * Call this before releasing references to ensure event listeners and ourward facing object references are removed 
     */
    preDispose() {
        this.#abortController.abort();
    }
}

//let preDisposeController = new AbortController();
//let { signal } = preDisposeController;