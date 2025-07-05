/**
 * Custom component used for collecting search input
 */
"use strict";

/**
 * Typedefs
 * @typedef {{
 *      searchInputElement: HTMLInputElement?, 
 *      andButtonElement: HTMLInputElement?, 
 *      orButtonElement: HTMLInputElement?, 
 *      clearButtonElement: HTMLButtonElement?, 
 *      searchButtonElement: HTMLInputElement?, 
 * }} CCSearchElements
 * 
 * @typedef {{
 *      searchType: String?, 
 * }} CCSearchPropertyBag
 * 
 * @typedef {{
 *      onChangeCallback: Function?, 
 *      onChangeDebouncedCallback: Function?
 * }} CCSearchAttachedCallbacks
 */

class CCSearch extends CCBase {

    /**
     * Member attributes
     */

    /**
     * The elements that make up this component
     * @type {CCSearchElements}
     */
    #elements = {
        searchInputElement: null,
        andButtonElement: null,
        orButtonElement: null,
        clearButtonElement: null,
        searchButtonElement: null,
    }    

    /**
     * The elements that make up this component
     * @type {CCSearchPropertyBag}
     */
    #propertyBag = {
        searchType: null,
    }

    /**
     * The elements that make up this component
     * @type {CCSearchAttachedCallbacks}
     */
    #attachedCallbacks = {
        onChangeCallback: null,
        onChangeDebouncedCallback: null,
    }

    static #htmlTemplate = `
        <div class="CCSearch Container" data-container>
            <div class="SearchControl">
                <input type="text" class="SearchInput SizeH32 RomanL" data-searchinput>
                <div class="SearchButtonSet SizeH32">
                    <div class="SearchButton SizeH28 Text" data-andbutton>and</div>
                    <div class="SearchButton SizeH28 Text" data-orbutton>or</div>
                    <div class="SearchButton SizeH28" data-clearbutton>
                        <img src="./app/assets/svg/cross.svg" class="SearchIcon">
                    </div>
                    <div class="SearchButton SizeH28 Show Last" data-searchbutton>
                        <img src="./app/assets/svg/search.svg" class="SearchIcon SizeWH16">            
                    </div>
                </div>
            </div>
        </div>
    `;

    /**
     * Constructor
     */
    /** 
     * @param {String | Boolean} id
     * @param {Boolean} useShadowDOM  
     */
    constructor(id = false, useShadowDOM = true) {
        super(id);

        this.#initialiseStructure(useShadowDOM);
    }


    /**
     * Getters/Setters
     */
    static get observedAttributes() {
        return [];
    }


    /**
     * Private Methods
     */
    /** 
     * @param {Boolean} useShadowDOM  
     */
    #initialiseStructure(useShadowDOM) {

        let fragment = getDOMFragmentFromString(CCSearch.#htmlTemplate);

        this.#elements.searchInputElement = fragment.querySelector('[data-searchinput]');
        this.#elements.andButtonElement = fragment.querySelector('[data-andbutton]');
        this.#elements.orButtonElement = fragment.querySelector('[data-orbutton]');
        this.#elements.clearButtonElement = fragment.querySelector('[data-clearbutton]');
        this.#elements.searchButtonElement = fragment.querySelector('[data-searchbutton]');

        if (useShadowDOM) {
            let shadow = this.attachShadow({ mode: "open" });
            shadow.appendChild(fragment);
        }
        else {
            this.appendChild(fragment);
        }
    }

    #initialiseBehaviour() {

        if (this.#elements.andButtonElement && this.#elements.orButtonElement && this.#elements.clearButtonElement && this.#elements.searchButtonElement && this.#elements.searchInputElement) {
            
            this.#elements.andButtonElement.addEventListener("click", this.andToOrClickCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.orButtonElement.addEventListener("click", this.orToAndClickCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.clearButtonElement.addEventListener("click", this.clearClickCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.searchButtonElement.addEventListener("click", this.searchClickCallback.bind(this), this.getPreDisposeSignal());

            this.#elements.searchInputElement.addEventListener("keyup", this.keypressCallback.bind(this), this.getPreDisposeSignal());

            this.#propertyBag.searchType = null;
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    /**
     * 
     * @param {KeyboardEvent | MouseEvent | ?} triggerEvent 
     * @param {Boolean} useDebounce 
     */
    #issueEvent(triggerEvent, useDebounce) {

        if (this.#propertyBag && this.#attachedCallbacks && this.#elements && this.#elements.searchInputElement && 
            this.#attachedCallbacks.onChangeDebouncedCallback && this.#attachedCallbacks.onChangeCallback) {

            let event = {
                originatingEvent: triggerEvent,
                originatingObject: this,
                searchType: this.#propertyBag.searchType,
                searchString: this.#elements.searchInputElement.value.trim()
            };

            if (useDebounce) {
                this.#attachedCallbacks.onChangeDebouncedCallback(event);
            }
            else {
                this.#attachedCallbacks.onChangeCallback(event);
            }
        }
    }


    /**
     * Public methods
     */
    render() {

    }

    /**
     * @param {string} value 
     */
    setSearch(value) {
        if (this.#elements.searchInputElement) {
            if (value != this.#elements.searchInputElement.value) {
                this.#elements.searchInputElement.value = value;
                this.#issueEvent(null, false);
            }
        }  
    }

    resetSearch() {
        this.clearClickCallback(null);
    }


    /**
     * @param {Function} callback
     */
    attachOnChangeDebouncedCallback(callback) {

        if (callback != null && typeof callback === "function" && this.#elements.searchInputElement) {
            this.#attachedCallbacks.onChangeCallback = callback;
            this.#attachedCallbacks.onChangeDebouncedCallback = debounce(callback);
        }
        else if (this.#elements.searchInputElement) {
            this.#attachedCallbacks.onChangeCallback = null;
            this.#attachedCallbacks.onChangeDebouncedCallback = null;
        }
    }


    /**
     * Callbacks
     */
    connectedCallback() {

        this.#initialiseBehaviour();
        this.render();
        Log.debug(`${this.constructor.name} connected to DOM`, "COMPONENT");

    }
    
    disconnectedCallback() {
        this.preDispose();
        Log.debug(`${this.constructor.name} disconnected from DOM`, "COMPONENT");
    }

    /**
     * @param {string} name
     * @param {*} oldValue
     * @param {*} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
        Log.debug(`${this.constructor.name}, value ${name} changed from ${oldValue} to ${newValue}`, "COMPONENT");
    }

    /**
     * @param {KeyboardEvent?} keyEvent
     * @returns
     */
    keypressCallback(keyEvent) {

        if (this.#elements.searchInputElement && this.#elements.andButtonElement && this.#elements.orButtonElement && this.#elements.clearButtonElement) {
            
            // show the clear button if there is a searchable string
            if (this.#elements.searchInputElement.value.trim() != "") {
                this.#elements.clearButtonElement.classList.add("Show");
            }
            else {
                this.#elements.clearButtonElement.classList.remove("Show");
            }

            // show the and/or button if there is more than one searchable fragment
            if (this.#elements.searchInputElement.value.trim().match(/\s/)) { // if there is internal whitespace

                if (this.#propertyBag.searchType == "and") {
                    this.#elements.andButtonElement.classList.add("Show");
                    this.#elements.orButtonElement.classList.remove("Show");
                }
                else {  // null, or, or something unexpected
                    this.#elements.andButtonElement.classList.remove("Show");
                    this.#elements.orButtonElement.classList.add("Show");
                    this.#propertyBag.searchType = "or";
                }
            }
            else { // no internal whitespace
                this.#elements.andButtonElement.classList.remove("Show");
                this.#elements.orButtonElement.classList.remove("Show");
                this.#propertyBag.searchType = null;
            }
        
            this.#issueEvent(keyEvent, true);
        
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    /**
     * @param {MouseEvent} clickEvent 
     * @returns
     */
    andToOrClickCallback(clickEvent) {

        if (this.#elements.andButtonElement && this.#elements.orButtonElement && this.#propertyBag) {
            this.#elements.andButtonElement.classList.remove("Show");
            this.#elements.orButtonElement.classList.add("Show");
            this.#propertyBag.searchType = "or";

            this.#issueEvent(clickEvent, false);
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    /**
     * @param {MouseEvent} clickEvent 
     * @returns
     */
    orToAndClickCallback(clickEvent) {

        if (this.#elements.andButtonElement && this.#elements.orButtonElement && this.#propertyBag) {
            this.#elements.andButtonElement.classList.add("Show");
            this.#elements.orButtonElement.classList.remove("Show");
            this.#propertyBag.searchType = "and";

            this.#issueEvent(clickEvent, false);
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }

    }

    /**
     * @param {MouseEvent | ?} clickEvent 
     * @returns
     */
    clearClickCallback(clickEvent) {

        if (this.#elements.searchInputElement && this.#elements.andButtonElement && this.#elements.orButtonElement && this.#elements.clearButtonElement) {
            this.#elements.searchInputElement.value = "";
            this.#propertyBag.searchType = null;

            this.#issueEvent(clickEvent, false);
            
            this.#elements.orButtonElement.classList.remove("Show");
            this.#elements.andButtonElement.classList.remove("Show");
            this.#elements.clearButtonElement.classList.remove("Show");
            this.#elements.searchInputElement.focus();
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }

    }

    /**
     * @param {MouseEvent} clickEvent
     * @returns
     */
    searchClickCallback(clickEvent) {

        this.#issueEvent(clickEvent, false);

    }
}