/**
 * @class
 * @public
 */
class AppBootstrappingService {

    static Initialise() {

        Log.setLoggingLevel(App.config.loggingLevel);
        Log.debug("AppService.Initialise - Begin", "BOOTSTRAPSERVICE");

        // Offline Cache
        

        // Bootstrap
        OfflineCaching.registerServiceWorker("./OfflineCacheWorker.js");
        ComponentRegistry.registerComponents();
        AppBootstrappingService.indexDOM();
        AppBootstrappingService.loadFragementsFromDOMData("HTMLFragments");
        AppBootstrappingService.initialiseStore();
        AppBootstrappingService.initialiseDispatchers();
        AppBootstrappingService.initialisePersistentStorageService();

        // Build and initialise the UX
        AppBootstrappingService.initialiseUX();

        // Add Data to Store and propogate it to components
        AppBootstrappingService.loadStore();
        AppBootstrappingService.attachStoreSubscribers();

        // First time flow
        if (App.persistentStorageService && !App.persistentStorageService.isConnected()) {
            AppBootstrappingService.initialiseWelcomeUX();
            App.dispatcher?.dispatch(new Action("App_Welcome", null));
        }
        else {
            // Load from persistent storage
            AppBootstrappingService.initialiseLocalCacheDatabase();
            AppBootstrappingService.loadFromPersistentStorage();
            App.dispatcher?.dispatch(new Action("App_UpdateCountDisplay", null));
        }

        Log.debug("AppService.Initialise - Complete", "BOOTSTRAPSERVICE");
    }

    static indexDOM() {

        // Index any of the html you keep needing (don't forget to define it in the App obect first)
        // for example:
        //    App.elements["MyListContainer"] = document.getElementById("MyListContainer");

        let mapping = [
            {id: "AppForeground", objProperty: "appForeground"},
            {id: "TopNavContainer", objProperty: "topNavContainer"},
            {id: "KanaPage", objProperty: "kanaPage"},
            {id: "KanaPageControls", objProperty: "kanaPageControls"},
            {id: "KanaPageBody", objProperty: "kanaPageBody"},
            {id: "LanguagePage", objProperty: "languagePage"},
            {id: "LanguagePageControls", objProperty: "languagePageControls"},
            {id: "LanguageNewFlyout", objProperty: "languageNewFlyout"},
            {id: "LanguageListBody", objProperty: "languageListBody"},
            {id: "SettingsPage", objProperty: "settingsPage"},
            {id: "SettingsWordcount", objProperty: "settingsPageWordCount"},
            {id: "SettingsPhrasecount", objProperty: "settingsPagePhraseCount"},
            {id: "SettingsSentencecount", objProperty: "settingsPageSentenceCount"},
            {id: "SettingsTotalcount", objProperty: "settingsPageTotalCount"},
            {id: "SettingsLastModifiedDate", objProperty: "settingsPageLastModifiedDate"},
            {id: "SettingsLastModifiedTime", objProperty: "settingsPageLastModifiedTime"},
            {id: "AppSettingsDeleteData", objProperty: "settingsPageDeleteAllDataInitial"},
            {id: "AppSettingsDeleteDataConfirm", objProperty: "settingsPageDeleteAllDataConfirm"},
            {id: "AppSettingsDeleteDataCancel", objProperty: "settingsPageDeleteAllDataCancel"},
            {id: "AppSettingsDeleteImport", objProperty: "settingsPageDeleteImport"},
            {id: "AppSettingsAdditiveImport", objProperty: "settingsPageAdditiveImport"},
            {id: "AppSettingsExport", objProperty: "settingsPageExport"},
            {id: "AppSettingHiddenElements", objProperty: "settingsPageHiddenElements"},
            {id: "TipsPage", objProperty: "tipsPage"},
            {id: "AppWelcome", objProperty: "welcomeModal"},
            {id: "AppWelcomePage1", objProperty: "welcomeModalPage1"},
            {id: "AppWelcomePage2", objProperty: "welcomeModalPage2"},
            {id: "AppWelcomePage3", objProperty: "welcomeModalPage3"},
            {id: "AppWelcomePage1Next", objProperty: "welcomeModalPage1Next"},
            {id: "AppWelcomePage2Back", objProperty: "welcomeModalPage2Back"},
            {id: "AppWelcomePage2Yes", objProperty: "welcomeModalPage2Yes"},
            {id: "AppWelcomePage2No", objProperty: "welcomeModalPage2No"},
            {id: "AppWelcomePage3Back", objProperty: "welcomeModalPage3Back"},
            {id: "AppWelcomePage3Starter", objProperty: "welcomeModalPage3Starter"},
            {id: "AppWelcomePage3Empty", objProperty: "welcomeModalPage3Empty"},
            {id: "AppWelcomePage3Empty", objProperty: "welcomeModalPage3Empty"},
        ]

        for (let m of mapping) {
            if (App.elements[m.objProperty] === undefined) {
                Log.fatal(`DOM indexing mapping error, ${m.objProperty} is not a property of App.elements`, "BOOTSTRAPSERVICE", this);
                return;
            } 

            App.elements[m.objProperty] = document.getElementById(m.id);

            if (App.elements[m.objProperty] === null) {
                Log.fatal(`DOM indexing mapping error, ID ${m.id} could not be is not be found in the DOM`, "BOOTSTRAPSERVICE", this);
                return;
            } 
        }
    }

