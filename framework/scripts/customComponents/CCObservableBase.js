/**
 * @class
 * @public
 * @constructor
 */
class CCObservableBase extends HTMLElement {
    /**
     * @type {ObservableCore}
     */
    #state;
    
    /**
     * @type {Function?} TODO: Resolve this type!
     */
    #dataChangedCallbackExtention = null;

    /**
     * @type {Function?} TODO: Resolve this type!
     */
    #dataListnerCallbackExtention = null;

    /**
     * @type {string}
     */
    id = "";

    /** @type {AbortController} #preDisposeController */
    #abortController = new AbortController();

    /**
     * @type {AnyDictionary}
     */
    observableData;
    
    /**
     * @param {ObservableCore} state 
     */
    constructor(state) {
        super();
        this.#state = state;
        this.observableData = state.dataProxy;
    }

    get dataChangedCallbackExtention() {
        return this.#dataChangedCallbackExtention;
    }

    set dataChangedCallbackExtention(val) {
        this.#dataChangedCallbackExtention = val;
    }

    get dataListnerCallbackExtention() {
        return this.#dataListnerCallbackExtention;
    }

    set dataListnerCallbackExtention(val) {
        this.#dataListnerCallbackExtention = val;
    }

    get subscribers() {
        return this.#state.subscribers;
    }

    get subscriptionsTo() {
        return this.#state.subscriptionsTo;
    }
    
    get notificationStatus() {
        return this.#state.notificationStatus
    }

    set notificationStatus(val) {
        this.#state.notificationStatus = val;
    }

    /**
     * Adds a subscriber to the observable
     * @param {*} obj 
     * @param {ObservableCallback} callbackToAdd 
     * @returns {void}
     */
    addSubscriber(obj, callbackToAdd) {
        this.#state.addSubscriber(obj, callbackToAdd);
    }

    /**
     * Adds a subscription to the observable
     * @param {*} obj 
     * @param {ObservableCallback} callbackToAdd
     * @returns {void}
     */
    subscribeTo(obj, callbackToAdd) {
        this.#state.subscribeTo(obj, callbackToAdd);
    }

    /**
     * Removes a subscriber from the observable
     * @param {*} obj 
     * @returns {void}
     */
    removeSubscriber(obj) {
        this.#state.removeSubscriber(obj);
    }

    /**
     * Removes a subscription from the observable
     * @param {*} obj 
     * @returns {void}
     */
    unsubscribeFrom(obj) {
        this.#state.unsubscribeFrom(obj);
    }

    /**
     * Removes all subscriptions from the observable
     * @returns {void}
     */
    removeAllSubscriptions() {
        this.#state.removeAllSubscriptions();
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
