/**
 * Custom component used for displaying and editing a word, phrase or sentence
 */
"use strict";

/**
 * Typedefs 
 * @typedef {{
 *      rootContainer: HTMLDivElement?,
 *      groups: Array<HTMLElement>,
 *      buttons: Array<Array<HTMLElement>>,
 * }} CCButtonStripElements
 * 
 * @typedef {{
 *      groupBehaviour: CCButtonStripGroupBehaviour[],
 * }} CCButtonStripPropertyBag
 * 
 * @typedef {{
 *      buttonCallbacks: Array<Array<Function?>>,
 * }} CCButtonStripAttachedCallbacks
 */


/**
 * Options for ButtonStripGroupBehaviour
 * @enum {Number}
 * @readonly
 * @property {Number} StatelessIndividual
 * @property {Number} SelectableIndividual
 * @property {Number} StatelessGroup
 * @property {Number} SingleSelectGroup
 * @property {Number} MultiSelectGroup
 * @property {Number} Spacer
 * @property {Number} Custom
 */
const CCButtonStripGroupBehaviour = {
    StatelessIndividual: 1, 
    SelectableIndividual: 2, 
    StatelessGroup: 4,
    SingleSelectGroup: 8,
    MultiSelectGroup:  16,
    Spacer: 32,
    Custom: 64,
};

/**
 * Options for ButtonStripBehaviour
 * @enum {Number}
 * @readonly
 * @property {Number} Excluded
 * @property {Number} Alone
 * @property {Number} Above
 * @property {Number} Left
 * @property {Number} Below
 * @property {Number} Right
 */
const CCButtonStripImagePosition = {
    Above: 1, 
    Left: 2, 
    Below: 4,
    Right:  8,
};

class CCButtonStrip extends CCBase {

    /**
     * Member attributes
     */