    /**
     * @param {String} rootDataKey 
     */
    static loadFragementsFromDOMData(rootDataKey) {

        let mapping = [
            {dataKey: "AppTitle", objProperty: "appTitle"},
        ]

        let fragmentSource = document.querySelector(`data[value='${rootDataKey}']`);

        if (!fragmentSource) {
            Log.fatal("Unable to find fragment Source", "BOOTSTRAPSERVICE", this);
            return;
        }

        for (let m of mapping) {
            /** @type {HTMLElement & {firstElementChild: HTMLElement} | null} */
            let data = fragmentSource.querySelector(`data[value='${m.dataKey}']`);
            if (data) {
                App.fragments[m.objProperty] = data.firstElementChild;
            }
        }

        fragmentSource.remove();
    }

    static initialiseStore() {
        // Create Store & Observables
        App.store = new Store(NotificationMode.ObjectNotifyOnEmit, NotificationStatus.Default);

    }

    static initialiseDispatchers() {
        // Initialise event processing
        App.dispatcher = new Dispatcher();
        App.dispatcher.addDispatchHandler(new AppActionHandler(), "route");

        // Now add your action handlers
        // For example:
        //    App.dispatcher.addDispatchHandler(new MyGameHandler(), "route");
    
    }

    static initialisePersistentStorageService() {

        App.persistentStorageService = new PersistentStorageService();
        App.persistentStorageService.connect("MyJapaneseAid");

    }

