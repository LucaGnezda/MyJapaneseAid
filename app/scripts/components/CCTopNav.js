/**
 * Custom component used for displaying and editing a word, phrase or sentence
 */
"use strict";

/**
 * Typedefs 
 * @typedef {{
 *      rootContainer: HTMLDivElement?,
 *      leftContent: HTMLDivElement?,
 *      leftSpacer: HTMLDivElement?,
 *      tabstrip: HTMLDivElement?,
 *      rightSpacer: HTMLDivElement?,
 *      rightContent: HTMLDivElement?,
 *      tabs: Object.<String, HTMLElement>,
 * }} CCTopNavElements
 * 
 * @typedef {{
 * }} CCTopNavPropertyBag
 * 
 * @typedef {{
 *      tabCallbacks: Object.<String, Function>,
 * }} CCTopNavAttachedCallbacks
 */

class CCTopNav extends CCBase {

    /**
     * Member attributes
     */

    /**
     * The elements that make up this component
     * @type {CCTopNavElements}
     */
    #elements = {
        rootContainer: null,
        leftContent: null,
        leftSpacer: null,
        tabstrip: null,
        rightSpacer: null,
        rightContent: null,
        tabs: {},
    }    

    /**
     * The state properties for this component
     * @type {CCTopNavPropertyBag}
     */
    #propertyBag = {
        
    }

    /**
     * Callbacks attached to this component
     * @type {CCTopNavAttachedCallbacks}
     */
    #attachedCallbacks = {
        tabCallbacks: {},
    }

    static #htmlRootTemplate = `
        <div class="CCTopNav Container" data-use="root-container">
            <div class="LeftEdgeContent Underline" data-use="content.left"></div>
            <div class="Spacer Underline" data-use="spacer.left"></div>
            <div class="Tabstrip" data-use="tabstrip"></div>
            <div class="Spacer Underline" data-use="spacer.right"></div>
            <div class="RightEdgeContent Underline" data-use="content.right"></div>
        </div>
    `;

    static #htmlTabTemplate = `
        <div class="Tab RomanXL PadLRXL PadTS PadBM Font400" data-use="tab"></div>
    `;

    static #htmlImageTabTemplate = `
        <div class="Tab PadLRXL PadTM PadBS" data-use="imagetab"></div>
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

        let fragment = getDOMFragmentFromString(CCTopNav.#htmlRootTemplate);

        this.#elements.leftContent = fragment.querySelector('[data-use="content.left"]');
        this.#elements.leftSpacer = fragment.querySelector('[data-use="spacer.left"]');
        this.#elements.tabstrip = fragment.querySelector('[data-use="tabstrip"]');
        this.#elements.rightSpacer = fragment.querySelector('[data-use="spacer.right"]');
        this.#elements.rightContent = fragment.querySelector('[data-use="content.right"]');

        if (useShadowDOM) {
            let shadow = this.attachShadow({ mode: "open" });
            shadow.appendChild(fragment);
        }
        else {
            this.appendChild(fragment);
        }
    }

    
    #initialiseBehaviour() {

        for (let property in this.#elements.tabs) {
            this.#elements.tabs[property].addEventListener("click", this.tabClickCallback.bind(this), this.getPreDisposeSignal());
        }

    }


    /**
     * Public methods
     */
    render() {

    }

    /**
     * @param {String} displayName 
     * @param {Function} onClickCallback
     * @returns
     */
    addTab(displayName, onClickCallback) {

        if (!this.#elements.tabstrip) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }
        
        let fragment = getDOMFragmentFromString(CCTopNav.#htmlTabTemplate);
        let tabIndex = "Tab" + Object.keys(this.#elements.tabs).length.toString();

        if (fragment.firstElementChild) {
            this.#elements.tabs[tabIndex] = fragment.firstElementChild;
            this.#elements.tabs[tabIndex].innerText = displayName;
            this.#elements.tabs[tabIndex].setAttribute("data-tabIndex", tabIndex);
            this.#elements.tabstrip.appendChild(fragment);

            this.#attachedCallbacks.tabCallbacks[tabIndex] = onClickCallback;
        }

    }

    /**
     * @param {String} imageSrc 
     * @param {Function} onClickCallback
     * @returns
     */
    addImageTab(imageSrc, onClickCallback) {

        if (!this.#elements.tabstrip) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }
        
        let fragment = getDOMFragmentFromString(CCTopNav.#htmlImageTabTemplate);
        let tabIndex = "Tab" + Object.keys(this.#elements.tabs).length.toString();

        if (fragment.firstElementChild) {
            let img = document.createElement("img");
            img.src = imageSrc;
            img.classList.add("SizeWH24");

            fragment.firstElementChild.appendChild(img);

            this.#elements.tabs[tabIndex] = fragment.firstElementChild;
            this.#elements.tabs[tabIndex].setAttribute("data-tabIndex", tabIndex);
            this.#elements.tabstrip.appendChild(fragment);

            this.#attachedCallbacks.tabCallbacks[tabIndex] = onClickCallback;
        }

    }

    /**
     * @param {HTMLElement | null} element 
     * @returns
     */
    setLeftContent(element) {
        if (!this.#elements.leftContent) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }
        
        if (element) {
            this.#elements.leftContent.replaceChildren(element);
        }
        else {
            this.#elements.leftContent.replaceChildren();
        }
    }

    /**
     * @param {HTMLElement} element 
     * @returns
     */
    setRightContent(element) {
        if (!this.#elements.rightContent) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        if (element) {
            this.#elements.rightContent.replaceChildren(element);
        }
        else {
            this.#elements.rightContent.replaceChildren();
        }
    }

    /**
     * @param {Boolean} left 
     * @param {Boolean} right 
     * @returns
     */
    setExpandableSpacing(left, right) {

        if (!this.#elements.leftSpacer || !this.#elements.rightSpacer) {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
            return;
        }

        if (left) {
            this.#elements.leftSpacer.classList.add("Expandable");
        }
        else {
            this.#elements.leftSpacer.classList.remove("Expandable");
        } 

        if (right) {
            this.#elements.rightSpacer.classList.add("Expandable");
        }
        else {
            this.#elements.rightSpacer.classList.remove("Expandable");
        } 
    }


    /**
     * @param {Number | String} index 
     * @param {Event} [originatingEvent]
     * @returns
     */
    selectIndex(index, originatingEvent) {

        let selectedIndex = "Tab0";

        if (typeof index == 'number') {
            selectedIndex = "Tab" + index.toString();
        }
        else if (typeof index == 'string') {
            selectedIndex = index;
        } 

        for (let property in this.#elements.tabs) {
            if (property == selectedIndex) {
                this.#elements.tabs[property].classList.add("Selected");
            }
            else {
                this.#elements.tabs[property].classList.remove("Selected");
            }
        }

        if (this.#attachedCallbacks.tabCallbacks[selectedIndex]) {
            let event = {};
            event.originatingEvent = originatingEvent;
            event.originatingObject = originatingEvent?.currentTarget;
            event.originatingComponent = this;
            event.originatingId = this.id;
            event.currentData = selectedIndex;

            this.#attachedCallbacks.tabCallbacks[selectedIndex](event);
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
     * @param {MouseEvent & {currentTarget: HTMLElement}} mouseEvent 
     * @returns
     */
    tabClickCallback(mouseEvent) {
        Log.debug(`${this.constructor.name} tab clicked`, "COMPONENT");

        if (!mouseEvent.currentTarget) {
            Log.debug(`${this.constructor.name} expected target, but none provided.`, "COMPONENT");
            return;
        }

        let selectedIndex = mouseEvent.currentTarget.getAttribute("data-tabindex");

        if (selectedIndex) {
            this.selectIndex(selectedIndex, mouseEvent);
        }
    }
}