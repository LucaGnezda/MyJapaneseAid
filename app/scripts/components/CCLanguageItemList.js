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
 * }} CCLanguageItemListSectionElements
 * 
 * @typedef {{
 *      subComponents: Object.<String, CCLanguageItem>,
 *      subComponentsSearchKeys: Object.<String, String>,
 *      subComponentsOrderKeys: Object.<String, String>,
 * }} CCLanguageItemListSectionProperties
 * 
 * @typedef {{
 *      rootContainer: HTMLDivElement?,
 *      listTitle: HTMLDivElement?,
 *      listControls: HTMLElement?,
 *      listBody: HTMLDivElement?,
 *      listSection: Object.<String, CCLanguageItemListSectionElements>,
 * }} CCLanguageItemListElements
 * 
 * @typedef {{
 *      listSection: Object.<String, CCLanguageItemListSectionProperties>,
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
        listSection: {},
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

                    /** @type {CCLanguageItemListSectionElements} */
                    let sectionElements = {
                        root: fragment.querySelector('[data-use="section"]'),
                        title: fragment.querySelector('[data-use="section.title"]'),
                        subtitle: fragment.querySelector('[data-use="section.subtitle"]'),
                        body: fragment.querySelector('[data-use="section.body"]'),
                    };

                    if (sectionElements.title instanceof HTMLElement && sectionElements.subtitle instanceof HTMLElement) {
                        sectionElements.title.innerText = obj[i].title || "";
                        sectionElements.subtitle.innerText = obj[i].subTitle || "";
                    }
                    else {
                        Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
                        return;
                    }

                    this.#elements.listBody.appendChild(fragment);
                    this.#elements.listSection[obj[i].gojuonKey] = sectionElements;

                    /** @type {CCLanguageItemListSectionProperties} */
                    let sectionProperties = {
                        subComponents: {},
                        subComponentsSearchKeys: {},
                        subComponentsOrderKeys: {},
                    };

                    this.#propertyBag.listSection[obj[i].gojuonKey] = sectionProperties;
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
     * @param {String} toGroup 
     * @param {String} newKana
     * @returns
     */
    #getDestinationIndex(toGroup, newKana) {

        let nodes = this.#elements.listSection[toGroup].body.childNodes;
        let priorOrderKeys = this.#propertyBag.listSection[toGroup].subComponentsOrderKeys;
        let from = 0;
        let to = nodes.length - 1;
        let mid;

        // if there are no items in the destination, or the kana will appear last in the list, return the length
        if (nodes.length == 0 || priorOrderKeys[nodes[to].id].localeCompare(newKana, 'ja') < 0) { 
            return nodes.length;
        }

        // This will always return the element after the new Kana (so we can do an insert before)
        while (from != to) {
            mid = from + Math.floor((to - from) / 2);
            // If current element comes after the new kana
            if (priorOrderKeys[nodes[mid].id].localeCompare(newKana, 'ja') > 0) {
                to = mid; // set the max to the current 
            }
            else {
                from = mid + 1; // set the min to one after the current
            }
        }

        return from;
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
     * @param {Function | Null} [saveCallback]
     * @param {Function | Null} [cancelCallback]
     * @param {Function | Null} [deleteRequestCallback]
     * @returns
     */
    addItem(payload, saveCallback = null, cancelCallback = null, deleteRequestCallback = null) {

        if (!payload || !payload.gojuonKey) {
            Log.error("A valid gojuonKey is needed", "COMPONENT");
            return;
        }

        let newItem = new CCLanguageItem(true, false);
        newItem.loadFromPropertyBag(payload);
        if (saveCallback) { newItem.attachSaveCallback(saveCallback); }
        if (cancelCallback) { newItem.attachCancelCallback(cancelCallback); }
        if (deleteRequestCallback) { newItem.attachDeleteRequestCallback(deleteRequestCallback); }

        // Calculate where to add the component
        let toGroup = newItem.gojuonKey || "xx";
        let movetoIndex = this.#getDestinationIndex(toGroup, newItem.kana || "");
        let moveToGroupBody = this.#elements.listSection[toGroup].body;
        let moveAfterComponent = null;

        if (movetoIndex < moveToGroupBody.childNodes.length) {
            moveAfterComponent = moveToGroupBody.childNodes[movetoIndex];
        }

        // add the component
        moveToGroupBody.insertBefore(newItem, moveAfterComponent);

        // Update indexes
        this.#propertyBag.listSection[payload.gojuonKey].subComponents[newItem.id] = newItem;
        this.#propertyBag.listSection[payload.gojuonKey].subComponentsSearchKeys[newItem.id] = newItem.searchKey;
        this.#propertyBag.listSection[payload.gojuonKey].subComponentsOrderKeys[newItem.id] = newItem.kana;

    }

    /**
     * @param {String} id 
     * @param {String} fromGroup
     * @param {String} toGroup
     * @returns 
     */
    moveItem(id, fromGroup, toGroup) {

        let compponentToMove = this.#propertyBag.listSection[fromGroup].subComponents[id];

        // If the list's indexed kana matches the newly saved object
        if (this.#propertyBag.listSection[fromGroup].subComponentsOrderKeys[id] == compponentToMove.kana) {
            // nothing meaningful changed from an ordering perspective, so we can just return
            return;
        }

        // Calculate where to add the component
        let movetoIndex = this.#getDestinationIndex(toGroup, compponentToMove.kana);
        let moveToGroupBody = this.#elements.listSection[toGroup].body;
        let moveAfterComponent = null;
        
        if (movetoIndex < moveToGroupBody.childNodes.length) {
            moveAfterComponent = moveToGroupBody.childNodes[movetoIndex];
        }

        // add the component
        moveToGroupBody.insertBefore(compponentToMove, moveAfterComponent);

        // Update indexes
        this.#propertyBag.listSection[toGroup].subComponentsOrderKeys[id] = compponentToMove.kana;
        this.#propertyBag.listSection[toGroup].subComponents[id] = compponentToMove;
        if (fromGroup != toGroup) {
            delete this.#propertyBag.listSection[fromGroup].subComponentsOrderKeys[id];
            delete this.#propertyBag.listSection[fromGroup].subComponents[id]
        }

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
}