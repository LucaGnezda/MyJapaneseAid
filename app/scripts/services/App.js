/**
 * List of valid Demo Elements (to minimise indexing errors while coding)
 * @typedef {{
 *      searchComponent: CCSearch?,
 *      testItem: CCLanguageItem?,
 *      testItemList: CCLanguageItemList?,
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
        // Place variables here that hold references to elements you frequently need.
    };

    /**
     * @type {AppComponents}
     */
    static components = {
        searchComponent: null,
        testItem: null,
        testItemList: null,
    };
}