    /**
     * The elements that make up this component
     * @type {CCButtonStripElements}
     */
    #elements = {
        rootContainer: null,
        groups: [],
        buttons: [],
    }    

    /**
     * The state properties for this component
     * @type {CCButtonStripPropertyBag}
     */
    #propertyBag = {
        groupBehaviour: [],
    }

    /**
     * Callbacks attached to this component
     * @type {CCButtonStripAttachedCallbacks}
     */
    #attachedCallbacks = {
        buttonCallbacks: [],
    }

    static #htmlRootTemplate = `
        <div class="CCButtonStrip Container" data-use="root-container">
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

        let fragment = getDOMFragmentFromString(CCButtonStrip.#htmlRootTemplate);

        this.#elements.rootContainer = fragment.querySelector('[data-use="root-container"]');

        if (useShadowDOM) {
            let shadow = this.attachShadow({ mode: "open" });
            shadow.appendChild(fragment);
        }
        else {
            this.appendChild(fragment);
        }
    }

    
    #initialiseBehaviour() {

        for (let [index, group] of this.#elements.buttons.entries()) {
            if (this.#propertyBag.groupBehaviour[index] != CCButtonStripGroupBehaviour.Spacer && this.#propertyBag.groupBehaviour[index] != CCButtonStripGroupBehaviour.Custom) {
                for (let button of group) {
                    /** @ts-ignore */
                    button.addEventListener("click", this.buttonClickCallback.bind(this), this.getPreDisposeSignal());
                }
            }
        }

    }

    /**
     * @returns {Number}
     */
    #checkSetCurrentGroup() {

        // If we don't have any groups yet, assume we're adding a stateless button and initialise one
        if (this.#propertyBag.groupBehaviour.length == 0) {
            this.newButtonGroup(CCButtonStripGroupBehaviour.StatelessIndividual);
        }

        let currentGroup = this.#propertyBag.groupBehaviour.length - 1;
        let currentBehaviour = this.#propertyBag.groupBehaviour[currentGroup];

        // If the current group is a spacer, assume we're adding a stateless button and initialise one
        if (currentBehaviour == CCButtonStripGroupBehaviour.Spacer) {
            this.newButtonGroup(CCButtonStripGroupBehaviour.StatelessIndividual);
            currentGroup += 1;
        }

        // If the current group is full, assume we're adding a stateless button and initialise one
        if (this.#elements.buttons[currentGroup].length == 1 && (currentBehaviour == CCButtonStripGroupBehaviour.StatelessIndividual || currentBehaviour == CCButtonStripGroupBehaviour.SelectableIndividual)) {
            this.newButtonGroup(CCButtonStripGroupBehaviour.StatelessIndividual);
            currentGroup += 1;
        }

        return currentGroup;
    }

    /** 
     * @param {HTMLElement} element
     * @param {String} attribute
     * @returns {Number | Null}  
     */
    #getIndex(element, attribute) {
        let str = element.getAttribute(attribute);
        let index = null;
        if (str) {
            index = Number.parseInt(str, 10);
        }
        if (isInt(index)) {
            return index;
        }
        else {
            return null;
        }
    }

    /** 
     * @param {Number | Null} groupIndex
     * @param {Number | Null} buttonIndex
     * @returns {Boolean | Null}  
     */
    #setAndGetSelectionState(groupIndex, buttonIndex) {
        
        if (groupIndex == null || buttonIndex == null || this.#propertyBag.groupBehaviour[groupIndex] == null || !(this.#elements.buttons[groupIndex][buttonIndex] instanceof HTMLElement)) {
            // if invalid indexes return null
            return null;
        }
        else if (this.#propertyBag.groupBehaviour[groupIndex] == CCButtonStripGroupBehaviour.StatelessIndividual || 
            this.#propertyBag.groupBehaviour[groupIndex] == CCButtonStripGroupBehaviour.StatelessGroup || 
            this.#propertyBag.groupBehaviour[groupIndex] == CCButtonStripGroupBehaviour.Custom || 
            this.#propertyBag.groupBehaviour[groupIndex] == CCButtonStripGroupBehaviour.Spacer) {
            
            // these types don't have a selection State
            return null;
        }
        else {
            // If currently selected
            if (this.#elements.buttons[groupIndex][buttonIndex].classList.contains("Selected")) {

                // if a Single select group, can't unselect all so do nothing
                if (this.#propertyBag.groupBehaviour[groupIndex] == CCButtonStripGroupBehaviour.SingleSelectGroup) {

                    // remove other selections
                    for (let button of this.#elements.buttons[groupIndex]) {
                        button.classList.remove("Selected");
                        button.classList.add("Deselected");
                    }

                    // Select
                    this.#elements.buttons[groupIndex][buttonIndex].classList.add("Selected");
                    this.#elements.buttons[groupIndex][buttonIndex].classList.remove("Deselected");
                    return true;
                }

                // If individual or multi select group we can deselect
                else {
                    this.#elements.buttons[groupIndex][buttonIndex].classList.remove("Selected");
                    this.#elements.buttons[groupIndex][buttonIndex].classList.add("Deselected");
                    return false;
                }
            }

            // if not currently selected
            else {

                // if a Single select group, we need to deselect all other options
                if (this.#propertyBag.groupBehaviour[groupIndex] == CCButtonStripGroupBehaviour.SingleSelectGroup) {
                    for (let button of this.#elements.buttons[groupIndex]) {
                        button.classList.remove("Selected");
                        button.classList.add("Deselected");
                    }
                }

                // Select
                this.#elements.buttons[groupIndex][buttonIndex].classList.add("Selected");
                this.#elements.buttons[groupIndex][buttonIndex].classList.remove("Deselected");

                return true;
            }
        }
    }

    /** 
     * @param {Number | Null} groupIndex
     * @returns {Array<Boolean> | Null}  
     */
    #getAllSelectionStates(groupIndex){

        if (groupIndex == null || this.#propertyBag.groupBehaviour[groupIndex] == null) {
            // if invalid indexes return null
            return null;
        }

        let result = new Array(length);

        for (let i = 0; i < this.#elements.buttons[groupIndex].length; i++) {
            if (this.#elements.buttons[groupIndex][i].classList.contains("Selected")) {
                result[i] = true;
            }
            else {
                result[i] = false;
            }
        }

        return result;

    }

    /** 
     * @param {Number | Null} groupIndex
     * @returns {Array<Number>}  
     */
    #getSelectedIndexes(groupIndex){

        if (groupIndex == null || this.#propertyBag.groupBehaviour[groupIndex] == null) {
            // if invalid indexes return null
            return [];
        }

        let result = new Array();

        for (let i = 0; i < this.#elements.buttons[groupIndex].length; i++) {
            if (this.#elements.buttons[groupIndex][i].classList.contains("Selected")) {
                result.push(i);
            }
        }

        return result;

    }

    /** 
     * @param {Number | Null} groupIndex
     * @returns {Number | Null}  
     */
    #getSelectedBitmask(groupIndex){

        if (groupIndex == null || this.#propertyBag.groupBehaviour[groupIndex] == null) {
            // if invalid indexes return null
            return null;
        }

        let result = 0;

        for (let i = 0; i < this.#elements.buttons[groupIndex].length; i++) {
            if (this.#elements.buttons[groupIndex][i].classList.contains("Selected")) {
                result += 1 << i;
            }
        }

        return result;

    }

    /** 
     * @param {Number | Null} groupIndex
     * @param {Number | Null} buttonIndex
     * @returns {Function | Null}  
     */
    #getCallback(groupIndex, buttonIndex) {
        if (groupIndex == null || buttonIndex == null || !(this.#attachedCallbacks.buttonCallbacks[groupIndex][buttonIndex] instanceof Function)) {
            // if invalid indexes return null
            return null;
        }
        else {
            return this.#attachedCallbacks.buttonCallbacks[groupIndex][buttonIndex];
        }
    }


    /**
     * Public methods
     */
    render() {

    }

    hide() {
        this.#elements.rootContainer?.classList.add("Hide");
        this.#elements.rootContainer?.classList.remove("Show");
    }

    show() {
        this.#elements.rootContainer?.classList.remove("Hide");
        this.#elements.rootContainer?.classList.add("Show");
    }

    setVerticalLayout() {
        this.#elements.rootContainer?.classList.add("Vertical");
    }

    setHorizontalLayout() {
        this.#elements.rootContainer?.classList.add("Horizontal");
    }

    /**
     * @param {CCButtonStripGroupBehaviour} groupBehaviour 
     * @returns
     */
    newButtonGroup(groupBehaviour) {

        if (!this.#elements.rootContainer) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        let nextGroup = this.#elements.groups.length;
        let group = document.createElement("div");
        group.classList.add("Group");

        if (groupBehaviour == CCButtonStripGroupBehaviour.Custom) {
            group.classList.add("Custom");
        }

        group.setAttribute("data-group.index", nextGroup.toString());

        this.#elements.rootContainer.appendChild(group);

        this.#propertyBag.groupBehaviour.push(groupBehaviour);
        this.#elements.buttons.push([]);
        this.#elements.groups.push(group);
        this.#attachedCallbacks.buttonCallbacks.push([]);
    }

    /**
     * @param {String} src 
     * @param {Function | null} [onClickCallback]
     * @param {Boolean} [initialState]
     * @param {String | Null} [customClass]
     * @returns
     */
    addImageButton(src, onClickCallback = null, initialState = false, customClass = null) {

        if (!this.#elements.rootContainer) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        let currentGroup = this.#checkSetCurrentGroup();
        let currentButton = this.#elements.buttons[currentGroup].length;

        let button = document.createElement("div");
        button.classList.add("Button");
        if (customClass) {
            button.classList.add(customClass); 
        }
        button.classList.add("PadM");
        if (this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.SelectableIndividual ||
            this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.SingleSelectGroup ||
            this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.MultiSelectGroup) {
            if (initialState) {
                button.classList.add("Selected"); 
            } 
            else {
                button.classList.add("Deselected")
            } 
        }
        button.setAttribute("data-group.index", currentGroup.toString());
        button.setAttribute("data-button.index", currentButton.toString());
        button.setAttribute("data-button.displayname", src);
        let img = document.createElement("img");
        img.src = src;

        button.appendChild(img);
        this.#elements.groups[currentGroup].appendChild(button);

        this.#elements.buttons[currentGroup].push(button);
        this.#attachedCallbacks.buttonCallbacks[currentGroup].push(onClickCallback);

    }

    /**
     * @param {String} text 
     * @param {Function | null} [onClickCallback]
     * @param {Boolean} [initialState]
     * @param {String | Null} [customClass]
     * @returns
     */
    addTextButton(text, onClickCallback = null, initialState = false, customClass = null) {

        if (!this.#elements.rootContainer) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        let currentGroup = this.#checkSetCurrentGroup();
        let currentButton = this.#elements.buttons[currentGroup].length;

        let button = document.createElement("div");
        button.classList.add("Button");
        if (customClass) {
            button.classList.add(customClass); 
        }
        button.classList.add("RomanM");
        button.classList.add("NoBlockMargins");
        button.classList.add("Font400");
        button.classList.add("PadTBM");
        button.classList.add("PadLRL");
        if (this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.SelectableIndividual ||
            this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.SingleSelectGroup ||
            this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.MultiSelectGroup) {
            if (initialState) {
                button.classList.add("Selected"); 
            } 
            else {
                button.classList.add("Deselected")
            } 
        }
        button.setAttribute("data-group.index", currentGroup.toString());
        button.setAttribute("data-button.index", currentButton.toString());
        button.setAttribute("data-button.displayname", text);
        let span = document.createElement("span");
        span.innerText = text;

        button.appendChild(span);
        this.#elements.groups[currentGroup].appendChild(button);

        this.#elements.buttons[currentGroup].push(button);
        this.#attachedCallbacks.buttonCallbacks[currentGroup].push(onClickCallback);
        
    }

    /**
     * @param {String} text 
     * @param {String} src 
     * @param {CCButtonStripImagePosition} imagePos 
     * @param {Function | null} [onClickCallback]
     * @param {Boolean} [initialState]
     * @param {String | Null} [customClass]
     * @returns
     */
    addTextWithImageButton(text, src, imagePos, onClickCallback = null, initialState = false, customClass = null) {

        if (!this.#elements.rootContainer) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        let currentGroup = this.#checkSetCurrentGroup();
        let currentButton = this.#elements.buttons[currentGroup].length;

        let button = document.createElement("div");
        button.classList.add("Button");
        if (customClass) {
            button.classList.add(customClass); 
        }
        button.classList.add("RomanM");
        button.classList.add("NoBlockMargins");
        button.classList.add("Font400");
        button.classList.add("PadM");
        if (this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.SelectableIndividual ||
            this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.SingleSelectGroup ||
            this.#propertyBag.groupBehaviour[currentGroup] == CCButtonStripGroupBehaviour.MultiSelectGroup) {
            if (initialState) {
                button.classList.add("Selected"); 
            } 
            else {
                button.classList.add("Deselected")
            } 
        }
        button.setAttribute("data-group.index", currentGroup.toString());
        button.setAttribute("data-button.index", currentButton.toString());
        button.setAttribute("data-button.displayname", text);
        let span = document.createElement("span");
        span.innerText = text;
        let img = document.createElement("img");
        img.src = src;

        switch (imagePos) {
            case CCButtonStripImagePosition.Above:
                button.classList.add("ColumnContents");
                button.appendChild(img);
                button.appendChild(span);
                break;
            
            case CCButtonStripImagePosition.Below:
                button.classList.add("ColumnContents");
                button.appendChild(span);
                button.appendChild(img);
                break;

            case CCButtonStripImagePosition.Left:
                button.classList.add("RowContents");
                button.appendChild(img);
                button.appendChild(span);
                break;

            case CCButtonStripImagePosition.Right:
                button.classList.add("RowContents");
                button.appendChild(span);
                button.appendChild(img);
                break;

            default:
                Log.error("Invalid imagePos, unable to add", "COMPONENT");
                return;
        }
        
        //button.appendChild(img);
        this.#elements.groups[currentGroup].appendChild(button);

        this.#elements.buttons[currentGroup].push(button);
        this.#attachedCallbacks.buttonCallbacks[currentGroup].push(onClickCallback);
    }

    addSpacer() {

        if (!this.#elements.rootContainer) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        this.newButtonGroup(CCButtonStripGroupBehaviour.Spacer);

        let currentGroup = this.#propertyBag.groupBehaviour.length - 1;

        let spacer = document.createElement("div");
        spacer.classList.add("Spacer");
        spacer.setAttribute("data-button-group.index", currentGroup.toString());
        spacer.setAttribute("data-button.index", "0");
        let img = document.createElement("img");
        img.src = "./app/assets/svg/minus.svg";

        spacer.appendChild(img);
        this.#elements.groups[currentGroup].appendChild(spacer);

        this.#elements.buttons[currentGroup].push(spacer);
        this.#attachedCallbacks.buttonCallbacks[currentGroup].push(null);
    }

    /**
     * @param {HTMLElement} element 
     * @returns
     */
    addCustomComponent(element) {

        if (!this.#elements.rootContainer) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        this.newButtonGroup(CCButtonStripGroupBehaviour.Custom);

        let currentGroup = this.#propertyBag.groupBehaviour.length - 1;

        this.#elements.groups[currentGroup].appendChild(element);

        this.#elements.buttons[currentGroup].push(element);
        this.#attachedCallbacks.buttonCallbacks[currentGroup].push(null);

    }

    /** 
     * @param {Number | Null} groupIndex
     * @returns {Array<Boolean> | Null}  
     */
    getSelectionStatesForGroup(groupIndex) {
        return this.#getAllSelectionStates(groupIndex);
    }

    /** 
     * @param {Number | Null} groupIndex
     * @returns {Number | Null}  
     */
    getSelectedIndexForGroup(groupIndex) {
        let result = this.#getSelectedIndexes(groupIndex);
        return result[0];
    }

    /** 
     * @param {Number | Null} groupIndex
     * @returns {Number | Null}  
     */
    getSelectionBitmaskForGroup(groupIndex) {
        return this.#getSelectedBitmask(groupIndex);
    }

    /** 
     * @param {Number | Null} groupIndex
     * @param {Number | Null} selectedButton
     * @returns 
     */
    setSelectedIndexForGroup(groupIndex, selectedButton) {
        this.#setAndGetSelectionState(groupIndex, selectedButton);
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
     * @param {MouseEvent & {currentTarget: HTMLElement}} mouseEvent 
     * @returns
     */
    buttonClickCallback(mouseEvent) {
        Log.debug(`${this.constructor.name} tab clicked`, "COMPONENT");

        if (!mouseEvent.currentTarget) {
            Log.debug(`${this.constructor.name} expected target, but none provided.`, "COMPONENT");
            return;
        }

        let groupIndex = this.#getIndex(mouseEvent.currentTarget, "data-group.index");
        let buttonIndex = this.#getIndex(mouseEvent.currentTarget, "data-button.index");
        let buttonDisplayName = mouseEvent.currentTarget.getAttribute("data-button.displayname");
        let buttonSelectionState = this.#setAndGetSelectionState(groupIndex, buttonIndex);
        let groupSelectionState = this.#getAllSelectionStates(groupIndex);
        let groupSelectionBitmask = this.#getSelectedBitmask(groupIndex);
        let callback = this.#getCallback(groupIndex, buttonIndex);

        if (callback) {

            let event = {
                originatingEvent: mouseEvent,
                originatingObject: this,
                groupIndex: groupIndex,
                buttonIndex: buttonIndex,
                displayName: buttonDisplayName,
                selectionState: buttonSelectionState,
                groupSelectionStates: groupSelectionState,
                groupSelectionBitmask: groupSelectionBitmask,
            };

            /** @ts-ignore */
            callback(event);
        }


    }
}