    static initialiseUX() {

        if (!App.dispatcher || !App.store || !Object.values(App.elements).every(x => x != null)) {
            Log.fatal("The Store, Dispatcher and DOM indexing must be initialised before Core UI", "BOOTSTRAPSERVICE", this)
            return;
        }

        if (App.elements.topNavContainer) {
            App.components.topNav = new CCTopNav(true, false);
            App.components.topNav.addTab("Kana", App.dispatcher.newEventDispatchCallback("TopNav_KanaSelected"));
            App.components.topNav.addTab("Language", App.dispatcher.newEventDispatchCallback("TopNav_LanguageSelected"));
            App.components.topNav.addImageTab("./app/assets/svg/settings.svg", App.dispatcher.newEventDispatchCallback("TopNav_SettingsSelected"));
            App.components.topNav.addImageTab("./app/assets/svg/question.svg", App.dispatcher.newEventDispatchCallback("TopNav_HelpSelected"));
            App.components.topNav.setExpandableSpacing(true, false);
            App.components.topNav.setLeftContent(App.fragments.appTitle);
            App.components.topNav.selectIndex(1);

            App.elements.topNavContainer.appendChild(App.components.topNav);
        }

        if (App.elements.kanaPageControls) {
            App.components.kanaPageControls = new CCButtonStrip(true, false);
            App.components.kanaPageControls.setHorizontalLayout();
            App.components.kanaPageControls.newButtonGroup(CCButtonStripGroupBehaviour.SingleSelectGroup);
            App.components.kanaPageControls.addTextButton("Hiragana", App.dispatcher.newEventDispatchCallback("KanaPageControls_ShowHiragana"), true);
            App.components.kanaPageControls.addTextButton("Katakana", App.dispatcher.newEventDispatchCallback("KanaPageControls_ShowKatakana"), false);
            App.components.kanaPageControls.addSpacer();
            App.components.kanaPageControls.newButtonGroup(CCButtonStripGroupBehaviour.SingleSelectGroup);
            App.components.kanaPageControls.addImageButton("./app/assets/svg/square.svg", App.dispatcher.newEventDispatchCallback("KanaPageControls_SimpleLayout"), true);
            App.components.kanaPageControls.addImageButton("./app/assets/svg/grid.svg", App.dispatcher.newEventDispatchCallback("KanaPageControls_QuadrantLayout"), false);
            App.components.kanaPageControls.addImageButton("./app/assets/svg/rows.svg", App.dispatcher.newEventDispatchCallback("KanaPageControls_SectionLayout"), false);
            App.components.kanaPageControls.addImageButton("./app/assets/svg/table.svg", App.dispatcher.newEventDispatchCallback("KanaPageControls_GojuonLayout"), false);
            App.components.kanaPageControls.addImageButton("./app/assets/svg/alert-triangle.svg", App.dispatcher.newEventDispatchCallback("KanaPageControls_ForeignSoundExceptions"), false);

            App.elements.kanaPageControls.appendChild(App.components.kanaPageControls);
        }
        
        if (App.elements.kanaPageBody) {
            App.components.kana = new CCKana(true, false);

            App.elements.kanaPageBody.appendChild(App.components.kana);
        }

        if (App.elements.languagePageControls) {
            App.components.searchComponent = new CCSearch(true, false);
            App.components.searchComponent.attachOnChangeDebouncedCallback(App.dispatcher.newEventDispatchCallback("LanguagePageControls_ApplySearch"));

            App.components.languagePageControls = new CCButtonStrip(true, false);
            App.components.languagePageControls.setHorizontalLayout();
            App.components.languagePageControls.newButtonGroup(CCButtonStripGroupBehaviour.MultiSelectGroup);
            App.components.languagePageControls.addTextButton("Words", App.dispatcher.newEventDispatchCallback("LanguagePageControls_ApplyLanguageTypeFilter"), true);
            App.components.languagePageControls.addTextButton("Phrases", App.dispatcher.newEventDispatchCallback("LanguagePageControls_ApplyLanguageTypeFilter"), true);
            App.components.languagePageControls.addTextButton("Sentences", App.dispatcher.newEventDispatchCallback("LanguagePageControls_ApplyLanguageTypeFilter"), true);
            App.components.languagePageControls.addCustomComponent(App.components.searchComponent);

            App.elements.languagePageControls.appendChild(App.components.languagePageControls);
        }

        if (App.elements.languageNewFlyout) {
            App.components.newItem = new CCLanguageItem(true, false);
            App.components.newItem.permanentEdit();
            App.components.newItem.attachSaveCallback(App.dispatcher.newEventDispatchCallback("NewItem_Confirm"));
            App.components.newItem.attachCancelCallback(App.dispatcher.newEventDispatchCallback("NewItem_Cancel"));

            App.elements.languageNewFlyout.appendChild(App.components.newItem);
        }

        if (App.elements.languageListBody) {
            App.components.languageListControls = new CCButtonStrip(true, false);
            App.components.languageListControls.setHorizontalLayout();
            App.components.languageListControls.newButtonGroup(CCButtonStripGroupBehaviour.StatelessIndividual);
            App.components.languageListControls.addImageButton("./app/assets/svg/plus.svg", App.dispatcher.newEventDispatchCallback("LanguageListControls_NewItem"));

            App.components.languageList = new CCLanguageItemList(true, false);
            App.components.languageList.title = "Language Dictionary";
            App.components.languageList.addControls(App.components.languageListControls);

            App.elements.languageListBody.appendChild(App.components.languageList);
        }

        if (App.elements.settingsPageDeleteAllDataInitial &&
            App.elements.settingsPageDeleteAllDataConfirm &&
            App.elements.settingsPageDeleteAllDataCancel &&
            App.elements.settingsPageDeleteImport &&
            App.elements.settingsPageAdditiveImport &&
            App.elements.settingsPageExport) {

            App.elements.settingsPageDeleteAllDataInitial.addEventListener("click", App.dispatcher.newEventDispatchCallback("Settings_DeleteAllDataAction"));
            App.elements.settingsPageDeleteAllDataConfirm.addEventListener("click", App.dispatcher.newEventDispatchCallback("Settings_DeleteAllDataConfirmed"));
            App.elements.settingsPageDeleteAllDataCancel.addEventListener("click", App.dispatcher.newEventDispatchCallback("Settings_DeleteAllDataCancelled"));
            App.elements.settingsPageDeleteImport.addEventListener("click", App.dispatcher.newEventDispatchCallback("Settings_DeleteImportAction"));
            App.elements.settingsPageAdditiveImport.addEventListener("click", App.dispatcher.newEventDispatchCallback("Settings_AdditiveImportAction"));
            App.elements.settingsPageExport.addEventListener("click", App.dispatcher.newEventDispatchCallback("Settings_ExportAction"));
        }

        if (!("showOpenFiePicker" in window)) {

        }

        if (!("showSaveFiePicker" in window)) {

        }

        if (App.elements.appForeground) {
            App.elements.appForeground.classList.remove("Hide");
        }
    }

