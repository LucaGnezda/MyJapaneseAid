/**
 * Base class for custom components
 * @class
 * @constructor
 * @public
 */
class CCBase extends HTMLElement {

    /** @type {AbortController} #preDisposeController */
    #abortController = new AbortController();

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