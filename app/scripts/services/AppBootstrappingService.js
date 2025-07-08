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

        // Build and initialise the UX
        AppBootstrappingService.initialiseUX();

        // Add Data to Store and propogate it to components
        AppBootstrappingService.loadStore();

        // Do anything else you need

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
        App.store = new Store(NotificationMode.Default, NotificationStatus.Default);

    }

    static initialiseDispatchers() {
        // Initialise event processing
        App.dispatcher = new Dispatcher();
        App.dispatcher.addDispatchHandler(new AppActionHandler(), "route");

        // Now add your action handlers
        // For example:
        //    App.dispatcher.addDispatchHandler(new MyGameHandler(), "route");
    
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

            App.components.languagePageControls = new CCButtonStrip(true, false);
            App.components.languagePageControls.setHorizontalLayout();
            App.components.languagePageControls.newButtonGroup(CCButtonStripGroupBehaviour.MultiSelectGroup);
            App.components.languagePageControls.addTextButton("Words", null, true);
            App.components.languagePageControls.addTextButton("Phrases", null, true);
            App.components.languagePageControls.addTextButton("Sentences", null, true);
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
            App.components.languageListControls.addImageButton("./app/assets/svg/plus.svg", App.dispatcher.newEventDispatchCallback("LanguageControls_NewItem"));

            App.components.languageList = new CCLanguageItemList(true, false);
            App.components.languageList.title = "Language Dictionary";
            App.components.languageList.AddControls(App.components.languageListControls);

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

        App.store.addObservablesDictionary("Words");

        GojuonGroupingService.gojuonGroupings.forEach((item) => {
            App.store?.Words.add(item.gojuonKey);
        });

        // Initialise the store's data structure
        // for example:
        //     App.store.addObservablesDictionary("MyHeros");
        //
        //     App.store.MyHeros.add("Thor");
        //     App.store.MyHeros.Thor.observableData.weapon = "Mjölnir";
        
    }

}
