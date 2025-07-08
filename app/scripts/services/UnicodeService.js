/**
 * Unicode processing object, compensates for scenarios where strings get munged between UTF8 and UTF16
 * @class
 * @public
 */
class UnicodeService {
   

    /** ---- Private Properties ---- */
    /**
     * @type {Array<Array<Number>>}
     */
    static #htmlSpecRemapping = [];

    /**
     * @type {Array<Number>}
     */
    static #htmlSpecMappingReversal = [];
    
    /**
     * @type {Number?}
     */
    static #isLittleEndian = null;


    /** ---- Private Methods ---- */
    static #initialiseIfRequired () {

        // Strings oh how I hate thee, let me count the ways ...
        // Please refer to HTML Spec: 
        //     https://html.spec.whatwg.org/multipage/parsing.html#character-reference-code
        if (this.#htmlSpecRemapping.length == 0) {
            this.#htmlSpecRemapping[0x80] = [0x20, 0xAC]; // Euro sign (€)
            this.#htmlSpecRemapping[0x82] = [0x20, 0x1A]; // Single low-9 quotation mark (‚)
            this.#htmlSpecRemapping[0x83] = [0x01, 0x92]; // Latin small letter f with hook (ƒ)
            this.#htmlSpecRemapping[0x84] = [0x20, 0x1E]; // Double low-9 quotation mark („)
            this.#htmlSpecRemapping[0x85] = [0x20, 0x26]; // Horizontal ellipsis (…)
            this.#htmlSpecRemapping[0x86] = [0x20, 0x20]; // Dagger (†)
            this.#htmlSpecRemapping[0x87] = [0x20, 0x21]; // Double dagger (‡)
            this.#htmlSpecRemapping[0x88] = [0x02, 0xC6]; // Modifier letter circumflex accent (ˆ)
            this.#htmlSpecRemapping[0x89] = [0x20, 0x30]; // Per mille sign (‰)
            this.#htmlSpecRemapping[0x8A] = [0x01, 0x60]; // Latin capital letter S with caron (Š)
            this.#htmlSpecRemapping[0x8B] = [0x20, 0x39]; // Single left-pointing angle quotation mark (‹)
            this.#htmlSpecRemapping[0x8C] = [0x01, 0x52]; // Latin capital ligature OE (Œ)
            this.#htmlSpecRemapping[0x8E] = [0x01, 0x7D]; // Latin captital letter Z with caron (Ž)
            this.#htmlSpecRemapping[0x91] = [0x20, 0x18]; // Left single quotation mark (‘)
            this.#htmlSpecRemapping[0x92] = [0x20, 0x19]; // Right single quotation mark (’)
            this.#htmlSpecRemapping[0x93] = [0x20, 0x1C]; // Left double quotation mark (“)
            this.#htmlSpecRemapping[0x94] = [0x20, 0x1D]; // Right double quotation mark (”)
            this.#htmlSpecRemapping[0x95] = [0x20, 0x22]; // Bullet (•)
            this.#htmlSpecRemapping[0x96] = [0x20, 0x13]; // EN dash (–)
            this.#htmlSpecRemapping[0x97] = [0x20, 0x14]; // EM dash (—)
            this.#htmlSpecRemapping[0x98] = [0x02, 0xDC]; // Small tilde (˜)
            this.#htmlSpecRemapping[0x99] = [0x21, 0x22]; // Trade mark sign (™)
            this.#htmlSpecRemapping[0x9A] = [0x01, 0x61]; // Latin small letter S with caron (š)
            this.#htmlSpecRemapping[0x9B] = [0x20, 0x3A]; // Single right-pointing angle quotation mark (›)
            this.#htmlSpecRemapping[0x9C] = [0x01, 0x53]; // Latin small ligature OE (œ)
            this.#htmlSpecRemapping[0x9E] = [0x01, 0x7E]; // Latin small letter Z with caron (ž)
            this.#htmlSpecRemapping[0x9F] = [0x01, 0x78]; // Latin capital letter Y with diaeresis (Ÿ)
        }

