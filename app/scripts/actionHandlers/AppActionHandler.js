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

            case "KanaPageControls_ShowHiragana":
                this.showHiragana();
                break;

            case "KanaPageControls_ShowKatakana":
                this.showKatakana();
                break;

            case "KanaPageControls_SimpleLayout":
                this.useSimpleKanaLayout();
                break;

            case "KanaPageControls_QuadrantLayout":
                this.useQuadrantKanaLayout();
                break;

            case "KanaPageControls_SectionLayout":
                this.useSectionKanaLayout();
                break;

            case "KanaPageControls_GojuonLayout":
                this.useGojuonKanaLayout();
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

            case "TopNav_SettingsSelected":
                this.pageToSettings();
                break;

            case "Settings_DeleteAllDataAction":
                this.settingsDeleteAllDataInitialAction();
                break;

            case "Settings_DeleteAllDataConfirmed":
                this.settingsDeleteAllDataConfirmed();
                break;   

            case "Settings_DeleteAllDataCancelled":
                this.settingsDeleteAllDataCancelled();
                break;   

            case "Settings_DeleteImportAction":
                this.settingsImport(true);
                break;

            case "Settings_AdditiveImportAction":
                this.settingsImport(false);
                break;

            case "Settings_ExportAction":
                this.settingsExport();
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

            case "App_UpdateCountDisplay":
                this.updateCountDisplay();
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
        if (payload.currentData.gojuonKey != payload.currentData.priorGojuonKey) {
            App.persistentStorageService?.delete(
                payload.currentData.priorGojuonKey, 
                payload.originatingId, 
            );
        }
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
        App.elements.languagePage?.classList.remove("StageLeft");
        App.elements.languagePage?.classList.add("StageRight");
        App.elements.settingsPage?.classList.remove("StageLeft");
        App.elements.settingsPage?.classList.add("StageRight");
    }

    pageToLanguage() {
        App.elements.kanaPage?.classList.add("StageLeft");
        App.elements.kanaPage?.classList.remove("StageRight");
        App.elements.languagePage?.classList.remove("StageLeft");
        App.elements.languagePage?.classList.remove("StageRight");
        App.elements.settingsPage?.classList.remove("StageLeft");
        App.elements.settingsPage?.classList.add("StageRight");
    }

    pageToSettings() {
        App.elements.kanaPage?.classList.add("StageLeft");
        App.elements.kanaPage?.classList.remove("StageRight");
        App.elements.languagePage?.classList.add("StageLeft");
        App.elements.languagePage?.classList.remove("StageRight");
        App.elements.settingsPage?.classList.remove("StageLeft");
        App.elements.settingsPage?.classList.remove("StageRight");
    }

    showHiragana() {
        App.components.kana?.setHiragana();
    }

    showKatakana() {
        App.components.kana?.setKatakana();
    }

    useSimpleKanaLayout() {
        App.components.kana?.setLayout(0);
    }

    useQuadrantKanaLayout() {
        App.components.kana?.setLayout(1);
    }

    useSectionKanaLayout() {
        App.components.kana?.setLayout(2);
    }

    useGojuonKanaLayout() {
        App.components.kana?.setLayout(3);
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

        // Add to list
        let newId = App.components.languageList?.addItem(
            payload.currentData, 
            App.dispatcher?.newEventDispatchCallback("ExistingItem_Update"),
            null,
            App.dispatcher?.newEventDispatchCallback("ExistingItem_DeleteRequest"),
        );

        // Save to local store
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

        // Reset new
        App.components.newItem?.clearAll();

        // Hide new
        App.elements.languageNewFlyout?.classList.remove("Show");
        App.components.languageListControls?.show();
    }

    cancelNewItem() {
        App.elements.languageNewFlyout?.classList.remove("Show");
        App.components.languageListControls?.show();
    }

    settingsDeleteAllDataInitialAction() {
        App.elements.settingsPageDeleteAllDataInitial?.classList.add("Hide");
        App.elements.settingsPageDeleteAllDataConfirm?.classList.remove("Hide");
        App.elements.settingsPageDeleteAllDataCancel?.classList.remove("Hide");
    }
    
    settingsDeleteAllDataConfirmed() {
        App.persistentStorageService?.deleteAllKeysForThisDatabase();
        location.reload();
    }
    
    settingsDeleteAllDataCancelled() {
        App.elements.settingsPageDeleteAllDataInitial?.classList.remove("Hide");
        App.elements.settingsPageDeleteAllDataConfirm?.classList.add("Hide");
        App.elements.settingsPageDeleteAllDataCancel?.classList.add("Hide");
    }

    /**
     * @param {Boolean} [deleteCurrentDataFirst] 
     * @returns 
     */
    async settingsImport(deleteCurrentDataFirst = false) {

        let openPickerOptions = {
            startIn: "downloads",
            excludeAcceptAllOption: true,
            multiple: false,
            types: [{
                description: 'JSON Files',
                accept: {
                    'application/json': ['.json'],
                },
            }],
        };
        
        let objectContents = await FilesystemAccessService.readEntireFileAsObject(openPickerOptions);
        
        if (objectContents == null) {
            return;
        }
        if (!AppBootstrappingService.validateObjectForLoading(objectContents)){
            return;
        }

        if (deleteCurrentDataFirst) {
            App.persistentStorageService?.deleteAllKeysForThisDatabase();
        }

        AppBootstrappingService.initialiseLocalCacheDatabase();
        AppBootstrappingService.loadFromObject(objectContents);
        location.reload();
    }

    async settingsExport() {
        let d = new Date();
        let timestamp = d.toISOString().split("T")[0];
        let suggestedFilename = `MyJapaneseAid LocalDB Export ${timestamp}.json`;
        let savePickerOptions = {
            startIn: "downloads",
            suggestedName: suggestedFilename,
            types: [{
                description: 'JSON Files',
                accept: {
                    'application/json': ['.json'],
                },
            }],
        };

        await FilesystemAccessService.writeObjectAsEntireFile(savePickerOptions, localStorage);
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
        AppBootstrappingService.loadFromObject(starterData, true);

        location.reload();
    }

    welcomePage3Empty() {

        App.persistentStorageService?.deleteAllKeysForThisDatabase();
        AppBootstrappingService.initialiseLocalCacheDatabase();

        App.elements.appForeground?.classList.remove("Hide");
        App.elements.welcomeModal?.classList.remove("Show");
    }

    updateCountDisplay() {
        /** @type {HTMLDivElement} */ (App.elements.settingsPageWordCount).innerText = App.propertyBag.wordCount.toString();
        /** @type {HTMLDivElement} */ (App.elements.settingsPagePhraseCount).innerText = App.propertyBag.phraseCount.toString();
        /** @type {HTMLDivElement} */ (App.elements.settingsPageSentenceCount).innerText = App.propertyBag.sentenceCount.toString();
    }
}
