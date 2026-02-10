/**
 * Custom component used for displaying and editing a word, phrase or sentence
 */
"use strict";

/**
 * Typedefs 
 * @typedef {{
 *      rootContainer: HTMLDivElement?,
 *      tableTitle: HTMLDivElement?,
 *      tableContainer: HTMLDivElement?,
 *      headings: Array<HTMLElement>,
 *      kana: Array<HTMLElement>,
 * }} CCKanaElements
 * 
 * @typedef {{
 *      layout: Number,
 *      showHiragana: Boolean,
 * }} CCKanaPropertyBag
 * 
 * @typedef {{
 * }} CCKanaAttachedCallbacks
 * 
 * @typedef {{
 *      label: String,
 *      layoutCSS: Array<Array<String>>,
 * }} CCKanaHeadingData
 * 
 * @typedef {{
 *      hiragana: String,
 *      katakana: String,
 *      romaji: String,
 *      layoutCSS: Array<Array<String>>,
 *      kanaCSS: Array<Array<String>>,
 *      romajiCSS: Array<Array<String>>,
 * }} CCKanaCellData
 * 
 * @typedef {{
 *      headings: Array<CCKanaHeadingData>
 *      kana: Array<CCKanaCellData>
 * }} CCKanaData
 */

class CCKana extends CCBase {

    /**
     * Member attributes
     */

