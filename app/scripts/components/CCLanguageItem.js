/**
 * Custom component used for displaying and editing a word, phrase or sentence
 */
"use strict";

/**
 * Typedefs
 * @typedef {{
 *      rootContainer: HTMLDivElement?,
 *      fieldset: HTMLFieldSetElement?, 
 *      kanaInput: HTMLInputElement?,
 *      kanaHighlighterInput: HTMLInputElement?, 
 *      kanaOutput: HTMLDivElement?, 
 *      romajiInput: HTMLInputElement?,
 *      romajiHighlighterInput: HTMLInputElement?,
 *      romajiOutput: HTMLDivElement?, 
 *      translationGrid: HTMLDivElement?,
 *      meaningInput: HTMLInputElement?,
 *      meaningHighlighterInput: HTMLInputElement?,  
 *      meaningOutput: HTMLDivElement?,
 *      literalInput: HTMLInputElement?,
 *      structureInput: HTMLInputElement?,
 *      notesInput: HTMLInputElement?,
 *      meaningGridCell1: HTMLDivElement?,
 *      meaningGridCell2: HTMLDivElement?,
 *      literalGridCell1: HTMLDivElement?,
 *      literalGridCell2: HTMLDivElement?,
 *      structureGridCell1: HTMLDivElement?,
 *      structureGridCell2: HTMLDivElement?,
 *      notesGridCell1: HTMLDivElement?, 
 *      notesGridCell2: HTMLDivElement?,
 *      editSaveButton: HTMLDivElement?,
 *      editCancelButton: HTMLDivElement?,
 *      editButton: HTMLDivElement?,
 *      deleteButton: HTMLDivElement?,
 *      examplesHeader: HTMLDivElement?,
 *      examplesTitle: HTMLDivElement?,
 *      examplesExpander: HTMLDivElement?,
 *      examplesAdd: HTMLDivElement?,
 *      examplesContainer: HTMLDivElement?
 * }} CCLanguageItemElements
 * 
 * @typedef {{
 *      kana: string?,
 *      kanaHighlighterString: string?,
 *      romaji: string?,
 *      romajiHighlighterString: string?,
 *      meaning: string?,
 *      meaningHighlighterString: string?,
 *      literal: string?,
 *      structure: string?,
 *      notes: string?,
 *      examples: CCLanguageItemPropertyBagExample[];
 * }} CCLanguageItemPropertyBag
 * 
 * @typedef {{
 *      kana: string?,
 *      romaji: string?,
 *      meaning: string?
 * }} CCLanguageItemPropertyBagExample
 * 
 * @typedef {{
 *      deleteRequestCallback: Function?,
 *      dataUpdateCallback: Function?
 * }} CCLanguageItemAttachedCallbacks
 */

class CCLanguageItem extends CCBase {

    /**
     * Member attributes
     */

