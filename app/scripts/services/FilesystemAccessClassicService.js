/**
 * Service for reading and Writing files
 * @class
 * @public
 */
class FilesystemAccessClassicService {

    /**
     * Member attributes
     */

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
     * @param {Boolean} asJSON
     * @param {Function} processFileContentsCallback
     * @param {String} acceptFileTypes 
     * @param  {...*} additionalArgs 
     */
    static #readEntireFile(asJSON, processFileContentsCallback, acceptFileTypes, ...additionalArgs) {

        Log.debug("Classic file service read", "FILESYS");

        let element = document.createElement("input");
        element.type = "file";
        element.accept = acceptFileTypes;

        element.onchange = function() {
            
            /** @ts-ignore - Yes it's ok to read the first item */
            let file = element.files[0];

            if (file == null) {
                Log.info("No File selected", "FILESYS");
                return false;
            }

            var fr = new FileReader();

            fr.onload = function(event) {
                let result = event.target?.result;
                let obj = null;
                if (asJSON) {
                    if (typeof result === 'string' || result instanceof String) {
                        obj = JSON.parse(/** @type {String} */(result));
                    }
                    processFileContentsCallback(obj, ...additionalArgs);
                }
                else {
                    processFileContentsCallback(result, ...additionalArgs);
                }
                element.remove();
            }

            fr.readAsText(file);

        }

        App.elements.settingsPageHiddenElements?.appendChild(element);
        element.click();

    }

    /**
     * Public Methods
     */
    /**
     * @param {Function} processFileContentsCallback
     * @param {String} acceptFileTypes 
     * @param  {...*} additionalArgs 
     */
    static readEntireFileAsString(processFileContentsCallback, acceptFileTypes, ...additionalArgs) {

        FilesystemAccessClassicService.#readEntireFile(false, processFileContentsCallback, acceptFileTypes, ...additionalArgs);

    }


    /**
     * @param {Function} processFileContentsCallback 
     * @param {String} acceptFileTypes
     * @param  {...*} additionalArgs 
     */
    static readEntireFileAsObject(processFileContentsCallback, acceptFileTypes, ...additionalArgs) {

        FilesystemAccessClassicService.#readEntireFile(true, processFileContentsCallback, acceptFileTypes, ...additionalArgs);

    }


    /**
     * @param {String} filename
     * @param {String} stringContentsForFile 
     */
    static writeStringAsEntireFile(filename, stringContentsForFile) {

        Log.debug("Classic file service write", "FILESYS");

        let e = document.createElement("a");
		let file = new Blob([stringContentsForFile], { type: "text/plain" });
		
        e.href = URL.createObjectURL(file);
		e.download = filename;
		e.click();
    }


    /**
     * @param {String} filename
     * @param {Object} objectContentsForFile 
     */
    static writeObjectAsEntireFile(filename, objectContentsForFile) {

        let stringContentsForFile = JSON.stringify(objectContentsForFile);
        FilesystemAccessClassicService.writeStringAsEntireFile(filename, stringContentsForFile);

    }
}