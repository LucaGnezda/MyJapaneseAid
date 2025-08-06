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

            case "KanaPageControls_ForeignSoundExceptions":
                this.useForeignSoundExceptionsLayout();

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

            case "TopNav_HelpSelected":
                this.pageToTips();
                break;

            case "Settings_DeleteAllDataAction":
                this.deleteAllDataInitialAction();
                break;

            case "Settings_DeleteAllDataConfirmed":
                this.deleteAllDataConfirmed();
                break;   

            case "Settings_DeleteAllDataCancelled":
                this.deleteAllDataCancelled();
                break;   

            case "Settings_DeleteImportAction":
                this.importFromFile(true);
                break;

            case "Settings_AdditiveImportAction":
                this.importFromFile(false);
                break;

            case "Settings_ExportAction":
                this.exportToFile();
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
                this.updateStatistics();
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
                "LanguageItems", 
                newId, 
                payload.originatingComponent.getSimplifiedPropertybag(),
            );
        }
        else {
            Log.error("Failed to create item", "HANDLER");
        }

        // Reset and hide the component we used to initially enter the data
        App.components.newItem?.clearAll();
        App.elements.languageNewFlyout?.classList.remove("Show");
        App.components.languageListControls?.show();

        this.updateCounters(null, payload.currentData.languageType);
        this.updateStatistics();
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
            "LanguageItems", 
            payload.originatingId, 
            payload.originatingComponent.getSimplifiedPropertybag(),
        );
        this.updateCounters(payload.currentData.priorLanguageType, payload.currentData.languageType);
        this.updateStatistics();
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
            "LanguageItems", 
            payload.originatingId, 
        );
        this.updateCounters(payload.currentData.languageType, null);
        this.updateStatistics();
    }

    pageToKana() {
        App.elements.kanaPage?.classList.remove("StageLeft");
        App.elements.kanaPage?.classList.remove("StageRight");
        App.elements.languagePage?.classList.remove("StageLeft");
        App.elements.languagePage?.classList.add("StageRight");
        App.elements.settingsPage?.classList.remove("StageLeft");
        App.elements.settingsPage?.classList.add("StageRight");
        App.elements.tipsPage?.classList.remove("StageLeft");
        App.elements.tipsPage?.classList.add("StageRight");
    }

    pageToLanguage() {
        App.elements.kanaPage?.classList.add("StageLeft");
        App.elements.kanaPage?.classList.remove("StageRight");
        App.elements.languagePage?.classList.remove("StageLeft");
        App.elements.languagePage?.classList.remove("StageRight");
        App.elements.settingsPage?.classList.remove("StageLeft");
        App.elements.settingsPage?.classList.add("StageRight");
        App.elements.tipsPage?.classList.remove("StageLeft");
        App.elements.tipsPage?.classList.add("StageRight");
    }

    pageToSettings() {
        App.elements.kanaPage?.classList.add("StageLeft");
        App.elements.kanaPage?.classList.remove("StageRight");
        App.elements.languagePage?.classList.add("StageLeft");
        App.elements.languagePage?.classList.remove("StageRight");
        App.elements.settingsPage?.classList.remove("StageLeft");
        App.elements.settingsPage?.classList.remove("StageRight");
        App.elements.tipsPage?.classList.remove("StageLeft");
        App.elements.tipsPage?.classList.add("StageRight");
    }

    pageToTips() {
        App.elements.kanaPage?.classList.add("StageLeft");
        App.elements.kanaPage?.classList.remove("StageRight");
        App.elements.languagePage?.classList.add("StageLeft");
        App.elements.languagePage?.classList.remove("StageRight");
        App.elements.settingsPage?.classList.add("StageLeft");
        App.elements.settingsPage?.classList.remove("StageRight");
        App.elements.tipsPage?.classList.remove("StageLeft");
        App.elements.tipsPage?.classList.remove("StageRight");
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

    useForeignSoundExceptionsLayout() {
        App.components.kana?.setLayout(4);
    }

    showLanguageNewFlyout() {
        App.elements.languageNewFlyout?.classList.add("Show");
        App.components.languageListControls?.hide();
    }

    cancelNewItem() {
        App.elements.languageNewFlyout?.classList.remove("Show");
        App.components.languageListControls?.show();
    }

    deleteAllDataInitialAction() {
        App.elements.settingsPageDeleteAllDataInitial?.classList.add("Hide");
        App.elements.settingsPageDeleteAllDataConfirm?.classList.remove("Hide");
        App.elements.settingsPageDeleteAllDataCancel?.classList.remove("Hide");
    }
    
    deleteAllDataConfirmed() {
        App.persistentStorageService?.deleteAllKeysForThisDatabase();
        location.reload();
    }
    
    deleteAllDataCancelled() {
        App.elements.settingsPageDeleteAllDataInitial?.classList.remove("Hide");
        App.elements.settingsPageDeleteAllDataConfirm?.classList.add("Hide");
        App.elements.settingsPageDeleteAllDataCancel?.classList.add("Hide");
    }

    /**
     * @param {Boolean} [deleteCurrentDataFirst] 
     * @returns 
     */
    async importFromFile(deleteCurrentDataFirst = false) {

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
        
        // Abandon if not an object
        if (objectContents == null) {
            return;
        }

        // Abandon if the object does not match the expected schema 
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

    async exportToFile() {
        let d = new Date();
        let timestamp = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
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

        let exportableData = App.persistentStorageService?.getExportableData();

        if (exportableData) {
            await FilesystemAccessService.writeObjectAsEntireFile(savePickerOptions, exportableData);
        }
        else {
            Log.error("No exportable data was returned from the FilesystemAccessService", "HANDLER");
        }
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
        AppBootstrappingService.loadFromObject(starterData);

        location.reload();
    }

    welcomePage3Empty() {

        App.persistentStorageService?.deleteAllKeysForThisDatabase();
        AppBootstrappingService.initialiseLocalCacheDatabase();

        App.elements.appForeground?.classList.remove("Hide");
        App.elements.welcomeModal?.classList.remove("Show");
    }

    /**
     * @param {Number | Null} fromLanguageType 
     * @param {Number | Null} toLanguageType 
     */
    updateCounters(fromLanguageType, toLanguageType) {
        if (fromLanguageType != null && Number.isInteger(fromLanguageType)) {
            switch(fromLanguageType) {
                case 0:
                    App.propertyBag.wordCount--;
                    break;
                case 1:
                    App.propertyBag.phraseCount--;
                    break;
                case 2:
                    App.propertyBag.sentenceCount--;
                    break;
                default:
                    // Do nothing
            }
        }

        if (toLanguageType != null && Number.isInteger(toLanguageType)) {
            switch(toLanguageType) {
                case 0:
                    App.propertyBag.wordCount++;
                    break;
                case 1:
                    App.propertyBag.phraseCount++;
                    break;
                case 2:
                    App.propertyBag.sentenceCount++;
                    break;
                default:
                    // Do nothing
            }
        }
    }

    updateStatistics() {
        /** @type {HTMLDivElement} */ (App.elements.settingsPageWordCount).innerText = App.propertyBag.wordCount.toString();
        /** @type {HTMLDivElement} */ (App.elements.settingsPagePhraseCount).innerText = App.propertyBag.phraseCount.toString();
        /** @type {HTMLDivElement} */ (App.elements.settingsPageSentenceCount).innerText = App.propertyBag.sentenceCount.toString();
        /** @type {HTMLDivElement} */ (App.elements.settingsPageTotalCount).innerText = (App.propertyBag.wordCount + App.propertyBag.phraseCount + App.propertyBag.sentenceCount).toString();
        /** @type {HTMLDivElement} */ (App.elements.settingsPageLastModifiedDate).innerText = App.persistentStorageService?.lastmodified?.toDateString() || "#";
        /** @type {HTMLDivElement} */ (App.elements.settingsPageLastModifiedTime).innerText = App.persistentStorageService?.lastmodified?.toLocaleTimeString() || "#";
    }
}