    /**
     * The elements that make up this component
     * @type {CCLanguageItemElements}
     */
    #elements = {
        rootContainer: null,
        fieldset: null,
        kanaInput: null,
        kanaHighlighterInput: null,
        kanaOutput: null,
        romajiInput: null,
        romajiHighlighterInput: null,
        romajiOutput: null,
        translationGrid: null,
        meaningInput: null,
        meaningHighlighterInput: null,
        meaningOutput: null,
        literalInput: null,
        structureInput: null,
        notesInput: null,
        meaningGridCell1: null,
        meaningGridCell2: null,
        literalGridCell1: null,
        literalGridCell2: null,
        structureGridCell1: null,
        structureGridCell2: null,
        notesGridCell1: null,
        notesGridCell2: null,
        editSaveButton: null,
        editCancelButton: null,
        editButton: null,
        deleteButton: null,
        examplesHeader: null,
        examplesTitle: null,
        examplesExpander: null,
        examplesAdd: null,
        examplesContainer: null
    }    

    /**
     * The elements that make up this component
     * @type {CCLanguageItemPropertyBag}
     */
    #propertyBag = {
        kana: null,
        kanaHighlighterString: null,
        romaji: null,
        romajiHighlighterString: null,
        meaning: null,
        meaningHighlighterString: null,
        literal: null,
        structure: null,
        notes: null,
        examples: []
    }

    /**
     * The elements that make up this component
     * @type {CCLanguageItemAttachedCallbacks}
     */
    #attachedCallbacks = {
        deleteRequestCallback: null,
        dataUpdateCallback: null
    }

    static #htmlRootTemplate = `
        <div class="CCLanguageItem Container PadTBL PadLRXL" data-use="root-container">
            <form>
                <fieldset class="Fieldset" data-use="fieldset">
                    <div class="FlexLayout Col">
                        <label class="CCLanguageItemInputLabel RomanXS">Kana</label>
                        <input class="CCLanguageItemInput KanaXL NoBlockMargins HideOnRead" data-use="kana.input"></input>
                        <p class="CCLanguageItemOutput KanaXL NoBlockMargins" data-use="kana.output"></p>
                        <div class="FlexLayout Row JustifyEnd">
                            <label class="CCLanguageItemInputLabel RomanXS">Linked Highlighting</label>
                            <input class="CCLanguageItemInput RomanXS NoBlockMargins LinkedHighlighter" data-use="kana.highlighter-input"></input>
                        </div>
                    </div>
                    <div class="FlexLayout Col">
                        <label class="CCLanguageItemInputLabel RomanXS">Romaji</label>              
                        <input class="CCLanguageItemInput RomanXL NoBlockMargins HideOnRead" data-use="romaji.input"></input>                    
                        <p class="CCLanguageItemOutput RomanXL NoBlockMargins" data-use="romaji.output"></p>
                        <div class="FlexLayout Row JustifyEnd">
                            <label class="CCLanguageItemInputLabel RomanXS">Linked Highlighting</label>
                            <input class="CCLanguageItemInput RomanXS NoBlockMargins LinkedHighlighter" data-use="romaji.highlighter-input"></input>
                        </div>  
                    </div>
                    <div class="FormGrid PadLL MarginTBM" data-use="translation-grid">
                        <div class="CCLanguageItemLabel" data-use="meaning.grid-cell-1"><p class="RomanM NoBlockMargins">Meaning:</p></div>
                        <div class="FlexLayout Col" data-use="meaning.grid-cell-2">
                            <input class="CCLanguageItemInput RomanM NoBlockMargins Font300 HideOnRead" data-use="meaning.input"></input>
                            <p class="CCLanguageItemOutput RomanM Font300 NoBlockMargins" data-use="meaning.output"></p>
                            <div class="FlexLayout Row JustifyEnd">
                                <label class="CCLanguageItemInputLabel RomanXS">Linked Highlighting</label>
                                <input class="CCLanguageItemInput RomanXS NoBlockMargins Font300 LinkedHighlighter" data-use="meaning.highlighter-input"></input>
                            </div>
                        </div>
                        <div class="CCLanguageItemLabel" data-use="literal.grid-cell-1"><p class="RomanM NoBlockMargins">Literal:</p></div>
                        <div class="FlexLayout Col" data-use="literal.grid-cell-2"><input class="CCLanguageItemInput RomanM NoBlockMargins Font300" data-use="literal.input"></input></div>
                        <div class="CCLanguageItemLabel"  data-use="structure.grid-cell-1"><p class="RomanM NoBlockMargins">Structure:</p></div>
                        <div class="FlexLayout Col" data-use="structure.grid-cell-2"><input class="CCLanguageItemInput RomanM NoBlockMargins Font300" data-use="structure.input"></input></div>
                        <div class="CCLanguageItemLabel" data-use="notes.grid-cell-1"><p class="RomanM NoBlockMargins">Notes:</p></div>
                        <div class="FlexLayout Col" data-use="notes.grid-cell-2"><input class="CCLanguageItemInput RomanM NoBlockMargins Font300" data-use="notes.input"></input></div>
                    </div>
                    <div class="CCLanguageItemExamplesSectionBreak MarginTXL MarginBS">
                        <div class="CCLanguageItemExamplesHeader" data-use="examples-header">
                            <div class="CCLanguageItemExamplesTitle MarginRM" data-use="examples-header.title"><p class="RomanM NoBlockMargins">Examples</p></div>
                            <div class="CCLanguageItemSectionButton Show" data-use="examples-header.expander"><img src="./app/assets/svg/arrow-down.svg" class="CCLanguageItemExpandCollapseIcon"></div>
                            <div class="CCLanguageItemSectionButton Show" data-use="examples-header.add"><img src="./app/assets/svg/plus.svg" class="CCLanguageItemExpandCollapseIcon"></div>
                        </div>
                    </div>
                    <div class="CCLanguageItemExamples" data-use="examples-container">
                    </div>
                    <div class="FormButtonStrip Col ShowOnRead">
                        <div class="FormButton ShowOnContainerHover BlackTint" data-use="edit-button">
                            <img src="./app/assets/svg/pencil.svg" class="FormButtonIcon">
                        </div>
                        <div class="Spacer Vertical ShowOnContainerHover">
                            <img src="./app/assets/svg/minus.svg" class="FormButtonIcon">
                        </div>
                        <div class="FormButton ShowOnContainerHover RedTint" data-use="delete-button">
                            <img src="./app/assets/svg/trash.svg" class="FormButtonIcon">
                        </div>
                    </div>
                    <div class="FormButtonStrip Row ShowOnEdit">
                        <div class="FormButton BlackTint" data-use="saveedit-button">
                            <img src="./app/assets/svg/check.svg" class="FormButtonIcon">
                        </div>
                        <div class="FormButton BlackTint" data-use="canceledit-button">
                            <img src="./app/assets/svg/cross.svg" class="FormButtonIcon">
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
    `;

    static #htmlExampleTemplate = `
                        <div class="CCLanguageItemExample MarginBM PadLXL" data-use="example">
                            <div class="CCLanguageItemExampleInputs PadRXL">
                                <div class="FlexLayout Col">
                                    <label class="CCLanguageItemInputLabel RomanXS">Kana</label>
                                    <input class="CCLanguageItemInput KanaS NoBlockMargins" data-use="example.kana.input" data-as="kana"></input>
                                </div>
                                <div class="FlexLayout Col">
                                    <label class="CCLanguageItemInputLabel RomanXS">Romaji</label>
                                    <input class="CCLanguageItemInput RomanS NoBlockMargins" data-use="example.romaji.input" data-as="romaji"></input>
                                </div>
                                <div class="FlexLayout Col">
                                    <label class="CCLanguageItemInputLabel RomanXS">Meaning</label>
                                    <input class="CCLanguageItemInput RomanS NoBlockMargins" data-use="example.meaning.input" data-as="meaning"></input>
                                </div>
                            </div>
                            <div class="CCLanguageItemExampleControls">
                                <div class="FormButton ShadowRed StrengthenOnExampleHover" data-use="example.delete-button">
                                    <img src="./app/assets/svg/trash.svg" class="CCLanguageItemFormButtonIcon">
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

        let fragment = getDOMFragmentFromString(CCLanguageItem.#htmlRootTemplate);

        this.#elements.rootContainer = fragment.querySelector('[data-use="root-container"]');
        this.#elements.fieldset = fragment.querySelector('[data-use="fieldset"]');
        this.#elements.kanaInput = fragment.querySelector('[data-use="kana.input"]');
        this.#elements.kanaHighlighterInput = fragment.querySelector('[data-use="kana.highlighter-input"]');
        this.#elements.kanaOutput = fragment.querySelector('[data-use="kana.output"]');
        this.#elements.romajiInput = fragment.querySelector('[data-use="romaji.input"]');
        this.#elements.romajiHighlighterInput = fragment.querySelector('[data-use="romaji.highlighter-input"]');
        this.#elements.romajiOutput = fragment.querySelector('[data-use="romaji.output"]');
        this.#elements.translationGrid = fragment.querySelector('[data-use="translation-grid"]');
        this.#elements.meaningInput = fragment.querySelector('[data-use="meaning.input"]');
        this.#elements.meaningHighlighterInput = fragment.querySelector('[data-use="meaning.highlighter-input"]');
        this.#elements.meaningOutput = fragment.querySelector('[data-use="meaning.output"]');
        this.#elements.literalInput = fragment.querySelector('[data-use="literal.input"]');
        this.#elements.structureInput = fragment.querySelector('[data-use="structure.input"]');
        this.#elements.notesInput = fragment.querySelector('[data-use="notes.input"]');
        this.#elements.meaningGridCell1 = fragment.querySelector('[data-use="meaning.grid-cell-1"]');
        this.#elements.meaningGridCell2 = fragment.querySelector('[data-use="meaning.grid-cell-2"]');
        this.#elements.literalGridCell1 = fragment.querySelector('[data-use="literal.grid-cell-1"]');
        this.#elements.literalGridCell2 = fragment.querySelector('[data-use="literal.grid-cell-2"]');
        this.#elements.structureGridCell1 = fragment.querySelector('[data-use="structure.grid-cell-1"]');
        this.#elements.structureGridCell2 = fragment.querySelector('[data-use="structure.grid-cell-2"]');
        this.#elements.notesGridCell1 = fragment.querySelector('[data-use="notes.grid-cell-1"]');
        this.#elements.notesGridCell2 = fragment.querySelector('[data-use="notes.grid-cell-2"]');
        this.#elements.editSaveButton = fragment.querySelector('[data-use="saveedit-button"]');
        this.#elements.editCancelButton = fragment.querySelector('[data-use="canceledit-button"]');
        this.#elements.editButton = fragment.querySelector('[data-use="edit-button"]');
        this.#elements.deleteButton = fragment.querySelector('[data-use="delete-button"]');
        this.#elements.examplesHeader = fragment.querySelector('[data-use="examples-header"]');
        this.#elements.examplesTitle = fragment.querySelector('[data-use="examples-header.title"]');
        this.#elements.examplesExpander = fragment.querySelector('[data-use="examples-header.expander"]');
        this.#elements.examplesAdd = fragment.querySelector('[data-use="examples-header.add"]');
        this.#elements.examplesContainer = fragment.querySelector('[data-use="examples-container"]');

        this.appendChild(fragment);
    }

    #initialiseElements() {
        
        if (this.#elements.kanaInput && this.#elements.kanaHighlighterInput && this.#elements.kanaOutput && 
            this.#elements.romajiInput && this.#elements.romajiHighlighterInput && this.#elements.romajiOutput && 
            this.#elements.meaningInput && this.#elements.meaningHighlighterInput && this.#elements.meaningOutput &&
            this.#elements.editSaveButton && this.#elements.editCancelButton && this.#elements.editButton && this.#elements.deleteButton &&
            this.#elements.examplesTitle && this.#elements.examplesExpander && this.#elements.examplesAdd && this.#elements.examplesContainer) {
            
            this.#elements.kanaOutput.addEventListener("mousemove", this.textHoverCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.kanaOutput.addEventListener("mouseout", this.textDehoverCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.romajiOutput.addEventListener("mousemove", this.textHoverCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.romajiOutput.addEventListener("mouseout", this.textDehoverCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.meaningOutput.addEventListener("mousemove", this.textHoverCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.meaningOutput.addEventListener("mouseout", this.textDehoverCallback.bind(this), this.getPreDisposeSignal());
            
            this.#elements.kanaHighlighterInput.addEventListener("input", this.validateHighlighterCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.kanaHighlighterInput.addEventListener("blur", this.validateHighlighterCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.romajiInput.addEventListener("input", this.validateRomajiCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.romajiInput.addEventListener("blur", this.validateRomajiCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.romajiHighlighterInput.addEventListener("input", this.validateHighlighterCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.romajiHighlighterInput.addEventListener("blur", this.validateHighlighterCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.meaningHighlighterInput.addEventListener("input", this.validateHighlighterCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.meaningHighlighterInput.addEventListener("blur", this.validateHighlighterCallback.bind(this), this.getPreDisposeSignal());
            
            this.#elements.editSaveButton.addEventListener("click", this.saveCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.editCancelButton.addEventListener("click", this.cancelCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.editButton.addEventListener("click", this.editCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.deleteButton.addEventListener("click", this.deleteRequestCallback.bind(this), this.getPreDisposeSignal());

            this.#elements.examplesTitle.addEventListener("click", this.examplesExpanderCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.examplesExpander.addEventListener("click", this.examplesExpanderCallback.bind(this), this.getPreDisposeSignal());
            this.#elements.examplesAdd.addEventListener("click", this.examplesAddCallback.bind(this), this.getPreDisposeSignal());

            this.#elements.examplesContainer.addEventListener("click", this.exampleClickCallback.bind(this), this.getPreDisposeSignal());

            this.#elements.romajiInput.setAttribute("data-isvalid", "data-isvalid");
            this.#elements.kanaHighlighterInput.setAttribute("data-isvalid", "data-isvalid");
            this.#elements.romajiHighlighterInput.setAttribute("data-isvalid", "data-isvalid");
            this.#elements.meaningHighlighterInput.setAttribute("data-isvalid", "data-isvalid");

            this.#setUIForRead();
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    #setUIForRead() {
        if (this.#elements.fieldset && this.#elements.translationGrid &&
            this.#elements.meaningInput && this.#elements.literalInput && 
            this.#elements.structureInput && this.#elements.notesInput &&
            this.#elements.meaningGridCell1 && this.#elements.meaningGridCell2 &&
            this.#elements.literalGridCell1 && this.#elements.literalGridCell2 &&
            this.#elements.structureGridCell1 && this.#elements.structureGridCell2 &&
            this.#elements.notesGridCell1 && this.#elements.notesGridCell2 &&
            this.#elements.examplesHeader && this.#elements.examplesExpander && 
            this.#elements.examplesAdd && this.#elements.examplesContainer) {

            // Update CSS
            this.#elements.fieldset.setAttribute("disabled", "disabled");

            if (this.#elements.meaningInput.value.trim().length == 0 && 
                this.#elements.literalInput.value.trim().length == 0 &&
                this.#elements.structureInput.value.trim().length == 0 &&
                this.#elements.notesInput.value.trim().length == 0) {

                this.#elements.translationGrid.classList.add("Hide");
            }
            else {
                this.#elements.translationGrid.classList.remove("Hide");
            }
            
            if (this.#elements.meaningInput.value.trim().length == 0) {
                this.#elements.meaningGridCell1.classList.add("Hide");
                this.#elements.meaningGridCell2.classList.add("Hide");
            }
            else {
                this.#elements.meaningGridCell1.classList.remove("Hide");
                this.#elements.meaningGridCell2.classList.remove("Hide");
            }

            if (this.#elements.literalInput.value.trim().length == 0) {
                this.#elements.literalGridCell1.classList.add("Hide");
                this.#elements.literalGridCell2.classList.add("Hide");
            }
            else {
                this.#elements.literalGridCell1.classList.remove("Hide");
                this.#elements.literalGridCell2.classList.remove("Hide");
            }
            
            if (this.#elements.structureInput.value.trim().length == 0) {
                this.#elements.structureGridCell1.classList.add("Hide");
                this.#elements.structureGridCell2.classList.add("Hide");
            }
            else {
                this.#elements.structureGridCell1.classList.remove("Hide");
                this.#elements.structureGridCell2.classList.remove("Hide");
            }
            
            if (this.#elements.notesInput.value.trim().length == 0) {
                this.#elements.notesGridCell1.classList.add("Hide");
                this.#elements.notesGridCell2.classList.add("Hide");
            }
            else {
                this.#elements.notesGridCell1.classList.remove("Hide");
                this.#elements.notesGridCell2.classList.remove("Hide");
            }

            // Hide if no content to show
            let foundExample = false;

            for(let example of Array.from(this.#elements.examplesContainer.children)) {

                if (example instanceof HTMLDivElement && example.getAttribute("data-use")=="example") {

                    let foundContent = false;

                    for(let input of Array.from(example.querySelectorAll("input"))) {

                        if (input.value.trim().length == 0) {
                            input.parentElement?.classList.add("Hide");
                        }
                        else {
                            foundContent = true;
                            foundExample = true;
                        }
                    }

                    if (!foundContent) {
                        example.classList.add("Hide");
                    }
                }
            }

            if (foundExample) {

                /** @ts-ignore */ 
                this.#elements.examplesHeader.parentNode.classList.remove("Hide");

                this.#elements.examplesHeader.classList.remove("Expanded");
                this.#elements.examplesExpander.classList.add("Show");
                this.#elements.examplesExpander.classList.remove("Rotate180");
                this.#elements.examplesAdd.classList.remove("Show");
            }
            else {
                /** @ts-ignore */ 
                this.#elements.examplesHeader.parentNode.classList.add("Hide");
            }

            this.#elements.examplesContainer.classList.remove("Show");

        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    #setUIForEdit() {
        if (this.#elements.fieldset && this.#elements.translationGrid &&
            this.#elements.meaningGridCell1 && this.#elements.meaningGridCell2 && 
            this.#elements.literalGridCell1 && this.#elements.literalGridCell2 && 
            this.#elements.structureGridCell1 && this.#elements.structureGridCell2 &&
            this.#elements.notesGridCell1 && this.#elements.notesGridCell2 &&
            this.#elements.examplesHeader && this.#elements.examplesExpander && 
            this.#elements.examplesAdd && this.#elements.examplesContainer) {

            this.#elements.fieldset.removeAttribute("disabled");

            this.#elements.translationGrid.classList.remove("Hide");

            this.#elements.meaningGridCell1.classList.remove("Hide");
            this.#elements.meaningGridCell2.classList.remove("Hide");
            this.#elements.literalGridCell1.classList.remove("Hide");
            this.#elements.literalGridCell2.classList.remove("Hide");
            this.#elements.structureGridCell1.classList.remove("Hide");
            this.#elements.structureGridCell2.classList.remove("Hide");
            this.#elements.notesGridCell1.classList.remove("Hide");
            this.#elements.notesGridCell2.classList.remove("Hide");

            /** @ts-ignore */ 
            this.#elements.examplesHeader.parentNode.classList.remove("Hide");

            this.#elements.examplesHeader.classList.add("Expanded");
            this.#elements.examplesExpander.classList.remove("Show");
            this.#elements.examplesExpander.classList.add("Rotate180");
            this.#elements.examplesAdd.classList.add("Show");
            this.#elements.examplesContainer.classList.add("Show");

            // Show everything in edit
            for(let example of Array.from(this.#elements.examplesContainer.children)) {

                if (example instanceof HTMLDivElement && example.getAttribute("data-use")=="example") {

                    for(let input of Array.from(example.querySelectorAll("input"))) {

                        input.parentElement?.classList.remove("Hide");
                    }

                    example.classList.remove("Hide");
                }
            }
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    /**
     * @param {HTMLInputElement} inputElement 
     * @returns {Boolean}
     */
    #validateNotNull(inputElement) {

        if (inputElement && inputElement.value.length == 0) {
            inputElement.classList.add("Error");
            inputElement.removeAttribute("data-isvalid");
            Log.info(`${this.constructor.name}.${inputElement.nodeName}(${inputElement.getAttribute("data-use")}) is a required field.`, "COMPONENT");
        }
        else {
            inputElement.classList.remove("Error");
            inputElement.setAttribute("data-isvalid", "data-isvalid");
            return true;
        }
        return false;
    }

    /**
     * @param {HTMLInputElement} inputElement 
     * @returns {Boolean}
     */
    #validateHighlighter(inputElement) {

        let regex = /^(\d+|\d+-\d+|)(,(\d+|\d+-\d+|))*(\\(\d+|\d+-\d+|)(,(\d+|\d+-\d+|))*)*$/;
        
        if (inputElement) {

            // Step 0 - Remove all whitespace
            let str = inputElement.value.replace(/\s/g,'');

            // Step 1 - confirm the basic pattern matches
            if (!str.match(regex)) {
                inputElement.classList.add("Error");
                inputElement.removeAttribute("data-isvalid");
                Log.info(`${this.constructor.name}.${inputElement.nodeName}(${inputElement.getAttribute("data-use")}) does not match a valid highlighter string pattern.`, "COMPONENT");
                return false;
            }

            // Step 2 - Split the array on both the element ',' and collection '\' delimiters.
            let str1d = str.split(/[,\\]/g);

            // Step 3 - Split again to make a 2d array of the form [element][from, to]
            let str2d = str1d.map(x => x.includes('-') ? x.split('-') : [x,x]);

            // Step 4 - Convert the strings into numbers 
            let num2d = str2d.map(x => x.map(y => parseInt(y)));

            // Step 5 - Sort ascending for each from and to pair
            num2d = num2d.map(x => x.sort((a,b) => { return a - b } ));

            // Step 6 - Sort ascending the pairs on the from values
            num2d = num2d.sort((a,b) => { return a[0] - b[0] });

            // Step 7 - Walk the list from the second item, comparing the current 'from' with the previous 'to' to make sure there are no overlaps
            for (let i = 1; i < num2d.length; i++) {
                if (num2d[i][0] <= num2d[i-1][1]) {
                    inputElement.classList.add("Error");
                    inputElement.removeAttribute("data-isvalid");
                    Log.info(`${this.constructor.name}.${inputElement.nodeName}(${inputElement.getAttribute("data-use")}) has a pair of overlapping ranges [${num2d[i-1][0]},${num2d[i-1][1]}] and [${num2d[i][0]},${num2d[i][1]}]`, "COMPONENT");
                    return false;
                }
            }

            inputElement.classList.remove("Error");
            inputElement.setAttribute("data-isvalid", "data-isvalid");
            return true;

        }
        return false;
    }

    #validateForm() {

        if (this.#elements.fieldset && this.#elements.editSaveButton) {
            if (!this.#elements.fieldset.hasAttribute("disabled") && !this.isValid()) {
                this.#elements.editSaveButton.classList.add("Disabled");
                this.#elements.editSaveButton.setAttribute("data-disabled", "data-disabled");
            }
            else {
                this.#elements.editSaveButton.classList.remove("Disabled");
                this.#elements.editSaveButton.removeAttribute("data-disabled");
            }
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    #revalidateAll() {

        if (this.#elements.kanaHighlighterInput && this.#elements.romajiInput && 
            this.#elements.romajiHighlighterInput && this.#elements.meaningHighlighterInput) {
        
            this.#validateHighlighter(this.#elements.kanaHighlighterInput);
            this.#validateNotNull(this.#elements.romajiInput);
            this.#validateHighlighter(this.#elements.romajiHighlighterInput);
            this.#validateHighlighter(this.#elements.meaningHighlighterInput);
            this.#validateForm();
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    #commitChanges() {

        if (this.#elements.kanaOutput && this.#elements.kanaInput && this.#elements.kanaHighlighterInput &&
            this.#elements.romajiOutput && this.#elements.romajiInput && this.#elements.romajiHighlighterInput &&
            this.#elements.meaningOutput && this.#elements.meaningInput && this.#elements.meaningHighlighterInput &&
            this.#elements.literalInput && this.#elements.structureInput && this.#elements.notesInput &&
            this.#elements.examplesContainer) {

            // update the propertybag
            this.#propertyBag.kana = this.#elements.kanaInput.value;
            this.#propertyBag.kanaHighlighterString = this.#elements.kanaHighlighterInput.value;
            this.#propertyBag.romaji = this.#elements.romajiInput.value;
            this.#propertyBag.romajiHighlighterString = this.#elements.romajiHighlighterInput.value;
            this.#propertyBag.meaning = this.#elements.meaningInput.value;
            this.#propertyBag.meaningHighlighterString = this.#elements.meaningHighlighterInput.value;
            this.#propertyBag.literal = this.#elements.literalInput.value;
            this.#propertyBag.structure = this.#elements.structureInput.value;
            this.#propertyBag.notes = this.#elements.notesInput.value;
            this.#propertyBag.examples = [];

            // Rebuild property bag examples
            for(let example of Array.from(this.#elements.examplesContainer.children)) {

                if (example instanceof HTMLDivElement && example.getAttribute("data-use")=="example") {

                    let propertyBagExample = {};
                    
                    /** @type {HTMLInputElement | ?} */
                    let kana = example.querySelector("input[data-as='kana']");
                    /** @type {HTMLInputElement | ?} */
                    let romaji = example.querySelector("input[data-as='romaji']");
                    /** @type {HTMLInputElement | ?} */
                    let meaning = example.querySelector("input[data-as='meaning']");

                    propertyBagExample.kana = kana?.value;
                    propertyBagExample.romaji = romaji?.value;
                    propertyBagExample.meaning = meaning?.value;

                    this.#propertyBag.examples.push(propertyBagExample);
                }
            }
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    #rollbackChanges() {

        if (this.#elements.kanaInput && this.#elements.kanaHighlighterInput && 
            this.#elements.romajiInput && this.#elements.romajiHighlighterInput &&
            this.#elements.meaningInput && this.#elements.meaningHighlighterInput &&
            this.#elements.literalInput && this.#elements.structureInput && this.#elements.notesInput &&
            this.#elements.examplesContainer) {

            // Update CSS
            this.#setUIForRead();

            // reset controls from the propertybag
            this.#elements.kanaInput.value = this.#propertyBag.kana || "";
            this.#elements.kanaHighlighterInput.value = this.#propertyBag.kanaHighlighterString || "";
            this.#elements.romajiInput.value = this.#propertyBag.romaji || "";
            this.#elements.romajiHighlighterInput.value = this.#propertyBag.romajiHighlighterString || "";
            this.#elements.kanaInput.value = this.#propertyBag.meaning || "";
            this.#elements.meaningHighlighterInput.value = this.#propertyBag.meaningHighlighterString || "";
            this.#elements.literalInput.value = this.#propertyBag.literal || "";
            this.#elements.structureInput.value = this.#propertyBag.structure || "";
            this.#elements.notesInput.value = this.#propertyBag.notes || "";

            // Rebuild examples from the propertybag
            while (this.#elements.examplesContainer.lastChild) {
                this.#elements.examplesContainer.removeChild(this.#elements.examplesContainer.lastChild);
            }

            for(let propertyBagExample of this.#propertyBag.examples) {

                let fragment = getDOMFragmentFromString(CCLanguageItem.#htmlExampleTemplate);

                /** @type {HTMLInputElement | ?} */
                let kana = fragment.querySelector("input[data-use='example.kana.input']");
                if (kana) {
                    kana.value = propertyBagExample.kana;
                }

                /** @type {HTMLInputElement | ?} */
                let romaji = fragment.querySelector("input[data-use='example.romaji.input']");
                if (romaji) {
                    romaji.value = propertyBagExample.romaji;
                }

                /** @type {HTMLInputElement | ?} */
                let meaning = fragment.querySelector("input[data-use='example.meaning.input']");
                if (meaning) {
                    meaning.value = propertyBagExample.meaning;
                }

                this.#elements.examplesContainer.appendChild(fragment);

            }
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    #regenerateHighlightableOutputs() {

        if (this.#elements.kanaOutput && this.#elements.kanaInput && this.#elements.kanaHighlighterInput &&
            this.#elements.romajiOutput && this.#elements.romajiInput && this.#elements.romajiHighlighterInput &&
            this.#elements.meaningOutput && this.#elements.meaningInput && this.#elements.meaningHighlighterInput &&
            this.#elements.literalInput && this.#elements.structureInput && this.#elements.notesInput) {

            /** @type {HTMLSpanElement} output */
            let output;

            // Kana
            output = this.#buildOutput(this.#elements.kanaInput.value, this.#elements.kanaHighlighterInput.value);
            this.#elements.kanaOutput.innerText = "";
            this.#elements.kanaOutput.appendChild(output);            
            
            // Romaji
            output = this.#buildOutput(this.#elements.romajiInput.value, this.#elements.romajiHighlighterInput.value);
            this.#elements.romajiOutput.innerText = "";
            this.#elements.romajiOutput.appendChild(output);
            
            // Meaning
            output = this.#buildOutput(this.#elements.meaningInput.value, this.#elements.meaningHighlighterInput.value);
            this.#elements.meaningOutput.innerText = "";
            this.#elements.meaningOutput.appendChild(output);

        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    /**
     * @param {String} inText
     * @param {String} inPattern
     * @returns {HTMLSpanElement}
     */
    #buildOutput(inText, inPattern) {

        // Step 0 - Remove all whitespace
        let str = inPattern.replace(/\s/g,'');

        // Step 1, 2 & 3 - Split the array on delimiters '\' then ',' and then '-' to get a 3 dimensional array.
        let str1d = str.split(/\\/g);
        let str2d = str1d.map(x => x.split(/,/g));
        let str3d = str2d.map(x => x.map(y => y.includes('-') ? y.split('-') : [y,y] ));

        // Step 4 - Convert to numbers
        let num3d = str3d.map(x => x.map(y => y.map(z => parseInt(z))));

        // Step 5 - Sort ascending the 'to' and 'from' leaf nodes
        num3d = num3d.map(x => x.map(y => y.sort((a,b) => { return a - b } )));

        // Step 6 - Add the SetId and HighlightId as array indicies 2 & 3 respectively, after 'to' and 'from'
        num3d = num3d.map((x,xindex) => x.map((y,yindex) => [...y, xindex + 1, yindex + 1] ));

        // Step 7 - Concatenate the set array dimension
        /** @ts-ignore */ 
        let num2d = [].concat(...num3d);

        // Step 8 - Sort ascending across all 'from'
        num2d = num2d.sort((a,b) => { return a[0] - b[0] });

        // Step 9 - Walk the dataset to build the output
        let output = document.createElement("span");
        let nextCharToProcess = 0;

        for (let i = 0; i < num2d.length; i++) {
            if (!isNaN(num2d[i][0]) && !isNaN(num2d[i][1])) {

                // process any intermediate characters not identified by highlighting
                if (num2d[i][0]-1 > nextCharToProcess) {
                    let fragment = document.createElement("span");
                    fragment.innerText = inText.substring(nextCharToProcess, num2d[i][0]-1);

                    output.appendChild(fragment);    
                }

                // Process the current highlight
                let fragment = document.createElement("span");
                fragment.innerText = inText.substring(num2d[i][0]-1, num2d[i][1]);
                fragment.setAttribute("data-setid", num2d[i][2]);
                fragment.setAttribute("data-highlightid", num2d[i][3]);

                output.appendChild(fragment);

                nextCharToProcess = num2d[i][1];
            }
        }

        // process any trailing characters not identified by highlighting
        if (nextCharToProcess < inText.length) {
            let fragment = document.createElement("span");
            fragment.innerText = inText.substring(nextCharToProcess, inText.length);

            output.appendChild(fragment);    
        }
        
        return output;
    }

    /**
     * @param {string?} targetHighlightId
     */
    #highlight(targetHighlightId) {

        if ( this.#elements.kanaOutput && this.#elements.romajiOutput && this.#elements.meaningOutput ) {

            if (this.#elements.kanaOutput.firstChild instanceof HTMLSpanElement) {
                this.#elements.kanaOutput.firstChild.childNodes.forEach( x => {
                    if (x instanceof HTMLElement) {
                        x.getAttribute("data-highlightid") == targetHighlightId ? x.classList.add("Underline") : x.classList.remove("Underline");
                    }
                });
            }

            if (this.#elements.romajiOutput.firstChild instanceof HTMLSpanElement) {
                this.#elements.romajiOutput.firstChild.childNodes.forEach( x => {
                    if (x instanceof HTMLElement) {
                        x.getAttribute("data-highlightid") == targetHighlightId ? x.classList.add("Underline") : x.classList.remove("Underline");
                    }
                });
            }

            if (this.#elements.meaningOutput.firstChild instanceof HTMLSpanElement) {
                this.#elements.meaningOutput.firstChild.childNodes.forEach( x => {
                    if (x instanceof HTMLElement) {
                        x.getAttribute("data-highlightid") == targetHighlightId ? x.classList.add("Underline") : x.classList.remove("Underline");
                    }
                });
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
     * @param {Boolean} [fullRevalidation]
     * @returns {Boolean}
     */
    isValid(fullRevalidation=false) {

        if (fullRevalidation) {
            this.#revalidateAll();
        }

        if (this.#elements.kanaHighlighterInput && this.#elements.romajiInput && 
            this.#elements.romajiHighlighterInput && this.#elements.meaningHighlighterInput) {

            if (this.#elements.kanaHighlighterInput.hasAttribute("data-isvalid") && 
                this.#elements.romajiInput.hasAttribute("data-isvalid") &&
                this.#elements.romajiHighlighterInput.hasAttribute("data-isvalid") &&
                this.#elements.meaningHighlighterInput.hasAttribute("data-isvalid")) {
                
                return true;
                
            }
        }
        else {
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
        return false;
    }

    /**
     * @param {Function?} callback 
     * @returns
     */
    attachDelectRequestCallback(callback) {

        if (callback != null && typeof callback === "function") {
            this.#attachedCallbacks.deleteRequestCallback = callback;
        }
        else {
            this.#attachedCallbacks.deleteRequestCallback = null;
        }
    }

    /**
     * @param {Function?} callback 
     * @returns
     */
    attachDataUpdateCallback(callback) {
        
        if (callback != null && typeof callback === "function") {
            this.#attachedCallbacks.dataUpdateCallback = callback;
        }
        else {
            this.#attachedCallbacks.dataUpdateCallback = null;
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
     * @param {MouseEvent & {target:HTMLElement} | ?} mouseEvent 
     * @returns
     */
    saveCallback(mouseEvent) {
        console.log("Save");

        if (!this.isValid(true) || (mouseEvent.currentTarget && mouseEvent.currentTarget.hasAttribute("data-disabled"))) {
            return;
        }

        // Update CSS
        this.#setUIForRead();

        // Update property bag
        this.#commitChanges();

        // Build & set highlightable outputs 
        this.#regenerateHighlightableOutputs();

        // Fire callback if 
        if (this.#attachedCallbacks.dataUpdateCallback) {

            let event = {};
            event.originatingEvent = mouseEvent;
            event.originatingObject = mouseEvent.currentTarget;
            event.currentData = Object.assign({}, this.#propertyBag);


            this.#attachedCallbacks.dataUpdateCallback(event);
        }
    }


    /**
     * @param {MouseEvent} mouseEvent 
     * @returns
     */
    cancelCallback(mouseEvent) {
        console.log("Cancel");

        this.#rollbackChanges();
    }

    /**
     * @param {MouseEvent} mouseEvent 
     * @returns
     */
    editCallback(mouseEvent) {
        console.log("Edit");

        // Update CSS
        this.#setUIForEdit();
        this.isValid(true);
    }

    /**
     * @param {MouseEvent} mouseEvent 
     * @returns
     */
    deleteRequestCallback(mouseEvent) {
        console.log("Delete");

        if (this.#attachedCallbacks.deleteRequestCallback) {

            let event = {};
            event.originatingEvent = mouseEvent;
            event.originatingObject = mouseEvent.currentTarget;
            event.currentData = Object.assign({}, this.#propertyBag);


            this.#attachedCallbacks.deleteRequestCallback(event);
        }
    }

    /**
     * @param {Event & {currentTarget:HTMLElement} | ?} event 
     * @returns
     */
    validateHighlighterCallback(event) {
        console.log("Highlighter Blur");

        this.#validateHighlighter(event.currentTarget);
        this.#validateForm();
    }

    /**
     * @param {Event & {currentTarget:HTMLElement} |?} event 
     * @returns
     */
    validateRomajiCallback(event) {
        console.log("Romaji Change");

        this.#validateNotNull(event.currentTarget);
        this.#validateForm();

    }

    /**
     * @param {MouseEvent} mouseEvent 
     * @returns
     */
    textHoverCallback(mouseEvent) {

        let range = document.caretPositionFromPoint(mouseEvent.clientX, mouseEvent.clientY);
        /** @type {String?} targetHighlightId */
        let targetHighlightId = "";

        if (range && range.offsetNode && range.offsetNode.parentNode instanceof HTMLSpanElement && range.offsetNode.parentNode.hasAttribute("data-highlightid")) {
            targetHighlightId = range.offsetNode.parentNode.getAttribute("data-highlightid");
        }

        this.#highlight(targetHighlightId);
    }

    /**
     * @param {MouseEvent} mouseEvent 
     * @returns
     */
    textDehoverCallback(mouseEvent) {
        this.#highlight("");
    }

    /**
     * @param {MouseEvent} mouseEvent 
     * @returns
     */
    examplesExpanderCallback(mouseEvent) {
        console.log("Expander");

        if (this.#elements.fieldset && this.#elements.examplesHeader && this.#elements.examplesExpander && this.#elements.examplesContainer) {
            
            if (!this.#elements.fieldset.hasAttribute("disabled")) {
                return;  // To prevent the examples collapsing in edit mode.
            }
            
            if (this.#elements.examplesHeader.classList.contains("Expanded")) {  // If expanded then collapse
                this.#elements.examplesHeader.classList.remove("Expanded");
                this.#elements.examplesExpander.classList.remove("Rotate180");
                this.#elements.examplesContainer.classList.remove("Show");
            }
            else {  // otherwise expand
                this.#elements.examplesHeader.classList.add("Expanded");
                this.#elements.examplesExpander.classList.add("Rotate180");
                this.#elements.examplesContainer.classList.add("Show");
            }
        }
        else { 
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    /**
     * @param {MouseEvent} mouseEvent 
     * @returns
     */
    examplesAddCallback(mouseEvent) {
        console.log("Add");

        if (this.#elements.examplesContainer) {
            let fragment = getDOMFragmentFromString(CCLanguageItem.#htmlExampleTemplate);
            this.#elements.examplesContainer.appendChild(fragment);
        }
        else { 
            Log.fatal("Component has not been correctly initialised", "COMPONENT", this);
        }
    }

    /**
     * @param {MouseEvent & {currentTarget:HTMLElement} | ?} mouseEvent 
     * @returns
     */
    exampleClickCallback(mouseEvent) {
        console.log("Delete");

        if (mouseEvent.target) {
            
            if (mouseEvent.target.getAttribute("data-use") == "example.delete-button" || mouseEvent.target.parentNode.getAttribute("data-use") == "example.delete-button") {

                let exampleToDelete = mouseEvent.target.closest("[data-use='example']");
                exampleToDelete.classList.add("Deleting"); 

                setTimeout(() => {
                    exampleToDelete.remove();
                }, 500);

            }
        }
    }
}