/**
 * @class
 * @public
 */
class AppBootstrappingService {

    static Initialise() {

        Log.setLoggingLevel(LogLevel.Trace);
        Log.debug("AppService.Initialise - Begin", "APPSERVICE");

        // Bootstrap
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
        }

        Log.debug("AppService.Initialise - Complete", "APPSERVICE");
    }

    static indexDOM() {

        // Index any of the html you keep needing (don't forget to define it in the App obect first)
        // for example:
        //    App.elements["MyListContainer"] = document.getElementById("MyListContainer");

        let mapping = [
            {id: "AppForeground", objProperty: "appForeground"},
            {id: "TopNavContainer", objProperty: "topNavContainer"},
            {id: "KanaPage", objProperty: "kanaPage"},
            {id: "KanaControls", objProperty: "kanaControls"},
            {id: "KanaPageBody", objProperty: "kanaPageBody"},
            {id: "LanguagePage", objProperty: "languagePage"},
            {id: "LanguagePageControls", objProperty: "languagePageControls"},
            {id: "LanguageNewFlyout", objProperty: "languageNewFlyout"},
            {id: "LanguageListBody", objProperty: "languageListBody"},
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
        ]

        for (let m of mapping) {
            if (App.elements[m.objProperty] === undefined) {
                Log.fatal(`DOM indexing mapping error, ${m.objProperty} is not a property of App.elements`, "", this);
                return;
            } 

            App.elements[m.objProperty] = document.getElementById(m.id);

            if (App.elements[m.objProperty] === null) {
                Log.fatal(`DOM indexing mapping error, ID ${m.id} could not be is not be found in the DOM`, "", this);
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
            Log.fatal("Unable to find fragment Source", "", this);
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
            Log.fatal("The Store, Dispatcher and DOM indexing must be initialised before Core UI", "", this)
            return;
        }

        if (App.elements.topNavContainer) {
            App.components.topNav = new CCTopNav(true, false);
            App.components.topNav.addTab("Kana", App.dispatcher.newEventDispatchCallback("TopNav_KanaSelected"));
            App.components.topNav.addTab("Language", App.dispatcher.newEventDispatchCallback("TopNav_LanguageSelected"));
            App.components.topNav.setExpandableSpacing(true, false);
            App.components.topNav.setLeftContent(App.fragments.appTitle);
            App.components.topNav.selectIndex(1);

            App.elements.topNavContainer.appendChild(App.components.topNav);
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

        if (App.elements.appForeground) {
            App.elements.appForeground.classList.remove("Hide");
        }
    }

    static loadStore() {

        if (!App.store) {
            Log.fatal("App Store must be initialised before Store content can be loaded", "", this);
            return;
        }

        App.store.addObservable("searchState");

        App.store.searchState.observableData.typeFilterBitmask = App.components.languagePageControls?.getSelectionBitmaskForGroup(0);
        App.store.searchState.observableData.searchString = "";
        App.store.searchState.observableData.searchType = null;
        
    }

    static attachStoreSubscribers() {

        if (!App.store) {
            Log.fatal("App Store must be initialised before Store content can be loaded", "", this);
            return;
        }

        App.store.searchState.addSubscriber(App.components.languageList, store_SearchState_OnDataChange);

    }

    static initialiseWelcomeUX() {

        if (!App.dispatcher) {
            Log.fatal("The Store, Dispatcher and DOM indexing must be initialised before Core UI", "", this)
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
            Log.fatal("The Persistent Storage Service, must be initialised before initialising the database", "", this)
            return;
        }

        if (!App.persistentStorageService.connect("MyJapaneseAid")) {
            App.persistentStorageService.connect("MyJapaneseAid", true);
            App.persistentStorageService.newTable(...GojuonGroupingService.gojuonGroupings.map(x => x.gojuonKey));
        }
    }

    static addStarterContent() {
        for (let key in starterData) {
            /** @ts-ignore - Yes JSDoc ... you can index an object by string */
            let contents = JSON.parse(starterData[key]);
            if (!Array.isArray(contents) && typeof contents == 'object' && contents.hasOwnProperty("kana")) {
                contents.kana = UnicodeService.demunge(contents.kana);
                contents.romaji = UnicodeService.demunge(contents.romaji);
                localStorage.setItem(key, JSON.stringify(contents));
            }
            else {
                /** @ts-ignore - Yes JSDoc ... you can index an object by string */
                localStorage.setItem(key, starterData[key]);
            }
        }
    }

    static loadFromPersistentStorage() {

        if (!App.persistentStorageService) {
            Log.fatal("Persistent Storage Service must be initialised before content can be loaded", "", this);
            return;
        }

        let sections = GojuonGroupingService.gojuonGroupings.map(x => x.gojuonKey);

        for (let section of sections) {

            App.persistentStorageService.newTableCursor(section);
            
            let id = App.persistentStorageService.readCurrentKeyFromCursor();
            let item = App.persistentStorageService.readNextFromCursor();

            while (id != null && item != null) {

                App.components.languageList?.addItem(
                    item, 
                    App.dispatcher?.newEventDispatchCallback("ExistingItem_Update"),
                    null,
                    App.dispatcher?.newEventDispatchCallback("ExistingItem_DeleteRequest"),
                    id
                );

                id = App.persistentStorageService.readCurrentKeyFromCursor();
                item = App.persistentStorageService.readNextFromCursor();
            }
        }
    }

}
