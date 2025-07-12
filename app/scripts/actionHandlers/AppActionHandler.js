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
            case "LanguagePageControls_ApplySearch":
                this.applySearch(action.payload);
                break;

            case "LanguagePageControls_ApplyLanguageTypeFilter":
                this.applyFilter(action.payload);
                break;

            case "TopNav_KanaSelected":
                this.pageToKana();
                break;

            case "TopNav_LanguageSelected":
                this.pageToLanguage();
                break;

            case "LanguageListControls_NewItem":
                this.showLanguageNewFlyout();
                break;

            case "NewItem_Confirm":
                this.addToLanguageList(action.payload.currentData);
                break;

            case "NewItem_Cancel":
                this.cancelNewItem();
                break;

            case "ExistingItem_Update":
                this.itemUpdate(action.payload);
                break;

            case "ExistingItem_DeleteRequest":
                this.itemDelete();
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
        Log.info(payload.searchString + " | " + payload.searchType, "HANDLER");
        if (App.store){
            App.store.searchState.observableData.searchString = payload.searchString;
            App.store.searchState.observableData.searchType = payload.searchType;
            App.store.emitNotifications();
        }
    }

    /**
     * @param {*} payload 
     * @returns {void}
     */
    applyFilter(payload) {
        Log.info(payload.groupSelectionStates, "HANDLER");
        if (App.store){
            App.store.searchState.observableData.typeFilterBitmask = payload.groupSelectionBitmask;
            App.store.emitNotifications();
        }
    }

    /**
     * @param {*} payload 
     * @returns {void}
     */
    itemUpdate(payload) {
        App.components.languageList?.moveItem(
            payload.originatingId, 
            payload.currentData.priorGojuonKey, 
            payload.currentData.gojuonKey
        );
    }

    itemDelete() {

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
        App.components.languageList?.addItem(
            payload, 
            App.dispatcher?.newEventDispatchCallback("ExistingItem_Update"),
            null,
            App.dispatcher?.newEventDispatchCallback("ExistingItem_DeleteRequest"),
        );
    }

    cancelNewItem() {
        App.elements.languageNewFlyout?.classList.remove("Show");
        App.components.languageListControls?.show();
    }
}