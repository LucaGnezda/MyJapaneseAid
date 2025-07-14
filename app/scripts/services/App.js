/**
 * List of valid Demo Elements (to minimise indexing errors while coding)
 * @typedef {{
 *      topNav: CCTopNav?,
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
        kanaControls: null,
        kanaPageBody: null,
        languagePage: null,
        languagePageControls: null,
        languageNewFlyout: null,
        languageListBody: null,
    };

    /**
     * @type {AppComponents}
     */
    static components = {
        topNav: null,
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
