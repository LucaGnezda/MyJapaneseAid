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
        customElements.define("cc-buttonstrip", CCButtonStrip);
        customElements.define("cc-kana", CCKana);
        customElements.define("cc-search", CCSearch);
        customElements.define("cc-languageitem", CCLanguageItem);
        customElements.define("cc-languageitemlist", CCLanguageItemList);    
        customElements.define("cc-topnav", CCTopNav); 
    }
}