    static loadStore() {

        if (!App.store) {
            Log.fatal("App Store must be initialised before Store content can be loaded", "BOOTSTRAPSERVICE", this);
            return;
        }

        App.store.addObservable("searchState");

        App.store.searchState.observableData.typeFilterBitmask = App.components.languagePageControls?.getSelectionBitmaskForGroup(0);
        App.store.searchState.observableData.searchString = "";
        App.store.searchState.observableData.searchType = null;
        
    }

    static attachStoreSubscribers() {

        if (!App.store) {
            Log.fatal("App Store must be initialised before Store content can be loaded", "BOOTSTRAPSERVICE", this);
            return;
        }

        App.store.searchState.addSubscriber(App.components.languageList, store_SearchState_OnDataChange);

    }

    static initialiseWelcomeUX() {

        if (!App.dispatcher) {
            Log.fatal("The Store, Dispatcher and DOM indexing must be initialised before Core UI", "BOOTSTRAPSERVICE", this)
            return;
        }

        if (App.elements.welcomeModalPage1Next) { App.elements.welcomeModalPage1Next.addEventListener("click", App.dispatcher.newEventDispatchCallback("Welcome_Page1_Next")); }
        if (App.elements.welcomeModalPage2Back) { App.elements.welcomeModalPage2Back.addEventListener("click", App.dispatcher.newEventDispatchCallback("Welcome_Page2_Back")); }
        if (App.elements.welcomeModalPage2Yes) { App.elements.welcomeModalPage2Yes.addEventListener("click", App.dispatcher.newEventDispatchCallback("Welcome_Page2_Yes")); }
        if (App.elements.welcomeModalPage2No) { App.elements.welcomeModalPage2No.addEventListener("click", App.dispatcher.newEventDispatchCallback("Welcome_Page2_No")); }
        if (App.elements.welcomeModalPage3Back) { App.elements.welcomeModalPage3Back.addEventListener("click", App.dispatcher.newEventDispatchCallback("Welcome_Page3_Back")); }
        if (App.elements.welcomeModalPage3Starter) { App.elements.welcomeModalPage3Starter.addEventListener("click", App.dispatcher.newEventDispatchCallback("Welcome_Page3_Starter")); }
        if (App.elements.welcomeModalPage3Empty) { App.elements.welcomeModalPage3Empty.addEventListener("click", App.dispatcher.newEventDispatchCallback("Welcome_Page3_Empty")); }
    }

    static initialiseLocalCacheDatabase() {

        if (!App.persistentStorageService) {
            Log.fatal("The Persistent Storage Service, must be initialised before initialising the database", "BOOTSTRAPSERVICE", this)
            return;
        }

        if (navigator.storage && navigator.storage.persist) {
            navigator.storage.persist().then((persistent) => {
                if (persistent) {
                    Log.debug("Storage will not be cleared except by explicit user action", "BOOTSTRAPSERVICE");
                } 
                else {
                    Log.debug("Storage may be cleared by the UA under storage pressure.", "BOOTSTRAPSERVICE");
                }
            });
        }

        if (!App.persistentStorageService.connect("MyJapaneseAid")) {
            App.persistentStorageService.connect("MyJapaneseAid", true);
        }
    }

