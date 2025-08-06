/**
 * Typedefs
 * @typedef {{
 *      schemaversion: String,
 *      lastmodified: Date,
 * }} PSSDatabaseRoot
 */

/**
 * Persistent storage processing object, 
 * @class
 * @public
 */
class PersistentStorageService {

    /**
     * Member attributes
     */
    /**
     * @type {String}
     */
    #databaseName = "";

    /**
     * @type {PSSDatabaseRoot | Null}
     */
    #databaseRoot = null;
    
    /**
     * @type {String | Null}
     */
    #cursorTable = null;
    
    /**
     * @type {Array<String> | Null}
     */
    #cursorKeys = null;

    /**
     * @type {Number | Null}
     */
    #cursorIndex = null;
    
    #expectedSchemaVersion = "PersistenceStorageServiceV2Schema";

    /**
     * Constructor
     */
    constructor() {
 
    }


    /**
     * Getters/Setters
     */
    get lastmodified () {
        return this.#databaseRoot?.lastmodified;
    }


    /**
     * Private Methods
     */
    
    /**
     * @param {*} obj
     */
    #isValidDatabase(obj) {
        
        if (obj &&
            typeof obj === 'object' && 
            obj.hasOwnProperty('schemaversion') && 
            obj.schemaversion == this.#expectedSchemaVersion &&
            obj.hasOwnProperty('lastmodified') && 
            /** @ts-ignore - Yes this is ok for this purpose */
            !isNaN(new Date(obj.lastmodified))) {
            return true;
        }
        return false;
    }

    #updateLastModified() {
        if (this.#databaseRoot) {
            this.#databaseRoot.lastmodified = new Date();
            localStorage.setItem(this.#databaseName, JSON.stringify(this.#databaseRoot));
        }
    }

    /**
     * @param {String} key
     * @return {Object | Null} obj
     */
    #selectAsObject(key) {
        let json = localStorage.getItem(key);
        if (json) {
            return JSON.parse(json);
        }
        return null;
    }
    
    /**
     * @param {String} tableName
     * @param {String} id
     */
    #selectStoredObject(tableName, id) {
        if (this.#databaseName.length > 0) {
            return this.#selectAsObject(`${this.#databaseName}.${tableName}.${id}`);
        }
        return null;
    }

    /**
     * @param {String} tableName
     */
    #selectTableKeys(tableName) {
        return Object.keys(localStorage).filter((key) => key.startsWith(`${this.#databaseName}.${tableName}`));
    }

    /**
     * @param {String} [databaseName]
     */
    #selectDatabase(databaseName = this.#databaseName) {
        if (databaseName.length > 0) {
            return this.#selectAsObject(databaseName);
        }
        return null;
    }

    /**
     * @param {String} key
     * @param {Object} obj
     */
    #upsertStringifiedObject(key, obj) {
        let json = JSON.stringify(obj);
        if (json){
            localStorage.setItem(key, json);
            this.#updateLastModified();
        }
    }

    /**
     * @param {String} tableName
     * @param {String} id
     * @param {Object} obj
     */
    #upsertStoredObject(tableName, id, obj) {
        if (this.#databaseName.length > 0) {
            return this.#upsertStringifiedObject(`${this.#databaseName}.${tableName}.${id}`, obj);
        }
    }

    /**
     * @param {String} key
     */
    #delete(key) {
        localStorage.removeItem(key);
        this.#updateLastModified();
    }

    /**
     * @param {String} tableName
     * @param {String} id
     */
    #deleteStoredObject(tableName, id) {
        if (this.#databaseName.length > 0) {
            return this.#delete(`${this.#databaseName}.${tableName}.${id}`);
        }
    }


    /**
     * Public Methods
     */
    isConnected() {
        if (!this.#databaseName || !this.#databaseRoot) {
            return false;
        }
        return true;
    }

    /**
     * @param {String} databaseName
     * @param {Boolean} [initialiseIfNotExists]
     * @returns {Boolean}
     */
    connect(databaseName, initialiseIfNotExists = false) {

        /**
         * @type {PSSDatabaseRoot | Null} databaseRoot
         */
        let databaseRoot = /** @type {PSSDatabaseRoot} */ (this.#selectDatabase(databaseName));
        if (this.#isValidDatabase(databaseRoot)) {
            databaseRoot.lastmodified = new Date(databaseRoot.lastmodified);
            this.#databaseName = databaseName;
            this.#databaseRoot = databaseRoot;
        }
        else if (initialiseIfNotExists) {

            this.#databaseName = databaseName;
            this.#databaseRoot = {
                schemaversion: this.#expectedSchemaVersion,
                lastmodified: new Date(),
            }

            this.#upsertStringifiedObject(databaseName, this.#databaseRoot);
        }
        else {
            this.#databaseName = "";
            this.#databaseRoot = null;
            return false;
        }

        return true;
    }

    /**
     * @param {String} tableName
     * @param {String} id 
     */
    read(tableName, id) {
        return this.#selectStoredObject(tableName, id);
    }

    /**
     * @param {String} tableName
     * @returns {Boolean}
     */
    newTableCursor(tableName) {

        let keys = this.#selectTableKeys(tableName);

        if (keys.length == 0) {
            return false;
        }
        this.#cursorTable = tableName;
        this.#cursorKeys = keys;
        this.#cursorIndex = 0;
        return true;
    }

    /**
     * @returns {String | Null}
     */
    readCurrentKeyFromCursor() {
        if (this.#cursorTable == null || this.#cursorKeys == null || this.#cursorIndex == null || this.#cursorIndex >= this.#cursorKeys.length) {
            return null;
        }

        return this.#cursorKeys[this.#cursorIndex].split(".")[2];
    }

    /**
     * @returns {*}
     */
    readNextFromCursor() {

        if (this.#cursorTable == null || this.#cursorKeys == null || this.#cursorIndex == null || this.#cursorIndex >= this.#cursorKeys.length) {
            this.#cursorTable = null;
            this.#cursorIndex = null;
            return null;
        }

        let id = this.#cursorKeys[this.#cursorIndex].split(".")[2];

        let item = this.#selectStoredObject(this.#cursorTable, id);

        this.#cursorIndex += 1;
        
        return item;
    }

    /**
     * @param {String} tableName
     * @param {String} id
     * @param {Object} data
     */
    upsert(tableName, id, data) {
        this.#upsertStoredObject(tableName, id, data);
    }

    /**
     * @param {String} tableName
     * @param {String} id
     */
    delete(tableName, id) {
        this.#deleteStoredObject(tableName, id)
    }

    deleteAllKeysForThisDatabase() {
        if (this.isConnected()) {
            let toPurge = Object.keys(localStorage).filter((key) => key.startsWith(this.#databaseName));
            for (let key of toPurge) {
                localStorage.removeItem(key);
            }
        }
    }

    /**
     * @returns {Object | Null}
     */
    getExportableData() {
        if (this.isConnected()) {
            return (
                Object.keys(localStorage)
                .filter(key => key.startsWith(this.#databaseName))
                .reduce(
                    (obj, key) => {
                        /** @ts-ignore - yes this is ok JSDoc, because we know we're working with valid keys we've used before */
                        obj[key]=localStorage[key]; 
                        return obj;
                    }, {}
                )
            )
        }
        else {
            return null;
        }
    }

    exportStorageToClipboard() {
        /** @ts-ignore */
        copy(this.getExportableData());
    }
}