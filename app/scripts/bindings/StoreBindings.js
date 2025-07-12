/**
 * @template T
 * @typedef {(arg0: T) => void} Binding<T>
 */

/**
 * @typedef {Object} AppModelBindingEvent
 * @property {AnyDictionary} observableData
 * @property {*} originatingObject
 */

/**
 * @type {Binding<AppModelBindingEvent>} event
 * @this {*}
 */
let store_SearchState_OnDataChange = function(event) {
    
    let searchState = event.originatingObject.observableData;
    
    if (App.components.languageList) {
        App.components.languageList.executeSearch(
            searchState.typeFilterBitmask, 
            searchState.searchString, 
            searchState.searchType
        );
    }
}