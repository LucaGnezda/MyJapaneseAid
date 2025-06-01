/**
 * @class
 * @public
 * @constructor
 */
class ComponentRegistry {
    /**
     * Adds all of the apps custom components as custom elements
     * @static
     * @returns {void}
     */
    static registerComponents() {
        
        // Register your components here...
        customElements.define("cc-search", CCSearch);
        customElements.define("cc-searchableitem", CCSearchableItem);  
    }
}
