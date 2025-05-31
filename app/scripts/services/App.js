/**
 * List of valid Demo Elements (to minimise indexing errors while coding)
 * @typedef {{searchComponent: CCSearch?}} AppComponents
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
        searchComponent: null
    };
}