        if (this.#htmlSpecMappingReversal.length == 0) {
            this.#htmlSpecMappingReversal[0x20AC] = 0x80; // Euro sign (€)
            this.#htmlSpecMappingReversal[0x201A] = 0x82; // Single low-9 quotation mark (‚)
            this.#htmlSpecMappingReversal[0x0192] = 0x83; // Latin small letter f with hook (ƒ)
            this.#htmlSpecMappingReversal[0x201E] = 0x84; // Double low-9 quotation mark („)
            this.#htmlSpecMappingReversal[0x2026] = 0x85; // Horizontal ellipsis (…)
            this.#htmlSpecMappingReversal[0x2020] = 0x86; // Dagger (†)
            this.#htmlSpecMappingReversal[0x2021] = 0x87; // Double dagger (‡)
            this.#htmlSpecMappingReversal[0x02C6] = 0x88; // Modifier letter circumflex accent (ˆ)
            this.#htmlSpecMappingReversal[0x2030] = 0x89; // Per mille sign (‰)
            this.#htmlSpecMappingReversal[0x0160] = 0x8A; // Latin capital letter S with caron (Š)
            this.#htmlSpecMappingReversal[0x2039] = 0x8B; // Single left-pointing angle quotation mark (‹)
            this.#htmlSpecMappingReversal[0x0152] = 0x8C; // Latin capital ligature OE (Œ)
            this.#htmlSpecMappingReversal[0x017D] = 0x8E; // Latin captital letter Z with caron (Ž)
            this.#htmlSpecMappingReversal[0x2018] = 0x91; // Left single quotation mark (‘)
            this.#htmlSpecMappingReversal[0x2019] = 0x92; // Right single quotation mark (’)
            this.#htmlSpecMappingReversal[0x201C] = 0x93; // Left double quotation mark (“)
            this.#htmlSpecMappingReversal[0x201D] = 0x94; // Right double quotation mark (”)
            this.#htmlSpecMappingReversal[0x2022] = 0x95; // Bullet (•)
            this.#htmlSpecMappingReversal[0x2013] = 0x96; // EN dash (–)
            this.#htmlSpecMappingReversal[0x2014] = 0x97; // EM dash (—)
            this.#htmlSpecMappingReversal[0x02DC] = 0x98; // Small tilde (˜)
            this.#htmlSpecMappingReversal[0x2122] = 0x99; // Trade mark sign (™)
            this.#htmlSpecMappingReversal[0x0161] = 0x9A; // Latin small letter S with caron (š)
            this.#htmlSpecMappingReversal[0x203A] = 0x9B; // Single right-pointing angle quotation mark (›)
            this.#htmlSpecMappingReversal[0x0153] = 0x9C; // Latin small ligature OE (œ)
            this.#htmlSpecMappingReversal[0x017E] = 0x9E; // Latin small letter Z with caron (ž)
            this.#htmlSpecMappingReversal[0x0178] = 0x9F; // Latin capital letter Y with diaeresis (Ÿ)
        }

