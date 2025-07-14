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

        // Load from persistent storage
        AppBootstrappingService.loadFromPersistentStorage();

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
        if (!App.persistentStorageService.connect("MyJapaneseAid")) {
            App.persistentStorageService.connect("MyJapaneseAid", true);
            App.persistentStorageService.newTable(...GojuonGroupingService.gojuonGroupings.map(x => x.gojuonKey));
        };
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

        // Initialise the store's data structure
        // for example:
        //     App.store.addObservablesDictionary("MyHeros");
        //
        //     App.store.MyHeros.add("Thor");
        //     App.store.MyHeros.Thor.observableData.weapon = "Mjölnir";
        
    }

    static attachStoreSubscribers() {

        if (!App.store) {
            Log.fatal("App Store must be initialised before Store content can be loaded", "", this);
            return;
        }

        App.store.searchState.addSubscriber(App.components.languageList, store_SearchState_OnDataChange);

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
