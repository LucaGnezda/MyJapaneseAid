/**
 * Typedefs
 * @typedef {{
 *      tables: Array<String>,
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
     * @type {Object.<String, Array<String>>}
     */
    #tableIndexes = {};
    /**
     * @type {String | Null}
     */
    #cursorTable = null;
    /**
     * @type {Number | Null}
     */
    #cursorIndex = null;


    /**
     * Constructor
     */
    constructor() {
 
    }


    /**
     * Getters/Setters
     */


    /**
     * Private Methods
     */
    
    /**
     * @param {*} obj
     */
    #isValidDatabase(obj) {
        if (obj &&
            typeof obj === 'object' && 
            obj.hasOwnProperty('tables') && 
            Array.isArray(obj.tables) &&
            obj.tables.every(/** @param {String} x */ x => typeof x === 'string')) {
            return true;
        }
        return false;
    }

    /**
     * @param {String} key
     * @return {Object | Null} obj
     */
    #select(key) {
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
            return this.#select(`${this.#databaseName}.${tableName}.${id}`);
        }
        return null;
    }

    /**
     * @param {String} tableName
     */
    #selectTableIndex(tableName) {
        if (this.#databaseName.length > 0) {
            return this.#select(`${this.#databaseName}.${tableName}`);
        }
        return null;
    }

    /**
     * @param {String} [databaseName]
     */
    #selectDatabase(databaseName = this.#databaseName) {
        if (databaseName.length > 0) {
            return this.#select(databaseName);
        }
        return null;
    }

    /**
     * @param {String} key
     * @param {Object} obj
     */
    #upsert(key, obj) {
        let json = JSON.stringify(obj);
        if (json){
            localStorage.setItem(key, json);
        }
    }

    /**
     * @param {String} tableName
     * @param {String} id
     * @param {Object} obj
     */
    #upsertStoredObject(tableName, id, obj) {
        if (this.#databaseName.length > 0) {
            return this.#upsert(`${this.#databaseName}.${tableName}.${id}`, obj);
        }
    }

    /**
     * @param {String} tableName
     */
    #upsertTableIndex(tableName) {
        if (this.#databaseName.length > 0) {
            return this.#upsert(`${this.#databaseName}.${tableName}`, this.#tableIndexes[tableName]);
        }
        return null;
    }

    #upsertDatabase() {
        if (this.#databaseRoot && this.#databaseName.length > 0) {
            return this.#upsert(this.#databaseName, this.#databaseRoot);
        }
        return null;
    }

    /**
     * @param {String} key
     */
    #delete(key) {
        localStorage.removeItem(key);
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
     * @param {String} tableName
     */
    #deleteTableIndex(tableName) {
        if (this.#databaseName.length > 0) {
            return this.#delete(`${this.#databaseName}.${tableName}`);
        }
        return null;
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
            this.#databaseName = databaseName;
            this.#databaseRoot = databaseRoot;
        }
        else if (initialiseIfNotExists) {

            this.#databaseName = databaseName;
            this.#databaseRoot = {
                tables: [],
            }

            this.#upsert(databaseName, this.#databaseRoot);
        }
        else {
            this.#databaseName = "";
            this.#databaseRoot = null;
            this.#tableIndexes = {};
            return false;
        }

        for (let t of this.#databaseRoot.tables) {
            this.#tableIndexes[t] = this.#selectTableIndex(t);
        }

        return true;
    }

    /**
     * @param {...String} tableNames
     */
    newTable(...tableNames) {

        for (let tableName of tableNames) {
            if (this.#tableIndexes[tableName] == null) {
                this.#tableIndexes[tableName] = [];
            }
            this.#upsertTableIndex(tableName);
            if (!this.#databaseRoot?.tables.includes(tableName)) {
                this.#databaseRoot?.tables.push(tableName);
            }
            this.#upsertDatabase();
        }
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
     */
    newTableCursor(tableName) {
        if (this.#databaseRoot?.tables.includes(tableName)) {
            this.#cursorTable = tableName;
            this.#cursorIndex = 0;
        }
    }

    /**
     * @returns {String | Null}
     */
    readCurrentKeyFromCursor() {
        if (this.#cursorTable == null || this.#cursorIndex == null || this.#cursorIndex == this.#tableIndexes[this.#cursorTable].length) {
            return null;
        }

        return this.#tableIndexes[this.#cursorTable][this.#cursorIndex];
    }

    /**
     * @returns {*}
     */
    readNextFromCursor() {

        if (this.#cursorTable == null || this.#cursorIndex == null || this.#cursorIndex == this.#tableIndexes[this.#cursorTable].length) {
            this.#cursorTable = null;
            this.#cursorIndex = null;
            return null;
        }

        let id = this.#tableIndexes[this.#cursorTable][this.#cursorIndex];

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
        // create the table too if it doesn't already exist
        if (!this.#tableIndexes[tableName]) {
            this.newTable(tableName);
        }
        if (!this.#tableIndexes[tableName].includes(id)) {
            this.#tableIndexes[tableName].push(id);
        }
        this.#upsertTableIndex(tableName);
        this.#upsertStoredObject(tableName, id, data);
    }

    /**
     * @param {String} tableName
     * @param {String} id
     */
    delete(tableName, id) {
        if (this.#tableIndexes[tableName].includes(id)) {
            this.#tableIndexes[tableName] = this.#tableIndexes[tableName].filter(/** @param {String} x */x => x != id);
        }
        this.#upsertTableIndex(tableName);
        this.#deleteStoredObject(tableName, id)
    }

    exportStorageToClipboard() {
        /** @ts-ignore */
        copy(JSON.stringify(localStorage));
    }
}