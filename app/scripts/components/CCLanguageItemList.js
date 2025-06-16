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
 *      listBody: HTMLDivElement?,
 *      newSection: HTMLDivElement?,
 *      newSectionBody: HTMLDivElement?,
 *      newItem: CCLanguageItem?,
 *      listSection: Object.<String, CCLanguageItemListSection>,
 * }} CCLanguageItemListElements
 * 
 * @typedef {{
 * }} CCLanguageItemListPropertyBag
 * 
 * @typedef {{
 *      newItemCallback: Function?,
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
        listBody: null,
        newSection: null,
        newSectionBody: null,
        newItem: null,
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
        newItemCallback: null,
    }

    static #htmlRootTemplate = `
        <div class="CCLanguageItemList Container" data-use="root-container">
            <div class="ListHeader">
                <div class="ListTitle"><p class="RomanXXL NoBlockMargins" data-use="list.title">List</p></div>
                <div class="FormButton BlackTint Medium" data-use="list.add"><img src="./app/assets/svg/plus.svg" class="FormButtonIcon"></div>
            </div>
            <div class="NewItemsBody" data-use="list.body">
                <div class="Section" data-use="newsection">
                    <div class="SectionHeader MarginTXL MarginBM">
                        <div class="SectionTitle MarginRXL"><p class="KanaXL NoBlockMargins">New...</p></div>
                    </div>
                    <div class="SectionBody" data-use="newsection.body"></div>
                </div>
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

    static #htmlCardHolderTemplate = `
                <div class="CardHolder" data-use="cardholder">
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
    #initialiseUI() {

        let fragment = getDOMFragmentFromString(CCLanguageItemList.#htmlRootTemplate);
        let newCard = new CCLanguageItem();

        this.#elements.rootContainer = fragment.querySelector('[data-use="root-container"]');
        this.#elements.newSection = fragment.querySelector('[data-use="newsection"]');
        this.#elements.newSectionBody = fragment.querySelector('[data-use="newsection.body"]');
        this.#elements.newItem = newCard;
        this.#elements.listTitle = fragment.querySelector('[data-use="list.title"]');
        this.#elements.listBody = fragment.querySelector('[data-use="list.body"]');

        this.#elements.newSectionBody?.appendChild(newCard);

        this.appendChild(fragment);
    }

    
    #initialiseElements() {

        this.#initialiseSections(GojuonGroupingService.gojuonGroupings);

        this.#elements.newItem?.permanentEdit();
        this.#elements.newItem?.attachDataUpdateCallback(this.newItemCallback.bind(this));

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
     * @param {Function?} callback 
     * @returns
     */
    attachNewItemCallback(callback) {
        
        if (callback != null && typeof callback === "function") {
            this.#attachedCallbacks.newItemCallback = callback;
        }
        else {
            this.#attachedCallbacks.newItemCallback = null;
        }

    }

    /**
     * @param {...String} args 
     * @returns
     */
    resortGroups(...args) {

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
     * @param {EventBase} event
     */
    newItemCallback(event) {

        let newItem = new CCLanguageItem();
    
        this.#elements.listSection[event.currentData.gojuonKey].body.appendChild(newItem);

        newItem.loadFromPropertyBag(event.currentData);

        // Update to the newly created item
        /** @ts-ignore */
        event.originatingComponent = newItem;
        /** @ts-ignore */
        event.originatingId = newItem.id;

        // Fire callback if 
        if (this.#attachedCallbacks.newItemCallback) {
            this.#attachedCallbacks.newItemCallback(event);
        }
    }
}