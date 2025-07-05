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

            case "TopNav_KanaSelected":
                this.pageToKana();
                break;

            case "TopNav_LanguageSelected":
                this.pageToLanguage();
                break;

            case "LanguageControls_NewItem":
                this.showLanguageNewFlyout();
                break;

            case "NewItem_Confirm":
                this.addToLanguageList(action.payload.currentData);
                break;

            case "NewItem_Cancel":
                this.cancelNewItem();
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

    pageToKana() {
        App.elements.kanaPage?.classList.remove("StageLeft");
        App.elements.kanaPage?.classList.remove("StageRight");
        App.elements.languagePage?.classList.add("StageRight");
    }

    pageToLanguage() {
        App.elements.kanaPage?.classList.add("StageLeft");
        App.elements.languagePage?.classList.remove("StageLeft");
        App.elements.languagePage?.classList.remove("StageRight");
    }

    showLanguageNewFlyout() {
        App.elements.languageNewFlyout?.classList.add("Show");
        App.components.languageListControls?.hide();
    }

    /**
     * @param {CCLanguageItemPropertyBag} payload 
     * @returns {void}
     */
    addToLanguageList(payload) {
        App.components.languageList?.addItem(payload);
    }

    cancelNewItem() {
        App.elements.languageNewFlyout?.classList.remove("Show");
        App.components.languageListControls?.show();
    }
}