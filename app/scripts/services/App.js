/**
 * List of valid Demo Elements (to minimise indexing errors while coding)
 * @typedef {{
 *      topNav: CCTopNav?,
 *      kanaPageControls: CCButtonStrip?,
 *      kana: CCKana?,
 *      searchComponent: CCSearch?,
 *      newItem: CCLanguageItem?,
 *      languagePageControls: CCButtonStrip?,
 *      languageList: CCLanguageItemList?,
 *      languageListControls: CCButtonStrip?,
 * }} AppComponents
 * 
 * @typedef {{
 * }} AppPropertyBag
 */

/**
 * Core app object, acts as a globals host for neatness and readability.
 * @class
 * @public
 */
class App {
    
    // Flux Pattern objects
    /**
     * @static
     * @type {(Store&AnyDictionary)?}
     */
    static store = null;

    /**
     * @static
     * @type {Dispatcher?}
     */
    static dispatcher = null;

    /**
     * @static
     * @type {PersistentStorageService?}
     */
    static persistentStorageService = null;

    /**
     * The elements that make up this component
     * @type {AppPropertyBag}
     */
    static propertyBag = {
        // Place variables here that act as global settings.
    };

    // Referenced elements
    /**
     * @type {LimitedDictionary<AppElements, HTMLElement?>}
     */
    static elements = {
        appForeground: null,
        topNavContainer: null,
        kanaPage: null,
        kanaPageControls: null,
        kanaPageBody: null,
        languagePage: null,
        languagePageControls: null,
        languageNewFlyout: null,
        languageListBody: null,
        settingsPage: null,
        welcomeModal: null,
        welcomeModalPage1: null,
        welcomeModalPage2: null,
        welcomeModalPage3: null,
        welcomeModalPage1Next: null,
        welcomeModalPage2Back: null,
        welcomeModalPage2Yes: null,
        welcomeModalPage2No: null,
        welcomeModalPage3Back: null,
        welcomeModalPage3Starter: null,
        welcomeModalPage3Empty: null,
    };

    /**
     * @type {AppComponents}
     */
    static components = {
        topNav: null,
        kanaPageControls: null,
        kana: null,
        searchComponent: null,
        newItem: null,
        languagePageControls: null,
        languageList: null,
        languageListControls: null,
    };

    /**
     * @type {LimitedDictionary<AppElements, HTMLElement?>}
     */
    static fragments = {
        appTitle: null,
    };
}
