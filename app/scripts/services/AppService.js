/**
 * @class
 * @public
 */
class AppService {
    static Initialise() {

        Log.setLoggingLevel(LogLevel.Trace);
        Log.debug("AppService.Initialise - Begin", "APPSERVICE");

        // Bootstrap
        ComponentRegistry.registerComponents();
        AppService.IndexKeyDOMElements();
        AppService.InitialiseStore();
        AppService.InitialiseDispatchers();
        AppService.InitialiseCoreUI();
        AppService.InitialiseComponents();
        AppService.InitialiseBindings();
        AppService.LoadStore();

        // Add Data to Store and propogate it to components
        AppService.LoadStore();

        // Do anything else you need

        Log.debug("AppService.Initialise - Complete", "APPSERVICE");
    }

    static IndexKeyDOMElements() {

        // Index any of the html you keep needing (don't forget to define it in the App obect first)
        // for example:
        //    App.elements["MyListContainer"] = document.getElementById("MyListContainer");

        // @ts-ignore
        App.components.searchComponent = document.getElementById("TopNavSearch");
        // @ts-ignore
        App.components.testItem = document.getElementById("TestItem");
        // @ts-ignore
        App.components.testItemList = document.getElementById("TestList");
    }

    static InitialiseStore() {
        // Create Store & Observables
        App.store = new Store(NotificationMode.Default, NotificationStatus.Default);

    }

    static InitialiseDispatchers() {
        // Initialise event processing
        App.dispatcher = new Dispatcher();
        App.dispatcher.addDispatchHandler(new AppActionHandler(), "route");

        // Now add your action handlers
        // For example:
        //    App.dispatcher.addDispatchHandler(new MyGameHandler(), "route");
    
    }

    static InitialiseCoreUI() {

        if (!App.dispatcher || !App.store) {
            Log.fatal("Both the Store and Dispatcher must be initialised before Core UI", "", this)
            return;
        }

        // Setup any non component DOM elements here.

    }

    static InitialiseComponents() {

        if (!App.dispatcher || !App.store) {
            Log.fatal("Both the Store and Dispatcher must be initialised before components", "", this)
            return;
        }

        // Setup any non component DOM elements here.
        App.components.testItemList?.loadSections(GojuonGroupingService.gojuonGroupings);

    }

    static InitialiseBindings() {

        if (!App.dispatcher || !App.store) {
            Log.fatal("Both the Store and Dispatcher must be initialised before Event Bindings", "", this);
            return;
        }

        // Initilaise any core event bindings
        // for example:
        //    document.body.addEventListener("click", MyClickCallback);

        if (App.components.searchComponent) {
            App.components.searchComponent.attachOnChangeDebouncedCallback(App.dispatcher.newEventDispatchCallback("App_ApplySearch"));
        }

        if (App.components.testItem) {
            App.components.testItem.attachDelectRequestCallback(App.dispatcher.newEventDispatchCallback("App_Item_DeleteRequest"));
            App.components.testItem.attachDataUpdateCallback(App.dispatcher.newEventDispatchCallback("App_Item_DataUpdate"));
        }
    }

    static LoadStore() {

        if (!App.store) {
            Log.fatal("App Store must be initialised before Store content can be loaded", "", this);
            return;
        }

        // Initialise the store's data structure
        // for example:
        //     App.store.addObservablesDictionary("MyHeros");
        //
        //     App.store.MyHeros.add("Thor");
        //     App.store.MyHeros.Thor.observableData.weapon = "Mjölnir";
        
    }

}
