/**
 * Service for reading and Writing files
 * @class
 * @public
 */
class FilesystemAccessService {

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
     * Public Methods
     */
    /**
     * @param {Object} filePickerOptions
     * @returns {Promise<String | Null>}
     */
    static async readEntireFileAsString(filePickerOptions) {

        Log.debug("Modern file service read", "FILESYS");
        let fileHandle

        try {
            /** @ts-ignore - JSDoc Does not curretly recognise showSaveFilePicker outside of node */ 
            fileHandle = await window.showOpenFilePicker(filePickerOptions);
        }
        catch {
            return null;
        }

        if (!fileHandle) {
            return null;
        }

        let file = await fileHandle[0].getFile();
        let fileContents = await file.text();
       
        return fileContents;
    }

    /**
     * @param {Object} filePickerOptions 
     * @returns {Promise<Object | Null>}
     */
    static async readEntireFileAsObject(filePickerOptions) {

        let fileContents = await FilesystemAccessService.readEntireFileAsString(filePickerOptions)
        
        if (fileContents == null) {
            return null;
        }

        let objectContents = JSON.parse(fileContents);
        return objectContents;
    }

    /**
     * @param {Object} filePickerOptions
     * @param {String} stringContentsForFile 
     * @returns {Promise<Boolean>}
     */
    static async writeStringAsEntireFile(filePickerOptions, stringContentsForFile) {

        Log.debug("Modern file service write", "FILESYS");
        let fileHandle
        
        try {
            /** @ts-ignore - JSDoc Does not curretly recognise showSaveFilePicker outside of node */ 
            fileHandle = await window.showSaveFilePicker(filePickerOptions);
        }
        catch {
            return false;
        }

        if (!fileHandle) {
            return false;
        } 

        try {
            let writableStream = await fileHandle.createWritable();
            writableStream.write(stringContentsForFile);
            writableStream.close();
        }
        catch {
            return false;
        }
        return true;
    }

    /**
     * @param {Object} filePickerOptions
     * @param {Object} objectContentsForFile 
     * @returns {Promise<Boolean>}
     */
    static async writeObjectAsEntireFile(filePickerOptions, objectContentsForFile) {

        let stringContentsForFile = JSON.stringify(objectContentsForFile);
        let result = await FilesystemAccessService.writeStringAsEntireFile(filePickerOptions,stringContentsForFile);
        return result;

    }
}