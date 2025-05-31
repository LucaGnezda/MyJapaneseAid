/**
 * Custom component used for collecting search input
 */
"use strict";

/**
 * Typedefs
 * @typedef {{searchInputElement: HTMLInputElement?, andButtonElement: HTMLInputElement?, orButtonElement: HTMLInputElement?, clearButtonElement: HTMLButtonElement?, searchButtonElement: HTMLInputElement?, scopeAllElement: HTMLDivElement?, scopeSyllabaryElement: HTMLDivElement?, scopeWordsElement: HTMLDivElement?, scopePhrasesElement: HTMLDivElement?, scopeSentencesElement: HTMLDivElement?}} CCSearchElements
 * @typedef {{onChangeCallback: Function?, onChangeDebouncedCallback: Function?, searchType: String?, searchScope: String?}} CCSearchPropertyBag
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
        scopeAllElement: null,
        scopeSyllabaryElement: null,
        scopeWordsElement: null,
        scopePhrasesElement: null,
        scopeSentencesElement: null
    }    

    /**
     * The elements that make up this component
     * @type {CCSearchPropertyBag}
     */
    #propertyBag = {
        onChangeCallback: null,
        onChangeDebouncedCallback: null,
        searchType: null,
        searchScope: null
    }

    static #htmlTemplate = `
        <div class="CCSearchContainer" data-container>
            <div class="CCSearchControl">
                <input type="text" class="CCSearchInput" data-searchinput>
                <div class="CCSearchButtonSet">
                    <div class="CCSearchButton Text" data-andbutton>and</div>
                    <div class="CCSearchButton Text" data-orbutton>or</div>
                    <div class="CCSearchButton" data-clearbutton>
                        <img src="./app/assets/svg/cross.svg" class="CCSearchIcon">
                    </div>
                    <div class="CCSearchButton Show Last" data-searchbutton>
                        <img src="./app/assets/svg/search.svg" class="CCSearchIcon">            
                    </div>
                </div>
            </div>
            <div class="CCSearchFilters">
                <div class="CCSearchFilter" data-searchscope="all">All</div>
                <div class="CCSearchFilter" data-searchscope="syllabary">Syllabary</div>
                <div class="CCSearchFilter" data-searchscope="words">Words</div>
                <div class="CCSearchFilter" data-searchscope="phrases">Phrases</div>
                <div class="CCSearchFilter" data-searchscope="sentences">Sentences</div>
            </div>
        </div>
    `;

    /**
     * Constructor
     */
    constructor() {
        super();

        // Allocate a guid
        if (isEmptyOrNull(this.id)) {
            this.id = crypto.randomUUID();
        }
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
    #initialiseUI() {

        let fragment = getDOMFragmentFromString(CCSearch.#htmlTemplate);

        this.#elements.searchInputElement = fragment.querySelector('[data-searchinput]');
        this.#elements.andButtonElement = fragment.querySelector('[data-andbutton]');
        this.#elements.orButtonElement = fragment.querySelector('[data-orbutton]');
        this.#elements.clearButtonElement = fragment.querySelector('[data-clearbutton]');
        this.#elements.searchButtonElement = fragment.querySelector('[data-searchbutton]');

        this.#elements.scopeAllElement = fragment.querySelector('[data-searchscope="all"]');
        this.#elements.scopeSyllabaryElement = fragment.querySelector('[data-searchscope="syllabary"]');
        this.#elements.scopeWordsElement = fragment.querySelector('[data-searchscope="words"]');
        this.#elements.scopePhrasesElement = fragment.querySelector('[data-searchscope="phrases"]');
        this.#elements.scopeSentencesElement = fragment.querySelector('[data-searchscope="sentences"]');

        this.appendChild(fragment);
    }

    #initialiseElements() {

        if (this.#elements.andButtonElement && this.#elements.orButtonElement && this.#elements.clearButtonElement && this.#elements.searchButtonElement && this.#elements.scopeAllElement && this.#elements.scopeSyllabaryElement && this.#elements.scopeWordsElement && this.#elements.scopePhrasesElement && this.#elements.scopeSentencesElement) {
            
            this.#elements.andButtonElement.addEventListener("click", this.andToOrClickCallback.bind(this));
            this.#elements.orButtonElement.addEventListener("click", this.orToAndClickCallback.bind(this));
            this.#elements.clearButtonElement.addEventListener("click", this.clearClickCallback.bind(this));
            this.#elements.searchButtonElement.addEventListener("click", this.searchClickCallback.bind(this));

            this.#elements.scopeAllElement.addEventListener("click", this.scopeClickCallback.bind(this));
            this.#elements.scopeSyllabaryElement.addEventListener("click", this.scopeClickCallback.bind(this));
            this.#elements.scopeWordsElement.addEventListener("click", this.scopeClickCallback.bind(this));
            this.#elements.scopePhrasesElement.addEventListener("click", this.scopeClickCallback.bind(this));
            this.#elements.scopeSentencesElement.addEventListener("click", this.scopeClickCallback.bind(this));

            this.#propertyBag.searchType = null;
            this.#propertyBag.searchScope = "all";

            this.#elements.scopeAllElement.classList.add("Selected");
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

        if (this.#propertyBag && this.#elements && this.#elements.searchInputElement && this.#propertyBag.onChangeDebouncedCallback && this.#propertyBag.onChangeCallback) {

            let event = {
                originatingEvent: triggerEvent,
                originatingObject: this,
                searchType: this.#propertyBag.searchType,
                searchScope: this.#propertyBag.searchScope,
                searchString: this.#elements.searchInputElement.value.trim()
            };

            if (useDebounce) {
                this.#propertyBag.onChangeDebouncedCallback(event);
            }
            else {
                this.#propertyBag.onChangeCallback(event);
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
            this.#propertyBag.onChangeCallback = callback;
            this.#propertyBag.onChangeDebouncedCallback = debounce(callback);
            this.#elements.searchInputElement.addEventListener("keyup", this.keypressCallback.bind(this));
        }
        else if (this.#elements.searchInputElement) {
            this.#elements.searchInputElement.removeEventListener("keyup", this.keypressCallback.bind(this));
            this.#propertyBag.onChangeCallback = null;
            this.#propertyBag.onChangeDebouncedCallback = null;
        }
    }


    /**
     * Callbacks
     */
    connectedCallback() {

        this.#initialiseUI();
        this.#initialiseElements();
        this.render();
        Log.debug(`${this.constructor.name} connected to DOM`, "COMPONENT");

    }
    
    disconnectedCallback() {
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

    /**
     * @param {MouseEvent & {target:HTMLElement} | ?} clickEvent
     * @returns
     */
    scopeClickCallback(clickEvent) {

        if (clickEvent && clickEvent.target && this.#propertyBag && this.#propertyBag.onChangeCallback && this.#elements.searchInputElement && this.#elements.scopeAllElement && this.#elements.scopeSyllabaryElement && this.#elements.scopeWordsElement && this.#elements.scopePhrasesElement && this.#elements.scopeSentencesElement) {
            
            this.#elements.scopeAllElement.classList.remove("Selected");
            this.#elements.scopeSyllabaryElement.classList.remove("Selected");
            this.#elements.scopeWordsElement.classList.remove("Selected");
            this.#elements.scopePhrasesElement.classList.remove("Selected");
            this.#elements.scopeSentencesElement.classList.remove("Selected");

            let scope = clickEvent.target.getAttribute("data-searchscope")

            switch (scope) {
                case "all":
                    this.#elements.scopeAllElement.classList.add("Selected");
                    this.#propertyBag.searchScope = scope;
                    break;

                case "syllabary":
                    this.#elements.scopeSyllabaryElement.classList.add("Selected");
                    this.#propertyBag.searchScope = scope;
                    break;

                case "words":
                    this.#elements.scopeWordsElement.classList.add("Selected");
                    this.#propertyBag.searchScope = scope;
                    break;

                case "phrases":
                    this.#elements.scopePhrasesElement.classList.add("Selected");
                    this.#propertyBag.searchScope = scope;
                    break;

                case "sentences":
                    this.#elements.scopeSentencesElement.classList.add("Selected");
                    this.#propertyBag.searchScope = scope;
                    break;

            }

            this.#issueEvent(clickEvent, false);
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }
}