    /**
     * @param {Object} partlyDecodedJSONObject
     * @returns {Boolean} 
     */
    static validateObjectForLoading(partlyDecodedJSONObject) {

        let contents, key

        try {
            for (key in partlyDecodedJSONObject) {
                /** @ts-ignore - Yes JSDoc ... you can index an object by string */
                contents = JSON.parse(partlyDecodedJSONObject[key]);

                if (
                    contents && typeof contents === 'object' && 
                    contents.hasOwnProperty('schemaversion') && (typeof contents.schemaversion === "string" || contents.schemaversion instanceof String) &&
                    contents.hasOwnProperty('lastmodified') 
                    /** @ts-ignore - Yes this is ok for this purpose */
                    /*!isNaN(new Date(contents.lastmodified))*/) {
                    
                    Log.info(`File contents key ${key} is a valid database definition`, "BOOTSTRAPSERVICE");
                }
                else if (
                    typeof contents == 'object' &&
                    contents.hasOwnProperty("languageType") && typeof contents.languageType === "number" &&
                    contents.hasOwnProperty("kana") && (typeof contents.kana === "string" || contents.kana instanceof String) &&
                    contents.hasOwnProperty("kanaHighlighterString") && (typeof contents.kanaHighlighterString === "string" || contents.kanaHighlighterString instanceof String) &&
                    contents.hasOwnProperty("romaji") && (typeof contents.romaji === "string" || contents.romaji instanceof String) &&
                    contents.hasOwnProperty("romajiHighlighterString") && (typeof contents.romajiHighlighterString === "string" || contents.romajiHighlighterString instanceof String) &&
                    contents.hasOwnProperty("meaning") && (typeof contents.meaning === "string" || contents.meaning instanceof String) &&
                    contents.hasOwnProperty("meaningHighlighterString") && (typeof contents.meaningHighlighterString === "string" || contents.meaningHighlighterString instanceof String) &&
                    contents.hasOwnProperty("literal") && (typeof contents.literal === "string" || contents.literal instanceof String) &&
                    contents.hasOwnProperty("structure") && (typeof contents.structure === "string" || contents.structure instanceof String) &&
                    contents.hasOwnProperty("notes") && (typeof contents.notes === "string" || contents.notes instanceof String) &&
                    contents.hasOwnProperty("examples") && Array.isArray(contents.examples)) {
                    
                    Log.info(`File contents key ${key} is a valid item`, "BOOTSTRAPSERVICE");
                }
                else {
                    Log.error(`Unexpected contents found within key ${key}, unable to load file`, "BOOTSTRAPSERVICE");
                    return false;
                }
            }
        }
        catch {
            Log.error(`Unexpected contents found within key ${key}, unable to load file`, "BOOTSTRAPSERVICE");
            return false;
        }
        return true;
    }

    /**
     * @param {Object} partlyDecodedJSONObject
     */
    static loadFromObject(partlyDecodedJSONObject) { //, demunge = false) {
        for (let key in partlyDecodedJSONObject) {
            /** @ts-ignore - Yes JSDoc ... you can index an object by string */
            let contents = JSON.parse(partlyDecodedJSONObject[key]);
            if (typeof contents == 'object' && contents.hasOwnProperty("kana") && contents.hasOwnProperty("romaji")) {
                //if (demunge) {
                //    contents.kana = UnicodeService.demunge(contents.kana);
                //    contents.romaji = UnicodeService.demunge(contents.romaji);
                //
                //    for (let egKey in contents.examples) {
                //        contents.examples[egKey].kana = UnicodeService.demunge(contents.examples[egKey].kana);
                //    }
                //}
                localStorage.setItem(key, JSON.stringify(contents));
            }
        }
    }

    static loadFromPersistentStorage() {

        if (!App.persistentStorageService) {
            Log.fatal("Persistent Storage Service must be initialised before content can be loaded", "BOOTSTRAPSERVICE", this);
            return;
        }

        App.persistentStorageService.newTableCursor("LanguageItems");
        
        let i = 0;
        let id = App.persistentStorageService.readCurrentKeyFromCursor();
        let item = App.persistentStorageService.readNextFromCursor();

        while (id != null) {
            App.components.languageList?.addItem(
                item, 
                App.dispatcher?.newEventDispatchCallback("ExistingItem_Update"),
                null,
                App.dispatcher?.newEventDispatchCallback("ExistingItem_DeleteRequest"),
                id
            );

            if (!item) {
                console.log("Help!");
            }

            switch(item.languageType) {
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

            id = App.persistentStorageService.readCurrentKeyFromCursor();
            item = App.persistentStorageService.readNextFromCursor();
        }
    }
}
