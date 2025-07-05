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
 *      listTitle: HTMLDivElement?,
 *      listControls: HTMLElement?,
 *      listBody: HTMLDivElement?,
 *      listSection: Object.<String, CCLanguageItemListSection>,
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
        listTitle: null,
        listControls: null,
        listBody: null,
        listSection: {},
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
                <div class="ListTitle"><p class="RomanXXL NoBlockMargins" data-use="list.title">List</p></div>
                <div class="ButtonStipContainer" data-use="list.controls"></div>
            </div>
            <div class="ListBody" data-use="list.body">
            </div>
        </div>
    `;

    static #htmlSectionTemplate = `
                <div class="Section" data-use="section">
                    <div class="SectionHeader MarginTXL MarginBM">
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
    /** 
     * @param {String | Boolean} id 
     * @param {Boolean} useShadowDOM  
     */
    constructor(id = false, useShadowDOM = true) {
        super(id);

        this.#initialiseStructure();
    }


    /**
     * Getters/Setters
     */
    static get observedAttributes() {
        return [];
    }

    /** 
     * @param {String} str 
     * @returns
    */
    set title(str) {
        if (this.#elements.listTitle) {
            this.#elements.listTitle.innerText = str;
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }


    /**
     * Private Methods
     */
    #initialiseStructure() {

        let fragment = getDOMFragmentFromString(CCLanguageItemList.#htmlRootTemplate);

        this.#elements.rootContainer = fragment.querySelector('[data-use="root-container"]');
        this.#elements.listControls = fragment.querySelector('[data-use="list.controls"]');
        this.#elements.listTitle = fragment.querySelector('[data-use="list.title"]');
        this.#elements.listBody = fragment.querySelector('[data-use="list.body"]');

        this.#initialiseSections(GojuonGroupingService.gojuonGroupings);

        this.appendChild(fragment);
    }

    
    #initialiseBehaviour() {

        // nothing to do

    }

    /** 
     * @param {GojuonGrouping[]} obj 
     * @returns
    */
    #initialiseSections(obj) {

        if (this.#elements.listBody) {
        
            for (let i = 0; i < obj.length; i++) {

                if (obj[i].gojuonKey != null) {

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
                    this.#elements.listSection[obj[i].gojuonKey] = section;
                }
                else {
                    Log.fatal("Unexpected data recived from GojuonService", "COMPONENT", this);
                }
            }
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
     * @param {HTMLElement} element 
     * @returns
     */
    AddControls(element) {
        if (!this.#elements.listControls) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        this.#elements.listControls.replaceChildren(element);
    }

    /**
     * @param {...String} args 
     * @returns
     */
    resortGroups(...args) {

    } 
    
    /**
     * @param {CCLanguageItemPropertyBag} payload 
     * @returns
     */
    addItem(payload) {

        if (!payload || !payload.gojuonKey) {
            Log.error("A valid gojuonKey is needed", "COMPONENT");
            return;
        }

         let newItem = new CCLanguageItem();
         newItem.loadFromPropertyBag(payload);

         this.#elements.listSection[payload.gojuonKey].body.appendChild(newItem);

    }

    /**
     * @param {String} id 
     * @param {String} fromGroup
     * @param {String} toGroup
     * @returns 
     */
    moveItem(id, fromGroup, toGroup) {

    }

    /**
     * @param {String} id 
     * @param {String} fromGroup 
     * @returns
     */
    removeItem(id, fromGroup) {

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