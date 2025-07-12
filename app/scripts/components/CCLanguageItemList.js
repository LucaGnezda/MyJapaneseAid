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
 *      searchKey: String,
 *      typeBitmask: Number,
 * }} CCLanguageItemListSearchKeys
 *  
 * @typedef {{
 *      subComponents: Object.<String, CCLanguageItem>,
 *      subComponentsSearchKeys: Object.<String, CCLanguageItemListSearchKeys>,
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
 *      searchRequestId: String,
 * }} CCLanguageItemListPropertyBag
 *  
 * @typedef {{
 * }} CCLanguageItemListAttachedCallbacks
 * 
 * @typedef {{
 *      typeFilterBitmask: Number,
 *      searchString: String,
 *      searchType: String,
 * }} CCLanguageItemListRequestResultLookfor
 * 
 * @typedef {{
 *      searchRequestId: String,
 *      lookFor: CCLanguageItemListRequestResultLookfor,
 *      withinSection: String,
 *      searchSpace: Object.<String, CCLanguageItemListSearchKeys>,
 *      result: Object.<String, Boolean>,
 *      matchedCount: Number,
 *      totalCount: Number,
 * }} CCLanguageItemListRequestResult
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
        searchRequestId: "",
    }

    /**
     * The elements that make up this component
     * @type {CCLanguageItemListAttachedCallbacks}
     */
    #attachedCallbacks = {
    }

    /**
     * The elements that make up this component
     * @type {MultithreadingService | Null}
     */
    #searchService = null;

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

    static #workerCode = URL.createObjectURL(new Blob([ '(',

        function(){

            self.onmessage = (event) => {

                let response = event.data;
                let searchterms;

                response.matchedCount = 0;

                if (response.lookFor.searchType != null) {
                    searchterms = response.lookFor.searchString.split(" ");
                }
                else {
                    searchterms = [];
                    searchterms[0] = response.lookFor.searchString;
                }

                for (let key in response.searchSpace) {

                    // First make sure it matech the type filter, exit current iteration early if not.
                    if ((response.searchSpace[key].typeBitmask & response.lookFor.typeFilterBitmask) == 0) {
                        response.result[key] = false;
                        continue;
                    }
                    else if (response.lookFor.searchString.length == 0) {
                        response.result[key] = true;
                        response.matchedCount += 1;
                        continue;
                    }

                    let match;

                    if (response.lookFor.searchType == "or") {

                        match = false;

                        for (let term of searchterms) {
                            if (response.searchSpace[key].searchKey.includes(term)) {
                                match = true;
                                break;
                            }
                        }
                    }
                    else { // "and" or null (single word)

                        match = true;

                        for (let term of searchterms) {
                            if (!response.searchSpace[key].searchKey.includes(term)) {
                                match = false;
                                break;
                            }
                        }
                    }
                    
                    response.result[key] = match;
                    if (match) {
                        response.matchedCount += 1;
                    }
                }

                self.postMessage(response);
            }

        }.toString(),

    ')()' ], { type: 'application/javascript' } ) );


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
        this.#provisionSearchWorkers();
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


    #provisionSearchWorkers() {

        this.#searchService = new MultithreadingService(4);
        this.#searchService.provisionWorkers(CCLanguageItemList.#workerCode, this.applyResultsCallback.bind(this));

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
    addControls(element) {
        if (!this.#elements.listControls) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        this.#elements.listControls.replaceChildren(element);
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
        this.#propertyBag.listSection[payload.gojuonKey].subComponentsSearchKeys[newItem.id] = {searchKey: newItem.searchKey, typeBitmask: newItem.typeBitmask}
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
        this.#propertyBag.listSection[toGroup].subComponents[id] = compponentToMove;
        this.#propertyBag.listSection[toGroup].subComponentsSearchKeys[id] = {searchKey: compponentToMove.searchKey, typeBitmask: compponentToMove.typeBitmask}
        this.#propertyBag.listSection[toGroup].subComponentsOrderKeys[id] = compponentToMove.kana;
        
        if (fromGroup != toGroup) {
            delete this.#propertyBag.listSection[fromGroup].subComponents[id];
            delete this.#propertyBag.listSection[fromGroup].subComponentsSearchKeys[id];
            delete this.#propertyBag.listSection[fromGroup].subComponentsOrderKeys[id];
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
     * @param {Number} typeFilterBitmask
     * @param {String} searchString
     * @param {String} searchType  
     * @returns
     */
    executeSearch(typeFilterBitmask, searchString, searchType) {
        Log.debug(`${this.constructor.name} Searching list`, "COMPONENT");

        if (!this.#searchService){
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        this.#searchService.purgeBacklog();
        this.#propertyBag.searchRequestId = crypto.randomUUID();

        for (let property in this.#propertyBag.listSection) {

            let searchIndex = this.#propertyBag.listSection[property];

            /** @type {CCLanguageItemListRequestResult} */
            let requestPayload = {
                searchRequestId: this.#propertyBag.searchRequestId,
                lookFor: {
                    typeFilterBitmask: typeFilterBitmask,
                    searchString: searchString,
                    searchType: searchType,
                },
                withinSection: property,
                searchSpace: searchIndex.subComponentsSearchKeys,
                result: {},
                matchedCount: -1,
                totalCount: searchIndex.length,
            }

            this.#searchService.request(requestPayload);
            Log.debug(`${this.constructor.name} request sent ${this.#searchService.availableWorkerCount} of ${this.#searchService.workerCount} workers available`, "COMPONENT");

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
     * @param {MessageEvent} event
     */
    applyResultsCallback(event) {
        Log.debug(`${this.constructor.name}, Applying ressults to section ${event.data.withinSection}`, "COMPONENT");

        // Ignore jobs returning outdated search results.
        if (event.data.searchRequestId != this.#propertyBag.searchRequestId) {
            return;
        }

        let section = event.data.withinSection
        let result = event.data.result

        if (event.data.matchedCount <= 0) {
            this.#elements.listSection[section].body.classList.add("Hide");
        }
        else {
            this.#elements.listSection[section].body.classList.remove("Hide");

            for (let key in result) {

                if (result[key]) {
                    this.#propertyBag.listSection[section].subComponents[key].show();
                }
                else {
                    this.#propertyBag.listSection[section].subComponents[key].hide();
                }
            }
        }
    }
}