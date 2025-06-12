/**
 * Custom component used for displaying and editing a word, phrase or sentence
 */
"use strict";

/**
 * Typedefs
 * @typedef {{
 * }} CCLanguageItemListElements
 * 
 * @typedef {{
 * }} CCLanguageItemListPropertyBag
 * 
 * @typedef {{
 * }} CCLanguageItemListAttachedCallbacks
 */

class CCLanguageItemList extends CCBase {

    /**
     * Member attributes
     */

    /**
     * The elements that make up this component
     * @type {CCLanguageItemListElements}
     */
    #elements = {
    }    

    /**
     * The elements that make up this component
     * @type {CCLanguageItemListPropertyBag}
     */
    #propertyBag = {
    }

    /**
     * The elements that make up this component
     * @type {CCLanguageItemListAttachedCallbacks}
     */
    #attachedCallbacks = {
    }

    static #htmlRootTemplate = `
        <div class="CCLanguageItemList Container" data-use="root-container">
            <div class="ListHeading"></div>
            <div class="ListBody">
                <div class="Section">
                    <div class="SectionHeading"></div>
                    <div class="SectionBody"></div>
                </div>
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

        let fragment = getDOMFragmentFromString(CCLanguageItemList.#htmlRootTemplate);

        this.#elements
        this.#propertyBag
        this.#attachedCallbacks

        this.appendChild(fragment);
    }

    
    #initialiseElements() {

        if (true) {
            

        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }


    /**
     * Public methods
     */
    render() {

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
}