        if (this.#isLittleEndian == null) { 
            this.#testEndianness(); 
        }
    }


    /**
     * @param {*} arr 
     * @returns 
     */
    static #isTypedArray(arr) {
        return arr instanceof Int8Array ||
               arr instanceof Uint8Array ||
               arr instanceof Uint8ClampedArray ||
               arr instanceof Int16Array ||
               arr instanceof Uint16Array ||
               arr instanceof Int32Array ||
               arr instanceof Uint32Array ||
               arr instanceof Float32Array ||
               arr instanceof Float64Array ||
               arr instanceof BigInt64Array ||
               arr instanceof BigUint64Array;
    }

    static #testEndianness() {

        let bytes = new ArrayBuffer(2);
        let u8View = new Uint8Array(bytes);
        let u16View = new Uint16Array(bytes);

        u8View[0] = 0xFF;
        u8View[1] = 0x00;

        if (u16View[0] == 0x00FF) {
            Log.debug("Hardware tested. Hardware is little endian.", "UNICODE PROCESSOR");
            this.#isLittleEndian = 1;
        } 
        else if (u16View[0] == 0xFF00) {
            Log.debug("Hardware tested. Hardware is little endian.", "UNICODE PROCESSOR");
            this.#isLittleEndian = 0;
        }
        else {
            Log.error("Hardware tested. Unexpected endianness result.", "UNICODE PROCESSOR");
            this.#isLittleEndian = -1;
        }

    }


    /** ---- Public Methods ---- */
    /**
     * @param {String} str 
     * @param {Boolean?} applyEndianSwap
     * @returns {Uint16Array}
     */
    static stringToByteArray(str, applyEndianSwap = true) {

        // Create a buffer that will definatively fit a JavaScript String, this will be 2 bytes per char-length. 
        // Note: utf16 characters that use 4 bytes actually have a length of 2, this is convienient because we have alignment for our indexes in this instance. 
        /** @ts-ignore */ 
        let outBuffer = new ArrayBuffer(str.length * 2, { maxByteLength: str.length * 2 });

        // Use a unsigned in 16bit view, because that aligns with javascript's use of utf16.
        let ui16View = new Uint16Array(outBuffer);

        // copy each char into the buffer via the view.
        for (let i = 0; i < str.length; i++) {
            ui16View[i] = str.charCodeAt(i);
        }

        // if LittleEndian, swap to big endian. Two reasons for doing this here reduces code paths and complexity, and it's just easier to read big endian hex and bytes.
        if (this.isHardwareLittleEndian() && applyEndianSwap) {
            this.EndianSwap(ui16View);
        }

        return ui16View;
    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array | Number} input 
     * @param {Number} [bytesPerElement]
     * @returns {Uint8Array?}
     */
    static EndianSwap(input, bytesPerElement) {

        let inui8View = this.asUInt8View(input);

        if (inui8View == null) {
            Log.error(`Unable to determine input`, "UNICODE PROCESSOR");
            return null;
        } 

        if (inui8View.length % 2 != 0) {
            Log.error(`Endian swaps need an even byte length`, "UNICODE PROCESSOR");
            return null;
        };

        if (bytesPerElement == null) {
            if (this.#isTypedArray(input)) {
                bytesPerElement = input.BYTES_PER_ELEMENT;
            }
            else {
                Log.error(`Need to know the bytesPerElement to perform an endian swap`, "UNICODE PROCESSOR");
                return null; 
            }
        }

         /** @ts-ignore */ 
        let outBuffer = new ArrayBuffer(input.length * input.BYTES_PER_ELEMENT, { maxByteLength: input.length * input.BYTES_PER_ELEMENT});
        let outui8View = new Uint8Array(outBuffer);

        for (let i = 0; i < inui8View.length; i += bytesPerElement) {
            for (let b = 0; b < bytesPerElement; b++) {
               outui8View[i + b] = inui8View[i + bytesPerElement - b - 1]; 
            }
        }

        return outui8View;
    }
    
    static isHardwareLittleEndian() {

        this.#initialiseIfRequired();

        if (this.#isLittleEndian == 1) { 
            return true;
        } 
        else {
            return false;
        }
    }

    static isHardwareBigEndian() {
        
        this.#initialiseIfRequired();
        
        if (this.#isLittleEndian == 0) { 
            return true;
        } 
        else {
            return false;
        }
    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} input 
     * @returns {Uint8Array?}
     */
    static undoHTMLSpecRemapping(input) {

        this.#initialiseIfRequired();

        let inui8View = this.asUInt8View(input);

        if (inui8View == null) {
            Log.error(`Unable to determine input`, "UNICODE PROCESSOR");
            return null;
        } 

        if (inui8View.length % 2 != 0) {
            Log.error(`Expecting byte pairs, but recieve an odd number of bytes`, "UNICODE PROCESSOR");
            return null;
        };

        // keep same number of bytes
        /** @ts-ignore */ 
        let outBuffer = new ArrayBuffer(inui8View.length, { maxByteLength: inui8View.length });

        // Use an uint 8bit view so we can manage our own endianness.
        let outui8View = new Uint8Array(outBuffer);

        let iSrc = 0, iRes = 0;
        while (iSrc + 1 < inui8View.length) { 

            let code = (inui8View[iSrc] << 8) + inui8View[iSrc + 1];

            if ( this.#htmlSpecMappingReversal[code] != null ) {
                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = this.#htmlSpecMappingReversal[code];
            }
            else { // Just copy
                outui8View[iRes] = inui8View[iSrc];
                outui8View[iRes + 1] = inui8View[iSrc + 1];
            }

            iSrc += 2;
            iRes += 2;
        }

        return outui8View;
    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} input 
     * @returns {Uint8Array?}
     */
    static applyHTMLSpecRemapping(input) {

        this.#initialiseIfRequired();

        let inui8View = this.asUInt8View(input);

        if (inui8View == null) {
            Log.error(`Unable to determine input`, "UNICODE PROCESSOR");
            return null;
        } 

        // Double the number of bytes, to map form 8-bit to 16 bit
        /** @ts-ignore */ 
        let outBuffer = new ArrayBuffer(inui8View.length * 2, { maxByteLength: inui8View.length * 2});

        // Use an uint 8bit view so we can manage our own endianness.
        let outui8View = new Uint8Array(outBuffer);

        let iSrc = 0, iRes = 0;
        while (iSrc + 1 < inui8View.length) { 

            if ( this.#htmlSpecRemapping[inui8View[iSrc + 1]] != null ) {
                outui8View[iRes] = this.#htmlSpecRemapping[inui8View[iSrc]][0];
                outui8View[iRes + 1] = this.#htmlSpecRemapping[inui8View[iSrc]][1];
            }
            else { // Just copy
                outui8View[iRes] = inui8View[iSrc];
                outui8View[iRes + 1] = inui8View[iSrc + 1];
            }

            iSrc += 2;
            iRes += 2;
        }

        return outui8View;
    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} input 
     * @returns {Uint8Array?}
     */
    static paddedRawUnicodeToUtf16(input) {

        let inui8View = this.asUInt8View(input);

        if (inui8View == null) {
            Log.error(`Unable to determine input`, "UNICODE PROCESSOR");
            return null;
        } 

        if (inui8View.length % 4 != 0) {
            Log.error(`Expecting byte quartets, but recieve an odd number of bytes`, "UNICODE PROCESSOR");
            return null;
        };

        // Keep the same length, we can trim away any excess when we're done.
        /** @ts-ignore */ 
        let outBuffer = new ArrayBuffer(inui8View.length, { maxByteLength: inui8View.length});

        // Use an uint 8bit view so we can manage our own endianness.
        let outui8View = new Uint8Array(outBuffer);

        // use a while loop to allow the source and destination indexes to progress at differing rates
        let iSrc = 0, iRes = 0;
        while (iSrc + 3 < inui8View.length) { 

            if (inui8View[iSrc + 1] > 0) {  // If we have a code point above 0x10000 convert to four byte utf16.

                let outCode = (inui8View[iSrc] << 24) + (inui8View[iSrc + 1] << 16) + (inui8View[iSrc + 2] << 8) + (inui8View[iSrc + 3]) - 0x10000
                outui8View[iRes] = 0xD8 + ((outCode & 0x000C0000) >> 18)                               // use the bits: -------- ----yy-- -------- -------- to 110110yy
                outui8View[iRes + 1] = ((outCode & 0x00030000) >> 10) + ((outCode & 0x0000FC00) >> 10) // use the bits: -------- ------yy yyyyyy-- -------- to yyyyyyyy
                outui8View[iRes + 2] = 0xDC + ((outCode & 0x00000300) >> 8)                            // use the bits: -------- -------- ------xx -------- to 110111xx
                outui8View[iRes + 3] = (outCode & 0x000000FF)                                                                 // use the bits: -------- -------- -------- xxxxxxxx to xxxxxxxx
                
                iSrc += 4;
                iRes += 4;  

            }
            else {  // We have a code point below 0x10000, convert to two byte utf16.

                outui8View[iRes] = inui8View[iSrc + 2];
                outui8View[iRes + 1] = inui8View[iSrc + 3];

                iSrc += 4;
                iRes += 2;

            }
            
        }

        /** @ts-ignore */ 
        outBuffer.resize(iRes);

        return outui8View;

    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} input 
     * @returns {Uint8Array?}
     */
    static unpaddedUtf16ToRawUnicode(input) {

        let inui8View = this.asUInt8View(input);

        if (inui8View == null) {
            Log.error(`Unable to determine input`, "UNICODE PROCESSOR");
            return null;
        } 

        if (inui8View.length % 2 != 0) {
            Log.error(`Expecting byte pairs, but recieve an odd number of bytes`, "UNICODE PROCESSOR");
            return null;
        };

        // keep the number of bytes, because an encoded version will always be equal to or longer than the raw version.
        /** @ts-ignore */ 
        let outBuffer = new ArrayBuffer(inui8View.length * 2, { maxByteLength: inui8View.length * 2});

        // Use an uint 8bit view so we can manage our own endianness.
        let outui8View = new Uint8Array(outBuffer);

        // use a while loop allowing us to step at differing rates
        let iSrc = 0;
        let iRes = 0;
        while (iSrc + 1 < inui8View.length) { 

            if ((inui8View[iSrc] >> 2 == 0xD8 >> 2) &&       // If we found 110110xx xxxxxxxx in a byte
                (inui8View.length > iSrc + 3) &&             // and we have at least another 3 bytes to follow
                (inui8View[iSrc + 2] >> 2 == 0xDC >> 2)) { // and we found 110111xx xxxxxxxx in the next byte, then we have a four byte character code

                let highSurrogate = ((inui8View[iSrc] & 0x03) << 8) + inui8View[iSrc + 1];
                let lowSurrogate = ((inui8View[iSrc + 2] & 0x03) << 8) + inui8View[iSrc + 3];
                let outCode = (highSurrogate << 10) + lowSurrogate + 0x10000;
                outui8View[iRes] = (outCode & 0xFF000000) >> 24;
                outui8View[iRes + 1] = (outCode & 0x00FF0000) >> 16;
                outui8View[iRes + 2] = (outCode & 0x0000FF00) >> 8;
                outui8View[iRes + 3] = outCode & 0x000000FF;
                
                iSrc += 4;
                iRes += 4;  

            }
            else if ((inui8View[iSrc] >> 2 == 0xDC >> 2) &&     // and we found 110111xx xxxxxxxx in a byte
                     (inui8View.length > iSrc + 2) &&               // and we have at least another byte to follow
                     (inui8View[iSrc + 2] >> 2 == 0xD8 >> 2)) { // and we found 110110xx xxxxxxxx in the next byte, then might have an endian problem, just log it and encode normally.
                
                Log.warn(`Unexpected Endianness detected at index=${iSrc}.`, "UNICODE PROCESSOR");
                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = 0x00;
                outui8View[iRes + 2] = inui8View[iSrc];
                outui8View[iRes + 3] = inui8View[iSrc + 1];
                
                iSrc += 2;
                iRes += 4;
                
            }
            else if ((inui8View[iSrc] >> 2 != 0xDC >> 2) && 
                     (inui8View[iSrc] >> 2 != 0xD8 >> 2)) { // We just have normal two byte character code

                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = 0x00;
                outui8View[iRes + 2] = inui8View[iSrc];
                outui8View[iRes + 3] = inui8View[iSrc + 1];
                
                iSrc += 2;
                iRes += 4;

            }
            else { // Bugger, we've got an unexpected pattern, just capture it as is
      
                Log.warn(`Invalid Utf16 encoding detected at index=${iSrc}.`, "UNICODE PROCESSOR");
                
                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = 0x00;
                outui8View[iRes + 2] = inui8View[iSrc];
                outui8View[iRes + 3] = inui8View[iSrc + 1];
                
                iSrc += 2;
                iRes += 4;
      
            }
        }

        return outui8View;

    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array | Number} input 
     * @returns {Uint8Array?}
     */
    static unpaddedUtf8ToRawUnicode(input) {

        let inui8View = this.asUInt8View(input);

        if (inui8View == null) {
            Log.error(`Unable to determine input`, "UNICODE PROCESSOR");
            return null;
        } 

        /** @ts-ignore */ 
        let outBuffer = new ArrayBuffer(inui8View.length * 4, { maxByteLength: inui8View.length * 4});

        // Use an uint 8bit view so we can manage our own endianness.
        let outui8View = new Uint8Array(outBuffer);

        let iSrc = 0;
        let iRes = 0;
        while ( iSrc < inui8View.length ) {

            if (inui8View[iSrc] >> 7 == 0x00) {  // If the first bit in the byte is '0' then we have a one byte utf8 encoding

                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = 0x00;
                outui8View[iRes + 2] = 0x00;
                outui8View[iRes + 3] = inui8View[iSrc];
                
                iSrc += 1;
                iRes += 4;

            }
            else if ((inui8View[iSrc] >> 5 == 0xC0 >> 5) &&     // If the first three bits in the byte are '110' followed by a '10' in the next byte then we have a two byte utf8 encoding
                     (iSrc + 1 < inui8View.length) &&           // And we're not reading beyond the end of the stream
                     (inui8View[iSrc + 1] >> 6 == 0x80 >> 6)) {  

                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = 0x00;
                outui8View[iRes + 2] = ((inui8View[iSrc] & 0x1C) >> 2)                                // The big 3 bits '110xxx--' in the first byte
                outui8View[iRes + 3] = ((inui8View[iSrc] & 0x03) << 6) + (inui8View[iSrc + 1] & 0x7F) // The small 2 bits '110---xx' in the first byte, and the 6 bits '10xxxxxx' in the second
                
                iSrc += 2;
                iRes += 4;

            }
            else if ((inui8View[iSrc]  >> 4 == 0x0e) &&     // If the first four bits in the byte are '1110' followed by '10' in the next two bytes then we have a three byte utf8 encoding
                     (iSrc + 2 < inui8View.length) &&         // And we're not reading beyond the end of the stream
                     (inui8View[iSrc + 1] >> 6 == 0x2) &&
                     (inui8View[iSrc + 2] >> 6 == 0x2)) {   

                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = 0x00;
                outui8View[iRes + 2] = ((inui8View[iSrc] & 0x0F) << 4) + ((inui8View[iSrc + 1] & 0x3C) >> 2) // The 4 bits '1110xxxx' in the first byte, and the big 4 bits '10xxxx--' in the second
                outui8View[iRes + 3] = ((inui8View[iSrc + 1] & 0x03) << 6) + (inui8View[iSrc + 2] & 0x7F)    // The small 2 bits '10----xx' in the second byte, and the 6 bits '10xxxxxx' in the third

                iSrc += 3;
                iRes += 4;

            }
            else if ((inui8View[iSrc]  >> 3 == 0x1e) &&  // If the first five bits in the byte are '11110' followed by '10' in the next three bytes then we have a four byte utf8 encoding
                     (iSrc + 3 < inui8View.length) &&    // And we're not reading beyond the end of the stream
                     (inui8View[iSrc + 1] >> 6 == 0x2) &&
                     (inui8View[iSrc + 2] >> 6 == 0x2) &&
                     (inui8View[iSrc + 3] >> 6 == 0x2)) {   

                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = ((inui8View[iSrc] & 0x07) << 2) + ((inui8View[iSrc + 1] & 0x30) >> 4) // The 3 bits '11110xxx' in the first byte, and the big 2 bits '10xx----' in the second
                outui8View[iRes + 2] = ((inui8View[iSrc + 1] & 0x0F) << 4) + ((inui8View[iSrc + 2] & 0x3C) >> 2) // The small 4 bits '10--xxxx' in the second byte, and the big 4 bits '10xxxx--' in the third
                outui8View[iRes + 3] = ((inui8View[iSrc + 2] & 0x03) << 6) + (inui8View[iSrc + 3] & 0x7F)        // The small 2 bits '10----xx' in the third byte, and the 6 bits '10xxxxxx' in the fourth

                iSrc += 4;
                iRes += 4;

            }
            else {
                Log.warn(`Invalid Utf8 encoding detected at index=${iSrc}.`, "UNICODE PROCESSOR");

                outui8View[iRes] = 0x00;
                outui8View[iRes + 1] = 0x00;
                outui8View[iRes + 2] = 0x00;
                outui8View[iRes + 3] = inui8View[iSrc];
                
                iSrc += 1;
                iRes += 4;
            }
        }

        /** @ts-ignore */ 
        outBuffer.resize(iRes);

        return outui8View;

    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array | Number} input 
     * @returns {Uint8Array?}
     */
    static rawUnicodeAsCondensedUtf8(input) {

        let inui8View = this.asUInt8View(input);

        if (inui8View == null) {
            Log.error(`Unable to determine input`, "UNICODE PROCESSOR");
            return null;
        }
        
        if (inui8View.length % 4 != 0) {
            Log.error(`Expecting byte quartets, but recieve an odd number of bytes`, "UNICODE PROCESSOR");
            return null;
        };

        /** @ts-ignore */ 
        let outBuffer = new ArrayBuffer(inui8View.length, { maxByteLength: inui8View.length});

        // Use an uint 8bit view so we can manage our own endianness.
        let outui8View = new Uint8Array(outBuffer);

        let iSrc = 0;
        let iRes = 0;
        while ( iSrc + 3 < inui8View.length ) {

            if ((inui8View[iSrc] != 0x00) ||
                (inui8View[iSrc + 1] != 0x00) ||
                (inui8View[iSrc + 2] != 0x00)) {  // If the first 3 bytes aren't 0, then what we're working with is not padded utf8

                Log.error(`Expecting a single data byte, but found non zero value in the padding`, "UNICODE PROCESSOR");
                return null;

            }
            
            outui8View[iRes] = inui8View[iSrc + 3];

            iSrc += 4;
            iRes += 1;

        }

        /** @ts-ignore */ 
        outBuffer.resize(iRes);

        return outui8View;

    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array | Number} input 
     * @param {String?} [headerStr] 
     * @param {Number?} [fromIndex]
     * @param {Number?} [toIndex]
     * @returns 
     */
    static asBinaryToConsole(input, headerStr = null, fromIndex = null, toIndex = null) {

        let ui8View = this.asUInt8View(input);

        if (ui8View == null) {
            Log.error(`Unable to determine how to display input`, "UNICODE PROCESSOR");
            return;
        } 
        else if (typeof input == "number") {
            fromIndex = 0;
            toIndex = 4;
        }

        let i = fromIndex || 0;
        let iMax = toIndex || ui8View.length;
        let outBin = "   Bin | ", outDec = "   Dec | ", outHex = "   Hex | ";
        
        while (i < iMax) {

            outHex = outHex + "   " + ui8View[i].toString(16).toUpperCase().padStart(2, '0') + "   ";
            outDec = outDec + (ui8View[i].toString(10) + "   ").padStart(8, " ");
            outBin = outBin + `${(ui8View[i] & 0x80) > 0 ? 1 : 0}${(ui8View[i] & 0x40) > 0 ? 1 : 0}${(ui8View[i] & 0x20) > 0 ? 1 : 0}${(ui8View[i] & 0x10) > 0 ? 1 : 0}`;
            outBin = outBin + `${(ui8View[i] & 0x8) > 0 ? 1 : 0}${(ui8View[i] & 0x4) > 0 ? 1 : 0}${(ui8View[i] & 0x2) > 0 ? 1 : 0}${(ui8View[i] & 0x1) > 0 ? 1 : 0}`;      

            i++;

            if (i < ui8View.length) {
                outHex = outHex + ' ';
                outDec = outDec + ' ';
                outBin = outBin + ' ';
            }
        }

        if ( headerStr != null ) {
            console.log(headerStr);
        }
        console.log(outHex);
        console.log(outDec);
        console.log(outBin);
    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array | Number} input 
     * @returns {Uint8Array?}
     */
    static asUInt8View(input) {

        if (typeof input == "number") {
            return new Uint8Array(new Int32Array([input]).buffer);
        }
        else if (this.#isTypedArray(input)) {
            return new Uint8Array(input.buffer);
        }
        else if (input instanceof ArrayBuffer) {
            return new Uint8Array(input);
        }
        else {
            return null;
        }
    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array | Number} input 
     * @returns {Uint16Array?}
     */
    static asUInt16View(input) {

        if (typeof input == "number") {
            return new Uint16Array(new Int32Array([input]).buffer);
        }
        else if (this.#isTypedArray(input)) {
            return new Uint16Array(input.buffer);
        }
        else if (input instanceof ArrayBuffer) {
            return new Uint16Array(input);
        }
        else {
            return null;
        }
    }

    /**
     * @param {ArrayBuffer | Int8Array | Uint8Array| Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array | Number} input 
     * @returns {ArrayBuffer?}
     */
    static asArrayBuffer(input) {

        if (typeof input == "number") {
            return new Int32Array([input]).buffer;
        }
        else if (this.#isTypedArray(input)) {
            return input.buffer;
        }
        else if (input instanceof ArrayBuffer) {
            return input;
        }
        else {
            return null;
        }
    }

    /**
     * @param {String} str 
     * @param {Boolean} [showWorkingOut]
     * @returns {String?}
     */
    static demunge(str, showWorkingOut = false) {

        if (showWorkingOut) console.log("Munged string: " + str);

        // Step 1: Load the string as a 16 bit unsigned Int ByteArray
        let step1 = this.stringToByteArray(str, false);

        if (showWorkingOut) this.asBinaryToConsole(step1, "Step 1: As a byte array (with endianness as per hardware)");

        // Step 2: If we're running on little-endian hardware perform a 16bit endian swap.
        //   - This will make hex and bits easier to read, and reduce code path complexity by only solving for one format. 
        let step2
        if (this.isHardwareLittleEndian()) {
            step2 = this.EndianSwap(step1, 2); 
        }
        else {
            step2 = step1;
        }

        if (step2 == null) return null;
        if (showWorkingOut) this.asBinaryToConsole(step2, "Step 2: Switched to big endian regardless of hardware");
        
        // Step 3: Undo Utf16 encoding into 4 byte raw unicode
        //   - When JavaScript loaded the string into memory, it thought it was 16 bit.
        //     So we need to undo this first and convert it to 4byte long raw unicode.
        let step3 = this.unpaddedUtf16ToRawUnicode(step2);

        if (step3 == null) return null;
        if (showWorkingOut) this.asBinaryToConsole(step3, "Step 3: Raw 32bit unicode, after removal of utf16 encoding (performed by JavaScript when loading literal into memory)");

        // Step 4: Undo HTML Spec Remapping
        //   - When JavaScript loaded the string into memory, because it thought it was processing 16bit, 
        //     if it found specific codes (that the HTML spec determines as parsing errors), then these were  
        //     remapped as part of the loading into memory. So we need to undo this transform too.
        //   - https://html.spec.whatwg.org/multipage/parsing.html#character-reference-code
        let step4 = this.undoHTMLSpecRemapping(step3);

        if (step4 == null) return null;
        if (showWorkingOut) this.asBinaryToConsole(step4, "Step 4: Raw 32bit unicode, after reversal of assumed parse errors as per the HTML Spec (performed by JavaScript when loading literal into memory)");

        // Step 5: Treat the raw unicode we have as utf8 ... because that's what it actually is!
        //   - We do this by condensing 4 bytes down to 1, stripping away what should be 3x 0x00 bytes 
        //     from the front of each quartet.  
        let step5 = UnicodeService.rawUnicodeAsCondensedUtf8(step4);
        
        if (step5 == null) return null;
        if (showWorkingOut) this.asBinaryToConsole(step5, "Step 5: After being condensed into utf8 (as was written to disk from the utf8 encoded file)");

        // Step 6: Undo Utf8 encoding into 4 byte raw unicode
        //   - We should now have utf8 encoding as it was originally written to disk.
        //     So we need to undo this encoding too, to get the actually true raw unicode values.
        let step6 = UnicodeService.unpaddedUtf8ToRawUnicode(step5);
        
        if (step6 == null) return null;
        if (showWorkingOut) this.asBinaryToConsole(step6, "Step 6: Raw 32bit unicode, after removal of utf8 encoding (This should be the actual raw unicode)");

        // Step 7: Encode the 4 byte raw unicode as Utf16
        //   - Now we can finally move forward and utf16 encode as JavaScript attempted to do at the start.
        //   - Note we're still working with 8bit at this stage, because we're managing our own endianness.
        let step7 = UnicodeService.paddedRawUnicodeToUtf16(step6);
        
        if (step7 == null) return null;
        if (showWorkingOut) this.asBinaryToConsole(step7, "Step 7: After being reencoded into utf16 (still big endian)");

        // Step 8: Revert the endianness
        let step8;
        if (this.isHardwareLittleEndian()) {
            step8 = this.EndianSwap(step7, 2); 
        }
        else {
            step8 = step7;
        }

        if (step8 == null) return null;
        if (showWorkingOut) this.asBinaryToConsole(step8, "Step 8: After restoring the current hardware's endianness (This should match the byte array JavaScript wants)");

        // Step 9: Convert back to 16bit
        let step9 = new Uint16Array(step8.buffer);
        if (showWorkingOut) this.asBinaryToConsole(step9, "Step 9: As a utf16 byte array, ready to be returned as a string.");
        if (showWorkingOut) console.log("   Str | " + String.fromCharCode(...step9));

        // Step 10: return the 16bit array as a string.
        return String.fromCharCode(...step9);
    }
}