    /**
     * The elements that make up this component
     * @type {CCKanaElements}
     */
    #elements = {
        rootContainer: null,
        tableTitle: null,
        tableContainer: null,
        headings: [],
        kana: [],
    }    

    /**
     * The state properties for this component
     * @type {CCKanaPropertyBag}
     */
    #propertyBag = {
        layout: 0,
        showHiragana: true,
    }

    /**
     * Callbacks attached to this component
     * @type {CCKanaAttachedCallbacks}
     */
    #attachedCallbacks = {
        
    }

    static #dataTemplateInitialised = false

    /**
     * @type {CCKanaData}
     */
    static #dataTemplate = {
        headings: [
            { label: "monographs", layoutCSS: [[], ["R1", "C3", "W5", "RomanXL", "SmallFFRomanL", "Font400"],[],[]]},
            { label: "digraphs", layoutCSS: [[], ["R1", "C8", "W3", "RomanXL", "SmallFFRomanL", "Font400"],["R19", "C1", "H7", "VerticalText", "RomanXL", "Font400"],[]]},
            { label: "regular", layoutCSS: [[], ["R3", "C1", "H11", "VerticalText", "RomanXL", "SmallFFRomanL", "Font400"],["R2", "C1", "H11", "VerticalText", "RomanXL", "Font400"],[]]},
            { label: "diacritics", layoutCSS: [[], ["R14", "C1", "H5", "VerticalText", "RomanXL", "SmallFFRomanL", "Font400"],["R13", "C1", "H5", "VerticalText", "RomanXL", "Font400"],[]]},
            { label: "diacritic digraphs", layoutCSS: [[], [],["R26", "C1", "H5", "VerticalText", "RomanXL", "Font400"],[]]},
            { label: "extended katakana sounds", layoutCSS: [[],[],[],[],["R1", "C2","W8", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "used in loanwords and foreign names (to emulate foreign sounds)", layoutCSS: [[],[],[],[],["R3", "C1","H15", "VerticalText", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "a", layoutCSS: [["R1", "C2", "RomanXL", "Font400"],["R2", "C3", "RomanXL", "SmallFFRomanL", "Font400"],["R1", "C3", "W3", "RomanXL", "Font400"],["R1", "C3", "RomanXL", "Font400"],["R2", "C2", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "i", layoutCSS: [["R1", "C3", "RomanXL", "Font400"],["R2", "C4", "RomanXL", "SmallFFRomanL", "Font400"],["R1", "C6", "W3", "RomanXL", "Font400"],["R1", "C4", "RomanXL", "Font400"],["R2", "C3", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "u", layoutCSS: [["R1", "C4", "RomanXL", "Font400"],["R2", "C5", "RomanXL", "SmallFFRomanL", "Font400"],["R1", "C9", "W3", "RomanXL", "Font400"],["R1", "C5", "RomanXL", "Font400"],["R2", "C4", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "e", layoutCSS: [["R1", "C5", "RomanXL", "Font400"],["R2", "C6", "RomanXL", "SmallFFRomanL", "Font400"],["R1", "C12", "W3", "RomanXL", "Font400"],["R1", "C6", "RomanXL", "Font400"],["R2", "C5", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "o", layoutCSS: [["R1", "C6", "RomanXL", "Font400"],["R2", "C7", "RomanXL", "SmallFFRomanL", "Font400"],["R1", "C15", "W3", "RomanXL", "Font400"],["R1", "C7", "RomanXL", "Font400"],["R2", "C6", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "ya", layoutCSS: [[],["R2", "C8", "RomanXL", "SmallFFRomanL", "Font400"],["R18", "C3", "W5", "RomanXL", "Font400"],[],["R2", "C7", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "yu", layoutCSS: [[],["R2", "C9", "RomanXL", "SmallFFRomanL", "Font400"],["R18", "C8", "W5", "RomanXL", "Font400"],[],["R2", "C8", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "yo", layoutCSS: [[],["R2", "C10", "RomanXL", "SmallFFRomanL", "Font400"],["R18", "C13", "W5", "RomanXL", "Font400"],[],["R2", "C9", "RomanXL", "SmallFFRomanL", "Font400"]]},
            { label: "-", layoutCSS: [["R2", "C1", "RomanXL", "Font400"],["R3", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R2", "C2", "RomanXL", "Font400"],["R2", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "k-", layoutCSS: [["R3", "C1", "RomanXL", "Font400"],["R4", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R3", "C2", "RomanXL", "Font400"],["R3", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "s-", layoutCSS: [["R4", "C1", "RomanXL", "Font400"],["R5", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R4", "C2", "RomanXL", "Font400"],["R7", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "t-", layoutCSS: [["R5", "C1", "RomanXL", "Font400"],["R6", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R5", "C2", "RomanXL", "Font400"],["R11", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "n-", layoutCSS: [["R6", "C1", "RomanXL", "Font400"],["R7", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R6", "C2", "RomanXL", "Font400"],["R15", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "h-", layoutCSS: [["R7", "C1", "RomanXL", "Font400"],["R8", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R7", "C2", "RomanXL", "Font400"],["R17", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "m-", layoutCSS: [["R8", "C1", "RomanXL", "Font400"],["R9", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R8", "C2", "RomanXL", "Font400"],["R23", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "y-", layoutCSS: [["R9", "C1", "RomanXL", "Font400"],["R10", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R9", "C2", "RomanXL", "Font400"],["R25", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "r-", layoutCSS: [["R10", "C1", "RomanXL", "Font400"],["R11", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R10", "C2", "RomanXL", "Font400"],["R26", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "w-", layoutCSS: [["R11", "C1", "RomanXL", "Font400"],["R12", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R11", "C2", "RomanXL", "Font400"],["R28", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "n", layoutCSS: [["R12", "C1", "RomanXL", "Font400"],["R13", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R12", "C2", "RomanXL", "Font400"],["R29", "C1", "W2", "RomanXL", "Font400"]]},
            { label: "g-", layoutCSS: [[],["R14", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R13", "C2", "RomanXL", "Font400"],["R4", "C2", "RomanXL", "Font400"]]},
            { label: "z-", layoutCSS: [[],["R15", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R14", "C2", "RomanXL", "Font400"],["R8", "C2", "RomanXL", "Font400"]]},
            { label: "d-", layoutCSS: [[],["R16", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R15", "C2", "RomanXL", "Font400"],["R12", "C2", "RomanXL", "Font400"]]},
            { label: "b-", layoutCSS: [[],["R17", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R16", "C2", "RomanXL", "Font400"],["R18", "C2", "RomanXL", "Font400"]]},
            { label: "p-", layoutCSS: [[],["R18", "C2", "RomanXL", "SmallFFRomanL", "Font400"],["R17", "C2", "RomanXL", "Font400"],["R19", "C2", "RomanXL", "Font400"]]},
            { label: "ky-", layoutCSS: [[],[],[],["R5", "C2", "RomanXL", "Font400"]]},
            { label: "gy-", layoutCSS: [[],[],[],["R6", "C2", "RomanXL", "Font400"]]},
            { label: "sy-", layoutCSS: [[],[],[],["R9", "C2", "RomanXL", "Font400"]]},
            { label: "zy-", layoutCSS: [[],[],[],["R10", "C2", "RomanXL", "Font400"]]},
            { label: "ty-", layoutCSS: [[],[],[],["R13", "C2", "RomanXL", "Font400"]]},
            { label: "dy-", layoutCSS: [[],[],[],["R14", "C2", "RomanXL", "Font400"]]},
            { label: "ny-", layoutCSS: [[],[],[],["R16", "C2", "RomanXL", "Font400"]]},
            { label: "hy-", layoutCSS: [[],[],[],["R20", "C2", "RomanXL", "Font400"]]},
            { label: "by-", layoutCSS: [[],[],[],["R21", "C2", "RomanXL", "Font400"]]},
            { label: "py-", layoutCSS: [[],[],[],["R22", "C2", "RomanXL", "Font400"]]},
            { label: "my-", layoutCSS: [[],[],[],["R24", "C2", "RomanXL", "Font400"]]},
            { label: "ry-", layoutCSS: [[],[],[],["R27", "C2", "RomanXL", "Font400"]]},
            { label: "k-", layoutCSS: [[],[],["R19", "C2", "RomanXL", "Font400"],[]]},
            { label: "s-", layoutCSS: [[],[],["R20", "C2", "RomanXL", "Font400"],[]]},
            { label: "t-", layoutCSS: [[],[],["R21", "C2", "RomanXL", "Font400"],[]]},
            { label: "n-", layoutCSS: [[],[],["R22", "C2", "RomanXL", "Font400"],[]]},
            { label: "h-", layoutCSS: [[],[],["R23", "C2", "RomanXL", "Font400"],[]]},
            { label: "m-", layoutCSS: [[],[],["R24", "C2", "RomanXL", "Font400"],[]]},
            { label: "r-", layoutCSS: [[],[],["R25", "C2", "RomanXL", "Font400"],[]]},
            { label: "g-", layoutCSS: [[],[],["R26", "C2", "RomanXL", "Font400"],[]]},
            { label: "z-", layoutCSS: [[],[],["R27", "C2", "RomanXL", "Font400"],[]]},
            { label: "d-", layoutCSS: [[],[],["R28", "C2", "RomanXL", "Font400"],[]]},
            { label: "b-", layoutCSS: [[],[],["R29", "C2", "RomanXL", "Font400"],[]]},
            { label: "p-", layoutCSS: [[],[],["R30", "C2", "RomanXL", "Font400"],[]]},
        ],
        kana: [
            // Monographs
            { hiragana: "あ", katakana: "ア", romaji: "a", layoutCSS: [["R2", "C2", "Monograph"],["R3", "C3", "Monograph"],["R2", "C3", "W3", "Monograph"],["R2", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "い", katakana: "イ", romaji: "i", layoutCSS: [["R2", "C3", "Monograph"],["R3", "C4", "Monograph"],["R2", "C6", "W3", "Monograph"],["R2", "C4", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "う", katakana: "ウ", romaji: "u", layoutCSS: [["R2", "C4", "Monograph"],["R3", "C5", "Monograph"],["R2", "C9", "W3", "Monograph"],["R2", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "え", katakana: "エ", romaji: "e", layoutCSS: [["R2", "C5", "Monograph"],["R3", "C6", "Monograph"],["R2", "C12", "W3", "Monograph"],["R2", "C6", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "お", katakana: "オ", romaji: "o", layoutCSS: [["R2", "C6", "Monograph"],["R3", "C7", "Monograph"],["R2", "C15", "W3", "Monograph"],["R2", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "か", katakana: "カ", romaji: "ka", layoutCSS: [["R3", "C2", "Monograph"],["R4", "C3", "Monograph"],["R3", "C3", "W3", "Monograph"],["R3", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "き", katakana: "キ", romaji: "ki", layoutCSS: [["R3", "C3", "Monograph"],["R4", "C4", "Monograph"],["R3", "C6", "W3", "Monograph"],["R3", "C4", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "く", katakana: "ク", romaji: "ku", layoutCSS: [["R3", "C4", "Monograph"],["R4", "C5", "Monograph"],["R3", "C9", "W3", "Monograph"],["R3", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "け", katakana: "ケ", romaji: "ke", layoutCSS: [["R3", "C5", "Monograph"],["R4", "C6", "Monograph"],["R3", "C12", "W3", "Monograph"],["R3", "C6", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "こ", katakana: "コ", romaji: "ko", layoutCSS: [["R3", "C6", "Monograph"],["R4", "C7", "Monograph"],["R3", "C15", "W3", "Monograph"],["R3", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "さ", katakana: "サ", romaji: "sa", layoutCSS: [["R4", "C2", "Monograph"],["R5", "C3", "Monograph"],["R4", "C3", "W3", "Monograph"],["R7", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "し", katakana: "シ", romaji: "shi", layoutCSS: [["R4", "C3", "Monograph"],["R5", "C4", "Monograph"],["R4", "C6", "W3", "Monograph"],["R7", "C4", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "す", katakana: "ス", romaji: "su", layoutCSS: [["R4", "C4", "Monograph"],["R5", "C5", "Monograph"],["R4", "C9", "W3", "Monograph"],["R7", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "せ", katakana: "セ", romaji: "se", layoutCSS: [["R4", "C5", "Monograph"],["R5", "C6", "Monograph"],["R4", "C12", "W3", "Monograph"],["R7", "C6", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "そ", katakana: "ソ", romaji: "so", layoutCSS: [["R4", "C6", "Monograph"],["R5", "C7", "Monograph"],["R4", "C15", "W3", "Monograph"],["R7", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "た", katakana: "タ", romaji: "ta", layoutCSS: [["R5", "C2", "Monograph"],["R6", "C3", "Monograph"],["R5", "C3", "W3", "Monograph"],["R11", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ち", katakana: "チ", romaji: "chi", layoutCSS: [["R5", "C3", "Monograph"],["R6", "C4", "Monograph"],["R5", "C6", "W3", "Monograph"],["R11", "C4", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "つ", katakana: "ツ", romaji: "tsu", layoutCSS: [["R5", "C4", "Monograph"],["R6", "C5", "Monograph"],["R5", "C9", "W3", "Monograph"],["R11", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "て", katakana: "テ", romaji: "te", layoutCSS: [["R5", "C5", "Monograph"],["R6", "C6", "Monograph"],["R5", "C12", "W3", "Monograph"],["R11", "C6", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "と", katakana: "ト", romaji: "to", layoutCSS: [["R5", "C6", "Monograph"],["R6", "C7", "Monograph"],["R5", "C15", "W3", "Monograph"],["R11", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "な", katakana: "ナ", romaji: "na", layoutCSS: [["R6", "C2", "Monograph"],["R7", "C3", "Monograph"],["R6", "C3", "W3", "Monograph"],["R15", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "に", katakana: "二", romaji: "ni", layoutCSS: [["R6", "C3", "Monograph"],["R7", "C4", "Monograph"],["R6", "C6", "W3", "Monograph"],["R15", "C4", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぬ", katakana: "ヌ", romaji: "nu", layoutCSS: [["R6", "C4", "Monograph"],["R7", "C5", "Monograph"],["R6", "C9", "W3", "Monograph"],["R15", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ね", katakana: "ネ", romaji: "ne", layoutCSS: [["R6", "C5", "Monograph"],["R7", "C6", "Monograph"],["R6", "C12", "W3", "Monograph"],["R15", "C6", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "の", katakana: "ノ", romaji: "no", layoutCSS: [["R6", "C6", "Monograph"],["R7", "C7", "Monograph"],["R6", "C15", "W3", "Monograph"],["R15", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "は", katakana: "ハ", romaji: "ha", layoutCSS: [["R7", "C2", "Monograph"],["R8", "C3", "Monograph"],["R7", "C3", "W3", "Monograph"],["R17", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ひ", katakana: "ヒ", romaji: "hi", layoutCSS: [["R7", "C3", "Monograph"],["R8", "C4", "Monograph"],["R7", "C6", "W3", "Monograph"],["R17", "C4", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ふ", katakana: "フ", romaji: "hu", layoutCSS: [["R7", "C4", "Monograph"],["R8", "C5", "Monograph"],["R7", "C9", "W3", "Monograph"],["R17", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "へ", katakana: "ヘ", romaji: "he", layoutCSS: [["R7", "C5", "Monograph"],["R8", "C6", "Monograph"],["R7", "C12", "W3", "Monograph"],["R17", "C6", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ほ", katakana: "ホ", romaji: "ho", layoutCSS: [["R7", "C6", "Monograph"],["R8", "C7", "Monograph"],["R7", "C15", "W3", "Monograph"],["R17", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ま", katakana: "マ", romaji: "ma", layoutCSS: [["R8", "C2", "Monograph"],["R9", "C3", "Monograph"],["R8", "C3", "W3", "Monograph"],["R23", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "み", katakana: "三", romaji: "mi", layoutCSS: [["R8", "C3", "Monograph"],["R9", "C4", "Monograph"],["R8", "C6", "W3", "Monograph"],["R23", "C4", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "む", katakana: "ム", romaji: "mu", layoutCSS: [["R8", "C4", "Monograph"],["R9", "C5", "Monograph"],["R8", "C9", "W3", "Monograph"],["R23", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "め", katakana: "メ", romaji: "me", layoutCSS: [["R8", "C5", "Monograph"],["R9", "C6", "Monograph"],["R8", "C12", "W3", "Monograph"],["R23", "C6", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "も", katakana: "モ", romaji: "mo", layoutCSS: [["R8", "C6", "Monograph"],["R9", "C7", "Monograph"],["R8", "C15", "W3", "Monograph"],["R23", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "や", katakana: "ヤ", romaji: "ya", layoutCSS: [["R9", "C2", "Monograph"],["R10", "C3", "Monograph"],["R9", "C3", "W3", "Monograph"],["R25", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ゆ", katakana: "ユ", romaji: "yu", layoutCSS: [["R9", "C4", "Monograph"],["R10", "C5", "Monograph"],["R9", "C9", "W3", "Monograph"],["R25", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "よ", katakana: "ヨ", romaji: "yo", layoutCSS: [["R9", "C6", "Monograph"],["R10", "C7", "Monograph"],["R9", "C15", "W3", "Monograph"],["R25", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ら", katakana: "ラ", romaji: "ra", layoutCSS: [["R10", "C2", "Monograph"],["R11", "C3", "Monograph"],["R10", "C3", "W3", "Monograph"],["R26", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "り", katakana: "リ", romaji: "ri", layoutCSS: [["R10", "C3", "Monograph"],["R11", "C4", "Monograph"],["R10", "C6", "W3", "Monograph"],["R26", "C4", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "る", katakana: "ル", romaji: "ru", layoutCSS: [["R10", "C4", "Monograph"],["R11", "C5", "Monograph"],["R10", "C9", "W3", "Monograph"],["R26", "C5", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "れ", katakana: "レ", romaji: "re", layoutCSS: [["R10", "C5", "Monograph"],["R11", "C6", "Monograph"],["R10", "C12", "W3", "Monograph"],["R26", "C6", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ろ", katakana: "ロ", romaji: "ro", layoutCSS: [["R10", "C6", "Monograph"],["R11", "C7", "Monograph"],["R10", "C15", "W3", "Monograph"],["R26", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "わ", katakana: "ワ", romaji: "wa", layoutCSS: [["R11", "C2", "Monograph"],["R12", "C3", "Monograph"],["R11", "C3", "W3", "Monograph"],["R28", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "を", katakana: "ヲ", romaji: "wo(o)", layoutCSS: [["R11", "C6", "Monograph"],["R12", "C7", "Monograph"],["R11", "C15", "W3", "Monograph"],["R28", "C7", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ん", katakana: "ン", romaji: "n", layoutCSS: [["R12", "C2", "Monograph"],["R13", "C3", "Monograph"],["R12", "C3", "W3", "Monograph"],["R29", "C3", "Monograph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            
            // Digraphs
            { hiragana: "きゃ", katakana: "キャ", romaji: "kya", layoutCSS: [[],["R4", "C8", "Digraph"],["R19", "C3", "W5", "Digraph"],["R5", "C3", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "きゅ", katakana: "キュ", romaji: "kyu", layoutCSS: [[],["R4", "C9", "Digraph"],["R19", "C8", "W5", "Digraph"],["R5", "C5", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},            
            { hiragana: "きょ", katakana: "キョ", romaji: "kyo", layoutCSS: [[],["R4", "C10", "Digraph"],["R19", "C13", "W5", "Digraph"],["R5", "C7", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "しゃ", katakana: "シャ", romaji: "sha", layoutCSS: [[],["R5", "C8", "Digraph"],["R20", "C3", "W5", "Digraph"],["R9", "C3", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "しゅ", katakana: "シュ", romaji: "shu", layoutCSS: [[],["R5", "C9", "Digraph"],["R20", "C8", "W5", "Digraph"],["R9", "C5", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},            
            { hiragana: "しょ", katakana: "ショ", romaji: "sho", layoutCSS: [[],["R5", "C10", "Digraph"],["R20", "C13", "W5", "Digraph"],["R9", "C7", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ちゃ", katakana: "チャ", romaji: "cha", layoutCSS: [[],["R6", "C8", "Digraph"],["R21", "C3", "W5", "Digraph"],["R13", "C3", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ちゅ", katakana: "チュ", romaji: "chu", layoutCSS: [[],["R6", "C9", "Digraph"],["R21", "C8", "W5", "Digraph"],["R13", "C5", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},            
            { hiragana: "ちょ", katakana: "チョ", romaji: "cho", layoutCSS: [[],["R6", "C10", "Digraph"],["R21", "C13", "W5", "Digraph"],["R13", "C7", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "にゃ", katakana: "ニャ", romaji: "nya", layoutCSS: [[],["R7", "C8", "Digraph"],["R22", "C3", "W5", "Digraph"],["R16", "C3", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "にゅ", katakana: "ニュ", romaji: "nyu", layoutCSS: [[],["R7", "C9", "Digraph"],["R22", "C8", "W5", "Digraph"],["R16", "C5", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},            
            { hiragana: "にょ", katakana: "ニョ", romaji: "nyo", layoutCSS: [[],["R7", "C10", "Digraph"],["R22", "C13", "W5", "Digraph"],["R16", "C7", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ひゃ", katakana: "ヒャ", romaji: "hya", layoutCSS: [[],["R8", "C8", "Digraph"],["R23", "C3", "W5", "Digraph"],["R20", "C3", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ひゅ", katakana: "ヒュ", romaji: "hyu", layoutCSS: [[],["R8", "C9", "Digraph"],["R23", "C8", "W5", "Digraph"],["R20", "C5", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},            
            { hiragana: "ひょ", katakana: "ヒョ", romaji: "hyo", layoutCSS: [[],["R8", "C10", "Digraph"],["R23", "C13", "W5", "Digraph"],["R20", "C7", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "みゃ", katakana: "ミャ", romaji: "mya", layoutCSS: [[],["R9", "C8", "Digraph"],["R24", "C3", "W5", "Digraph"],["R24", "C3", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "みゅ", katakana: "ミュ", romaji: "myu", layoutCSS: [[],["R9", "C9", "Digraph"],["R24", "C8", "W5", "Digraph"],["R24", "C5", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},            
            { hiragana: "みょ", katakana: "ミョ", romaji: "myo", layoutCSS: [[],["R9", "C10", "Digraph"],["R24", "C13", "W5", "Digraph"],["R24", "C7", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "りゃ", katakana: "リャ", romaji: "rya", layoutCSS: [[],["R11", "C8", "Digraph"],["R25", "C3", "W5", "Digraph"],["R27", "C3", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "りゅ", katakana: "リュ", romaji: "ryu", layoutCSS: [[],["R11", "C9", "Digraph"],["R25", "C8", "W5", "Digraph"],["R27", "C5", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},            
            { hiragana: "りょ", katakana: "リョ", romaji: "ryo", layoutCSS: [[],["R11", "C10", "Digraph"],["R25", "C13", "W5", "Digraph"],["R27", "C7", "Digraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},

            // Diacritics
            { hiragana: "が", katakana: "ガ", romaji: "ga", layoutCSS: [[],["R14", "C3", "Diacritic"],["R13", "C3", "W3", "Diacritic"],["R4", "C3", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぎ", katakana: "ギ", romaji: "gi", layoutCSS: [[],["R14", "C4", "Diacritic"],["R13", "C6", "W3", "Diacritic"],["R4", "C4", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぐ", katakana: "グ", romaji: "gu", layoutCSS: [[],["R14", "C5", "Diacritic"],["R13", "C9", "W3", "Diacritic"],["R4", "C5", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "げ", katakana: "ゲ", romaji: "ge", layoutCSS: [[],["R14", "C6", "Diacritic"],["R13", "C12", "W3", "Diacritic"],["R4", "C6", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ご", katakana: "ゴ", romaji: "go", layoutCSS: [[],["R14", "C7", "Diacritic"],["R13", "C15", "W3", "Diacritic"],["R4", "C7", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ざ", katakana: "ザ", romaji: "za", layoutCSS: [[],["R15", "C3", "Diacritic"],["R14", "C3", "W3", "Diacritic"],["R8", "C3", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "じ", katakana: "ジ", romaji: "ji", layoutCSS: [[],["R15", "C4", "Diacritic"],["R14", "C6", "W3", "Diacritic"],["R8", "C4", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ず", katakana: "ズ", romaji: "zu", layoutCSS: [[],["R15", "C5", "Diacritic"],["R14", "C9", "W3", "Diacritic"],["R8", "C5", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぜ", katakana: "ゼ", romaji: "ze", layoutCSS: [[],["R15", "C6", "Diacritic"],["R14", "C12", "W3", "Diacritic"],["R8", "C6", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぞ", katakana: "ゾ", romaji: "zo", layoutCSS: [[],["R15", "C7", "Diacritic"],["R14", "C15", "W3", "Diacritic"],["R8", "C7", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "だ", katakana: "ダ", romaji: "da", layoutCSS: [[],["R16", "C3", "Diacritic"],["R15", "C3", "W3", "Diacritic"],["R12", "C3", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぢ", katakana: "ヂ", romaji: "ji", layoutCSS: [[],["R16", "C4", "Diacritic"],["R15", "C6", "W3", "Diacritic"],["R12", "C4", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "づ", katakana: "ヅ", romaji: "zu", layoutCSS: [[],["R16", "C5", "Diacritic"],["R15", "C9", "W3", "Diacritic"],["R12", "C5", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "で", katakana: "デ", romaji: "de", layoutCSS: [[],["R16", "C6", "Diacritic"],["R15", "C12", "W3", "Diacritic"],["R12", "C6", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ど", katakana: "ド", romaji: "do", layoutCSS: [[],["R16", "C7", "Diacritic"],["R15", "C15", "W3", "Diacritic"],["R12", "C7", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ば", katakana: "バ", romaji: "ba", layoutCSS: [[],["R17", "C3", "Diacritic"],["R16", "C3", "W3", "Diacritic"],["R18", "C3", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "び", katakana: "ビ", romaji: "bi", layoutCSS: [[],["R17", "C4", "Diacritic"],["R16", "C6", "W3", "Diacritic"],["R18", "C4", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぶ", katakana: "ブ", romaji: "bu", layoutCSS: [[],["R17", "C5", "Diacritic"],["R16", "C9", "W3", "Diacritic"],["R18", "C5", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "べ", katakana: "ベ", romaji: "be", layoutCSS: [[],["R17", "C6", "Diacritic"],["R16", "C12", "W3", "Diacritic"],["R18", "C6", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぼ", katakana: "ボ", romaji: "bo", layoutCSS: [[],["R17", "C7", "Diacritic"],["R16", "C15", "W3", "Diacritic"],["R18", "C7", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぱ", katakana: "パ", romaji: "pa", layoutCSS: [[],["R18", "C3", "Diacritic"],["R17", "C3", "W3", "Diacritic"],["R19", "C3", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぴ", katakana: "ピ", romaji: "pi", layoutCSS: [[],["R18", "C4", "Diacritic"],["R17", "C6", "W3", "Diacritic"],["R19", "C4", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぷ", katakana: "プ", romaji: "pu", layoutCSS: [[],["R18", "C5", "Diacritic"],["R17", "C9", "W3", "Diacritic"],["R19", "C5", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぺ", katakana: "ペ", romaji: "pe", layoutCSS: [[],["R18", "C6", "Diacritic"],["R17", "C12", "W3", "Diacritic"],["R19", "C6", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぽ", katakana: "ポ", romaji: "po", layoutCSS: [[],["R18", "C7", "Diacritic"],["R17", "C15", "W3", "Diacritic"],["R19", "C7", "Diacritic"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},

            // Diacritic Digraphs
            { hiragana: "ぎゃ", katakana: "ギャ", romaji: "gya", layoutCSS: [[],["R14", "C8", "DiacriticDigraph"],["R26", "C3", "W5", "DiacriticDigraph"],["R6", "C3", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぎゅ", katakana: "ギュ", romaji: "gyu", layoutCSS: [[],["R14", "C9", "DiacriticDigraph"],["R26", "C8", "W5", "DiacriticDigraph"],["R6", "C5", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぎょ", katakana: "ギョ", romaji: "gyo", layoutCSS: [[],["R14", "C10", "DiacriticDigraph"],["R26", "C13", "W5", "DiacriticDigraph"],["R6", "C7", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "じゃ", katakana: "ジャ", romaji: "ja", layoutCSS: [[],["R15", "C8", "DiacriticDigraph"],["R27", "C3", "W5", "DiacriticDigraph"],["R10", "C3", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "じゅ", katakana: "ジュ", romaji: "ju", layoutCSS: [[],["R15", "C9", "DiacriticDigraph"],["R27", "C8", "W5", "DiacriticDigraph"],["R10", "C5", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "じょ", katakana: "ジョ", romaji: "jo", layoutCSS: [[],["R15", "C10", "DiacriticDigraph"],["R27", "C13", "W5", "DiacriticDigraph"],["R10", "C7", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぢゃ", katakana: "ヂャ", romaji: "ja", layoutCSS: [[],["R16", "C8", "DiacriticDigraph"],["R28", "C3", "W5", "DiacriticDigraph"],["R14", "C3", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぢゅ", katakana: "ヂュ", romaji: "ju", layoutCSS: [[],["R16", "C9", "DiacriticDigraph"],["R28", "C8", "W5", "DiacriticDigraph"],["R14", "C5", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぢょ", katakana: "ヂョ", romaji: "jo", layoutCSS: [[],["R16", "C10", "DiacriticDigraph"],["R28", "C13", "W5", "DiacriticDigraph"],["R14", "C7", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "びゃ", katakana: "ビャ", romaji: "bya", layoutCSS: [[],["R17", "C8", "DiacriticDigraph"],["R29", "C3", "W5", "DiacriticDigraph"],["R21", "C3", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "びゅ", katakana: "ビュ", romaji: "byu", layoutCSS: [[],["R17", "C9", "DiacriticDigraph"],["R29", "C8", "W5", "DiacriticDigraph"],["R21", "C5", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "びょ", katakana: "ビョ", romaji: "byo", layoutCSS: [[],["R17", "C10", "DiacriticDigraph"],["R29", "C13", "W5", "DiacriticDigraph"],["R21", "C7", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぴゃ", katakana: "ピャ", romaji: "pya", layoutCSS: [[],["R18", "C8", "DiacriticDigraph"],["R30", "C3", "W5", "DiacriticDigraph"],["R22", "C3", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぴゅ", katakana: "ピュ", romaji: "pyu", layoutCSS: [[],["R18", "C9", "DiacriticDigraph"],["R30", "C8", "W5", "DiacriticDigraph"],["R22", "C5", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            { hiragana: "ぴょ", katakana: "ピョ", romaji: "pyo", layoutCSS: [[],["R18", "C10", "DiacriticDigraph"],["R30", "C13", "W5", "DiacriticDigraph"],["R22", "C7", "DiacriticDigraph"]], kanaCSS: [["KanaXL"],["KanaXL", "SmallFFKanaL"],["KanaXL"],["KanaXL"]], romajiCSS: [["RomanXL"],["RomanXL", "SmallFFRomanL"],["RomanXL"],["RomanXL"]]},
            
            // Extended Katakana (Accepted)
            { hiragana: "-", katakana: "イェ", romaji: "ye", layoutCSS: [[],[],[],[],["R3", "C5", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ウィ", romaji: "wi", layoutCSS: [[],[],[],[],["R4", "C3", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ウェ", romaji: "we", layoutCSS: [[],[],[],[],["R4", "C5", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ウォ", romaji: "wo", layoutCSS: [[],[],[],[],["R4", "C6", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ウャ", romaji: "wya", layoutCSS: [[],[],[],[],["R4", "C7", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ウョ", romaji: "wyo", layoutCSS: [[],[],[],[],["R4", "C9", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ヴァ", romaji: "va", layoutCSS: [[],[],[],[],["R5", "C2", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ヴィ", romaji: "vi", layoutCSS: [[],[],[],[],["R5", "C3", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ヴ", romaji: "vu", layoutCSS: [[],[],[],[],["R5", "C4", "Diacritic"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ヴェ", romaji: "ve", layoutCSS: [[],[],[],[],["R5", "C5", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ヴォ", romaji: "vo", layoutCSS: [[],[],[],[],["R5", "C6", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ヴュ", romaji: "vyu", layoutCSS: [[],[],[],[],["R5", "C8", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "クァ", romaji: "kwa", layoutCSS: [[],[],[],[],["R6", "C2", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "クィ", romaji: "kwi", layoutCSS: [[],[],[],[],["R6", "C3", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "クェ", romaji: "kwe", layoutCSS: [[],[],[],[],["R6", "C5", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "クォ", romaji: "kwo", layoutCSS: [[],[],[],[],["R6", "C6", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "グァ", romaji: "gwa", layoutCSS: [[],[],[],[],["R7", "C2", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "シェ", romaji: "she", layoutCSS: [[],[],[],[],["R8", "C6", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "チェ", romaji: "che", layoutCSS: [[],[],[],[],["R9", "C5", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ジェ", romaji: "je", layoutCSS: [[],[],[],[],["R10", "C5", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ツァ", romaji: "tsa", layoutCSS: [[],[],[],[],["R11", "C2", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ツィ", romaji: "tsi", layoutCSS: [[],[],[],[],["R11", "C3", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ツェ", romaji: "tse", layoutCSS: [[],[],[],[],["R11", "C5", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ツォ", romaji: "tso", layoutCSS: [[],[],[],[],["R11", "C6", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ティ", romaji: "ti", layoutCSS: [[],[],[],[],["R12", "C3", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "テュ", romaji: "tyu", layoutCSS: [[],[],[],[],["R12", "C8", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "トゥ", romaji: "tu", layoutCSS: [[],[],[],[],["R13", "C4", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ディ", romaji: "di", layoutCSS: [[],[],[],[],["R14", "C3", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "デュ", romaji: "dyu", layoutCSS: [[],[],[],[],["R15", "C8", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ドゥ", romaji: "du", layoutCSS: [[],[],[],[],["R16", "C8", "DiacriticDigraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "ファ", romaji: "fa", layoutCSS: [[],[],[],[],["R17", "C2", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "フィ", romaji: "fi", layoutCSS: [[],[],[],[],["R17", "C3", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "フェ", romaji: "fe", layoutCSS: [[],[],[],[],["R17", "C5", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "フォ", romaji: "fo", layoutCSS: [[],[],[],[],["R17", "C6", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
            { hiragana: "-", katakana: "フュ", romaji: "fyu", layoutCSS: [[],[],[],[],["R17", "C8", "Digraph"]], kanaCSS: [[],[],[],[],["KanaXL", "SmallFFKanaL"]], romajiCSS: [[],[],[],[],["RomanXL", "SmallFFRomanL"]]},
        ],
    }

    static #htmlRootTemplate = `
        <div class="CCKana Container PadBXL" data-use="root-container">
            <div class="TableHeader MarginBL">
                <div class="TableTitle"><p class="RomanXXXL NoBlockMargins" data-use="table.title">Hiragana / Katakana</p></div>
            </div>
            <div class="TableContainerOuter" data-use="root-container">
                <div class="TableContainer Gap2" data-use="table.container"></div>
            </div>
        </div>
    `;

    static #htmlHeadingTemplate = `
        <div data-use="Heading"></div>
    `;

    static #htmlKanaCellTemplate = `
        <div data-use="KanaCell">
            <div class="Kana">
                <div class="Hiragana" data-use="hiragana"></div>
                <div class="Katakana" data-use="katakana"></div>
            </div>
            <div class="Romaji RomanXL" data-use="romaji"></div>
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

    get layout() {
        return this.#propertyBag.layout;
    }

    get layoutClass() {
        return `Layout${this.#propertyBag.layout}`;
    }

    /**
     * Private Methods
     */
    /** 
     * @param {Boolean} useShadowDOM  
     */
    #initialiseStructure(useShadowDOM) {

        let kanaId = 1;
        let fragment = getDOMFragmentFromString(CCKana.#htmlRootTemplate);

        this.#elements.rootContainer = fragment.querySelector('[data-use="root-container"]');
        this.#elements.tableTitle = fragment.querySelector('[data-use="table.title"]');
        this.#elements.tableContainer = fragment.querySelector('[data-use="table.container"]');

        this.#propertyBag.showHiragana = true;
        this.#propertyBag.layout = 0;
        this.#elements.tableContainer?.classList.add(this.layoutClass);


        // First time only initialisation
        if (!CCKana.#dataTemplateInitialised) {
            // Loading UTF8 Files has been fixed ... no longer need my Demunger :) but also :(
            //for (let e of CCKana.#dataTemplate.headings) {
            //    e.label = UnicodeService.demunge(e.label) || "";
            //}
            //for (let e of CCKana.#dataTemplate.kana) {
            //    e.romaji = UnicodeService.demunge(e.romaji) || "";
            //    e.hiragana = UnicodeService.demunge(e.hiragana) || "";
            //    e.katakana = UnicodeService.demunge(e.katakana) || "";
            //}
            CCKana.#dataTemplateInitialised = true;
        }

        for (let [i, value] of CCKana.#dataTemplate.headings.entries()) {

            let heading = getDOMFragmentFromString(CCKana.#htmlHeadingTemplate).firstChild;
            if (heading != null && heading instanceof HTMLElement) {

                heading.innerText = value.label
                this.#elements.headings[i] = heading;
                this.#elements.tableContainer?.appendChild(heading);
            }
        }

        for (let [i, value] of CCKana.#dataTemplate.kana.entries()) {

            let kanaCell = getDOMFragmentFromString(CCKana.#htmlKanaCellTemplate).firstChild;
            if (kanaCell != null && kanaCell instanceof HTMLElement) {

                kanaCell.setAttribute("style",`view-transition-name:Kana${kanaId};`);
                /** @type {HTMLDivElement} */ (kanaCell.querySelector('[data-use="hiragana"]')).innerText = CCKana.#dataTemplate.kana[i].hiragana;
                /** @type {HTMLDivElement} */ (kanaCell.querySelector('[data-use="katakana"]')).innerText = CCKana.#dataTemplate.kana[i].katakana;
                /** @type {HTMLDivElement} */ (kanaCell.querySelector('[data-use="romaji"]')).innerText = CCKana.#dataTemplate.kana[i].romaji;

                this.#elements.kana[i] = kanaCell;
                this.#elements.tableContainer?.appendChild(kanaCell);
            }

            kanaId++;
        }

        if (useShadowDOM) {
            let shadow = this.attachShadow({ mode: "open" });
            shadow.appendChild(fragment);
        }
        else {
            this.appendChild(fragment);
        }
    }
    
    #initialiseBehaviour() {


    }


    /**
     * Public methods
     */
    render() {

        if (this.#elements.tableContainer) {
            this.#elements.tableContainer.classList = "";
            this.#elements.tableContainer.classList.add("TableContainer", "Gap2");
            this.#elements.tableContainer.classList.add(this.layoutClass);
        }

        for (let [i, value] of CCKana.#dataTemplate.headings.entries()) {
            if (this.#elements.headings[i]) {
                this.#elements.headings[i].classList = "";
                this.#elements.headings[i].classList.add("CellHeading");
                if (CCKana.#dataTemplate.headings[i].layoutCSS[this.#propertyBag.layout] != null &&
                    CCKana.#dataTemplate.headings[i].layoutCSS[this.#propertyBag.layout].length > 0) {
                    this.#elements.headings[i].classList.add(...CCKana.#dataTemplate.headings[i].layoutCSS[this.#propertyBag.layout]);
                }
                else {
                    this.#elements.headings[i].classList.add("Hide");
                }
            }
        }

        for (let [i, value] of CCKana.#dataTemplate.kana.entries()) {
            if (this.#elements.kana[i]) {
                this.#elements.kana[i].classList = "";
                this.#elements.kana[i].children[0].classList = "Kana";
                this.#elements.kana[i].children[1].classList = "Romaji";
                this.#elements.kana[i].classList.add("KanaCell");
                if (CCKana.#dataTemplate.kana[i].layoutCSS[this.#propertyBag.layout] != null &&
                    CCKana.#dataTemplate.kana[i].layoutCSS[this.#propertyBag.layout].length > 0) {
                    this.#elements.kana[i].classList.add(...CCKana.#dataTemplate.kana[i].layoutCSS[this.#propertyBag.layout]);
                    this.#elements.kana[i].children[0].classList.add(...CCKana.#dataTemplate.kana[i].kanaCSS[this.#propertyBag.layout]);
                    this.#elements.kana[i].children[1].classList.add(...CCKana.#dataTemplate.kana[i].romajiCSS[this.#propertyBag.layout]);
                }
                else {
                    this.#elements.kana[i].classList.add("Hide");
                }
            }
        }

        let hiraganaDivs = this.#elements.tableContainer?.querySelectorAll('[data-use="hiragana"]');
        let katakanaDivs = this.#elements.tableContainer?.querySelectorAll('[data-use="katakana"]');
       
        if (hiraganaDivs && katakanaDivs) {
            for (let e of hiraganaDivs) {
                e.classList.toggle("StageLeft", !this.#propertyBag.showHiragana);
            }
            for (let e of katakanaDivs) {
                e.classList.toggle("StageRight", this.#propertyBag.showHiragana);
            }
        }
    }

    setHiragana() {
        this.#propertyBag.showHiragana = true;
        this.render();
    }

    setKatakana() {
        this.#propertyBag.showHiragana = false;
        this.render();
    }

    /**
     * @param {Number} i 
     */
    setLayout(i) {
        this.#propertyBag.layout = i;
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                this.render();
            });
        }
        else {
            this.render();
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
}