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
                this.ItemInsert(action.payload);
                break;

            case "NewItem_Cancel":
                this.cancelNewItem();
                break;

            case "ExistingItem_Update":
                this.itemUpdate(action.payload);
                break;

            case "ExistingItem_DeleteRequest":
                this.itemDelete(action.payload);
                break;

            case "App_Welcome":
                this.startWelcomeFlow();
                break;

            case "Welcome_Page1_Next":
                this.welcomePage1Next();
                break;

            case "Welcome_Page2_Back":
                this.welcomePage2Back();
                break;

            case "Welcome_Page2_Yes":
                this.welcomePage2Yes();
                break;

            case "Welcome_Page2_No":
                this.welcomePage2No();
                break;

            case "Welcome_Page3_Back":
                this.welcomePage3Back();
                break;

            case "Welcome_Page3_Starter":
                this.welcomePage3Starter();
                break;

            case "Welcome_Page3_Empty":
                this.welcomePage3Empty();
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
        App.persistentStorageService?.upsert(
            payload.currentData.gojuonKey, 
            payload.originatingId, 
            payload.currentData
        );
    }

    /**
     * @param {*} payload 
     * @returns {void}
     */
    itemDelete(payload) {
        App.components.languageList?.removeItem(
            payload.originatingId,
            payload.currentData.priorGojuonKey
        );
        App.persistentStorageService?.delete(
            payload.currentData.gojuonKey, 
            payload.originatingId, 
        );
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
     * @param {*} payload 
     * @returns {void}
     */
    ItemInsert(payload) {
        let newId = App.components.languageList?.addItem(
            payload.currentData, 
            App.dispatcher?.newEventDispatchCallback("ExistingItem_Update"),
            null,
            App.dispatcher?.newEventDispatchCallback("ExistingItem_DeleteRequest"),
        );
        if (newId) {
            App.persistentStorageService?.upsert(
                payload.currentData.gojuonKey, 
                newId, 
                payload.currentData
            );
        }
        else {
            Log.error("Failed to create item", "HANDLER");
        }
    }

    cancelNewItem() {
        App.elements.languageNewFlyout?.classList.remove("Show");
        App.components.languageListControls?.show();
    }

    startWelcomeFlow() {
        App.elements.appForeground?.classList.add("Hide");
        App.elements.welcomeModal?.classList.add("Show");
    }

    welcomePage1Next() {
        App.elements.welcomeModalPage1?.classList.add("StageLeft");
        App.elements.welcomeModalPage2?.classList.remove("StageRight");
    }

    welcomePage2Back() {
        App.elements.welcomeModalPage1?.classList.remove("StageLeft");
        App.elements.welcomeModalPage2?.classList.add("StageRight");
    }

    welcomePage2Yes() {
        App.elements.welcomeModalPage2?.classList.add("StageLeft");
        App.elements.welcomeModalPage3?.classList.remove("StageRight");
    }

    welcomePage2No() {
        history.back();
    }

    welcomePage3Back() {
        App.elements.welcomeModalPage2?.classList.remove("StageLeft");
        App.elements.welcomeModalPage3?.classList.add("StageRight");
    }

    welcomePage3Starter() {

        AppBootstrappingService.initialiseLocalCacheDatabase();
        AppBootstrappingService.addStarterContent();
        AppBootstrappingService.loadFromPersistentStorage();

        App.elements.appForeground?.classList.remove("Hide");
        App.elements.welcomeModal?.classList.remove("Show");
    }

    welcomePage3Empty() {

        AppBootstrappingService.initialiseLocalCacheDatabase();

        App.elements.appForeground?.classList.remove("Hide");
        App.elements.welcomeModal?.classList.remove("Show");
    }
}