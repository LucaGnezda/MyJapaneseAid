/**
 * @class
 * @public
 * @constructor
 */
class AppActionHandler {

    /**
     * @param {Action} action 
     */
    route(action) {

        Log.debug(`${this.constructor.name} processing event ${action.type}`, "HANDLER");

        switch (action.type) {
            case "App_ApplySearch":
                this.applySearch(action.payload);
                break;

            case "App_Item_DataUpdate":
                this.itemUpdate(action.payload);
                break;

            default:
                // do nothing
        }
    }

    /**
     * @param {*} payload 
     * @returns {void}
     */
    applySearch(payload) {
        Log.info(payload.searchString + " | " + payload.searchType + " | " + payload.searchScope, "HANDLER");
    }

    /**
     * @param {*} payload 
     * @returns {void}
     */
    itemUpdate(payload) {
        payload;
    }
}