/**
 * Base class for custom components
 * @class
 * @constructor
 * @public
 */
class CCBase extends HTMLElement {

    /** @type {AbortController | Null} #preDisposeController */
    #abortController = null;

    /** 
     * @param {String | Boolean} id 
     */
    constructor(id = false) {
        super();

        // set the id to nothing, a supplied id, or a generated guid
        if (isString(id)) {
            /** @ts-ignore */
            this.setAttribute("id", id);
        }
        else if (id == true) {
            this.setAttribute("id", crypto.randomUUID());
        }
    }


    /**
     * getPreDisposeSignal
     */
    getPreDisposeSignal() {

        // provision an abort controller if we don't already have one.
        if (this.#abortController == null) {
            this.#abortController = new AbortController();
        }

        let { signal } = this.#abortController;
        return { signal };
    }


    /**
     * PreDispose
     * Call this before releasing references to ensure event listeners and ourward facing object references are removed 
     */
    preDispose() {
        
        if (this.#abortController) {
            this.#abortController.abort();
        }

        // deprovision the abort controller so we can start afresh if reconnected to the DOM
        this.#abortController = null;
    }
}

//let preDisposeController = new AbortController();
//let { signal } = preDisposeController;