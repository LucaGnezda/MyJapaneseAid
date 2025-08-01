/**
 * Typedefs
 * @typedef {{
 *      gojuonKey: string,
 *      startsWith: string?,
 *      isOther: boolean,
 *      index: number,
 *      title: string?,
 *      subTitle: string?,
 * }} GojuonGrouping
 */

/**
 * Unicode processing object, compensates for scenarios where strings get munged between UTF8 and UTF16
 * @class
 * @public
 */
class GojuonGroupingService {
   

    /** ---- Private Properties ---- */
    /** @type {GojuonGrouping[]} */
    static #gojuonGroupings = [
        {"gojuonKey":"xx", "startsWith":null, "isOther": true,  "index": 0,  "title":"Non Kana", "subTitle":""},
        {"gojuonKey":"-a", "startsWith":"ぁ", "isOther": false, "index": 1,  "title":"あ", "subTitle":"a"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"-i", "startsWith":"ぃ", "isOther": false, "index": 2,  "title":"い", "subTitle":"i"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"-u", "startsWith":"ぅ", "isOther": false, "index": 3,  "title":"う", "subTitle":"u"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"-e", "startsWith":"ぇ", "isOther": false, "index": 4,  "title":"え", "subTitle":"e"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"-o", "startsWith":"ぉ", "isOther": false, "index": 5,  "title":"お", "subTitle":"o"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"ka", "startsWith":"か", "isOther": false, "index": 6,  "title":"か", "subTitle":"ka, ga"},
        {"gojuonKey":"ki", "startsWith":"き", "isOther": false, "index": 7,  "title":"き", "subTitle":"ki, gi, kya, kyu, kyo, gya, gyu, gyo"},
        {"gojuonKey":"ku", "startsWith":"く", "isOther": false, "index": 8,  "title":"く", "subTitle":"ku, gu"},
        {"gojuonKey":"ke", "startsWith":"け", "isOther": false, "index": 9,  "title":"け", "subTitle":"ke, ge"},
        {"gojuonKey":"ko", "startsWith":"こ", "isOther": false, "index": 10, "title":"こ", "subTitle":"ko, go"},
        {"gojuonKey":"sa", "startsWith":"さ", "isOther": false, "index": 11, "title":"さ", "subTitle":"sa, za"},
        {"gojuonKey":"si", "startsWith":"し", "isOther": false, "index": 12, "title":"し", "subTitle":"shi, ji, sha, shu, sho, ja, ju, jo"},
        {"gojuonKey":"su", "startsWith":"す", "isOther": false, "index": 13, "title":"す", "subTitle":"su, zu"},
        {"gojuonKey":"se", "startsWith":"せ", "isOther": false, "index": 14, "title":"せ", "subTitle":"se, ze"},
        {"gojuonKey":"so", "startsWith":"そ", "isOther": false, "index": 15, "title":"そ", "subTitle":"so, zo"},
        {"gojuonKey":"ta", "startsWith":"た", "isOther": false, "index": 16, "title":"た", "subTitle":"ta, da"},
        {"gojuonKey":"ti", "startsWith":"ち", "isOther": false, "index": 17, "title":"ち", "subTitle":"chi, ji, cha, chu, cho, ja, ju, jo"},
        {"gojuonKey":"tu", "startsWith":"っ", "isOther": false, "index": 18, "title":"つ", "subTitle":"tsu, zu"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"te", "startsWith":"て", "isOther": false, "index": 19, "title":"て", "subTitle":"te, de"},
        {"gojuonKey":"to", "startsWith":"と", "isOther": false, "index": 20, "title":"と", "subTitle":"to, do"},
        {"gojuonKey":"na", "startsWith":"な", "isOther": false, "index": 21, "title":"な", "subTitle":"na"},
        {"gojuonKey":"ni", "startsWith":"に", "isOther": false, "index": 22, "title":"に", "subTitle":"ni, nya, nyu, nyo"},
        {"gojuonKey":"nu", "startsWith":"ぬ", "isOther": false, "index": 23, "title":"ぬ", "subTitle":"nu"},
        {"gojuonKey":"ne", "startsWith":"ね", "isOther": false, "index": 24, "title":"ね", "subTitle":"ne"},
        {"gojuonKey":"no", "startsWith":"の", "isOther": false, "index": 25, "title":"の", "subTitle":"no"},
        {"gojuonKey":"ha", "startsWith":"は", "isOther": false, "index": 26, "title":"は", "subTitle":"ha, ba, pa"},
        {"gojuonKey":"hi", "startsWith":"ひ", "isOther": false, "index": 27, "title":"ひ", "subTitle":"hi, bi, pi, hya, hyu, hyo, bya, byu, byo, pya, pyu, pyo"},
        {"gojuonKey":"hu", "startsWith":"ふ", "isOther": false, "index": 28, "title":"ふ", "subTitle":"hu, bu, pu"},
        {"gojuonKey":"he", "startsWith":"へ", "isOther": false, "index": 29, "title":"へ", "subTitle":"he, be, pe"},
        {"gojuonKey":"ho", "startsWith":"ほ", "isOther": false, "index": 30, "title":"ほ", "subTitle":"ho, bo, po"},
        {"gojuonKey":"ma", "startsWith":"ま", "isOther": false, "index": 31, "title":"ま", "subTitle":"ma"},
        {"gojuonKey":"mi", "startsWith":"み", "isOther": false, "index": 32, "title":"み", "subTitle":"mi, mya, myu, myo"},
        {"gojuonKey":"mu", "startsWith":"む", "isOther": false, "index": 33, "title":"む", "subTitle":"mu"},
        {"gojuonKey":"me", "startsWith":"め", "isOther": false, "index": 34, "title":"め", "subTitle":"me"},
        {"gojuonKey":"mo", "startsWith":"も", "isOther": false, "index": 35, "title":"も", "subTitle":"mo"},
        {"gojuonKey":"ya", "startsWith":"ゃ", "isOther": false, "index": 36, "title":"や", "subTitle":"ya"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"yu", "startsWith":"ゅ", "isOther": false, "index": 37, "title":"ゆ", "subTitle":"yu"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"yo", "startsWith":"ょ", "isOther": false, "index": 38, "title":"よ", "subTitle":"yo"}, // Note small hiragana variant used for startswith
        {"gojuonKey":"ra", "startsWith":"ら", "isOther": false, "index": 39, "title":"ら", "subTitle":"ra"},
        {"gojuonKey":"ri", "startsWith":"り", "isOther": false, "index": 40, "title":"り", "subTitle":"ri, rya, ryu, ryo"},
        {"gojuonKey":"ru", "startsWith":"る", "isOther": false, "index": 41, "title":"る", "subTitle":"ru"},
        {"gojuonKey":"re", "startsWith":"れ", "isOther": false, "index": 42, "title":"れ", "subTitle":"re"},
        {"gojuonKey":"ro", "startsWith":"ろ", "isOther": false, "index": 43, "title":"ろ", "subTitle":"ro"},
        {"gojuonKey":"wa", "startsWith":"わ", "isOther": false, "index": 44, "title":"わ", "subTitle":"wa"},
        {"gojuonKey":"wo", "startsWith":"を", "isOther": false, "index": 45, "title":"を", "subTitle":"wo(o)"},
        {"gojuonKey":"nn", "startsWith":"ん", "isOther": false, "index": 46, "title":"ん", "subTitle":"n"},
        {"gojuonKey":"kanji", "startsWith":"ゞ", "isOther": false, "index": 46, "title":"漢字", "subTitle":"kanji"},
    ];

    /** @type {Number} */
    static #gojuonIndexOther = 0;

    /** @type {String} */
    static #beforeRange = String.fromCharCode(0x3041 - 1);

    /** @type {String} */
    static #beyondRange = String.fromCharCode(0x9FFF + 1);

    /** @type {Boolean} */
    static #isInitialised = false;

    /** ---- Accessors ---- */
    static get gojuonGroupings() {
        GojuonGroupingService.#initialiseGojuonGroupingsIfRequired();
        return GojuonGroupingService.#gojuonGroupings;
    }


    /** ---- Private Methods ---- */
    static #initialiseGojuonGroupingsIfRequired () {

        if (!GojuonGroupingService.#isInitialised) {
            
            GojuonGroupingService.#gojuonGroupings.forEach((item) => {
                // Do all just in case we eventually include Japanese Characters there
                let gojuonKey = UnicodeService.demunge(item.gojuonKey);

                if (gojuonKey != null) {
                    item.gojuonKey = gojuonKey;
                    item.startsWith = UnicodeService.demunge(item.startsWith?item.startsWith:"");
                    item.title = UnicodeService.demunge(item.title?item.title:"");
                    item.subTitle = UnicodeService.demunge(item.subTitle?item.subTitle:"");
                }
            });

            GojuonGroupingService.#isInitialised = true;
        }
    }

    /**
     * @param {String} a 
     * @param {String} b
     * @returns {Boolean}
     */
    static #lessThanB(a, b) {
        return a.localeCompare(b, 'ja') < 0 ? true : false;
    }

    /**
     * @param {String} a 
     * @param {String} b
     * @returns {Boolean}
     */
    static #lessThanEqualB(a, b) {
        return a.localeCompare(b, 'ja') <= 0 ? true : false;
    }

    /**
     * @param {String} a 
     * @param {String} b
     * @returns {Boolean}
     */
    static #greaterThanEqualB(a, b) {
        return a.localeCompare(b, 'ja') >= 0 ? true : false;
    }

    /**
     * @param {String} a 
     * @param {String} b
     * @returns {Boolean}
     */
    static #greaterThanB(a, b) {
        return a.localeCompare(b, 'ja') > 0 ? true : false;
    }


    /** ---- Public Methods ---- */
    /**
     * @param {String} str 
     * @param {Number?} fromIndex
     * @param {Number?} toIndex
     * @returns {GojuonGrouping?}
     */
    static getGroupingFor(str, fromIndex = null, toIndex = null) {

        if (fromIndex == null || toIndex == null) {
            GojuonGroupingService.#initialiseGojuonGroupingsIfRequired();
            fromIndex = 0;
            toIndex = GojuonGroupingService.#gojuonGroupings.length; // note we're intetinonally overflowing the length here, because we only test the from and stop one short, but still need to test beyond the last start.

            /** @ts-ignore */
            if (str <= GojuonGroupingService.#beforeRange || 
                str >= GojuonGroupingService.#beyondRange) {
                /** @ts-ignore */
                return GojuonGroupingService.#gojuonGroupings[GojuonGroupingService.#gojuonIndexOther];
            }
        }

        if (fromIndex >= toIndex - 1) {
            /** @ts-ignore */
            //if (GojuonGroupingService.#greaterThanEqualB(str, GojuonGroupingService.#gojuonGroupings[toIndex].startsWith)) {
            //    return GojuonGroupingService.#gojuonGroupings[toIndex];
            //}
            //else {
                return GojuonGroupingService.#gojuonGroupings[fromIndex];
            //}
        }
        else {

            let midIndex = Math.floor((toIndex + fromIndex)/2);

            /** @ts-ignore */
            if (GojuonGroupingService.#lessThanB(str, GojuonGroupingService.#gojuonGroupings[midIndex].startsWith)) {
                return GojuonGroupingService.getGroupingFor(str, fromIndex, midIndex);
            }
            else {
                return GojuonGroupingService.getGroupingFor(str, midIndex, toIndex);
            }
        }
    }
}