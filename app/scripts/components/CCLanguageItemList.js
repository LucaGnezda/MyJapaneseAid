/**
 * Custom component used for displaying and editing a word, phrase or sentence
 */
"use strict";

/**
 * Typedefs
 * @typedef {{
 *      root: HTMLDivElement?,
 *      title: HTMLDivElement?,
 *      subtitle: HTMLDivElement?,
 *      body: HTMLDivElement?,
 * }} CCLanguageItemListSection
 * 
 * @typedef {{
 *      rootContainer: HTMLDivElement?,
 *      listHeading: HTMLDivElement?,
 *      listBody: HTMLDivElement?,
 *      listSection: CCLanguageItemListSection[],
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
        rootContainer: null,
        listHeading: null,
        listBody: null,
        listSection: [],
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
            <div class="ListHeader">
                <div class="ListTitle"><p class="RomanXL NoBlockMargins" data-use="list.title">List</p></div>
                <div class="FormButton" data-use="list.add"><img src="./app/assets/svg/plus.svg" class="FormButtonIcon"></div>
            </div>
            <div class="ListBody" data-use="list.body">
            </div>
        </div>
    `;

    static #htmlSectionTemplate = `
                <div class="Section" data-use="section">
                    <div class="SectionHeader MarginTXL">
                        <div class="SectionTitle MarginRXL"><p class="KanaXL NoBlockMargins" data-use="section.title"></p></div>
                        <div class="SectionSubTitle"><p class="RomanL NoBlockMargins" data-use="section.subtitle"></p></div>
                        <div class="FormButton ShadowGreenOnBlack Small"><img src="./app/assets/svg/arrow-down.svg" class="FormButtonSmallGreenIcon"></div>
                    </div>
                    <div class="SectionBody" data-use="section.body"></div>
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

        this.#elements.rootContainer = fragment.querySelector('[data-use="root-container"]');
        this.#elements.listHeading = fragment.querySelector('[data-use="list.heading"]');
        this.#elements.listBody = fragment.querySelector('[data-use="list.body"]');

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
     * @param {GojuonGrouping[]} obj 
     * @returns
    */
    loadSections(obj) {

        if (this.#elements.listBody) {
        
            for (let i = 0; i < obj.length; i++) {

                let fragment = getDOMFragmentFromString(CCLanguageItemList.#htmlSectionTemplate);

                /** @type {CCLanguageItemListSection} */
                let section = {
                    root: fragment.querySelector('[data-use="section"]'),
                    title: fragment.querySelector('[data-use="section.title"]'),
                    subtitle: fragment.querySelector('[data-use="section.subtitle"]'),
                    body: fragment.querySelector('[data-use="section.body"]'),
                };

                if (section.title instanceof HTMLElement && section.subtitle instanceof HTMLElement) {
                    section.title.innerText = obj[i].title || "";
                    section.subtitle.innerText = obj[i].subTitle || "";
                }
                else {
                    Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
                    return;
                }

                this.#elements.listBody.appendChild(fragment);
                this.#elements.listSection.push(section);
            }
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
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
}