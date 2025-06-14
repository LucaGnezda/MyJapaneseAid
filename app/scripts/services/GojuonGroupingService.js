/**
 * Typedefs
 * @typedef {{
 *      gojuonKey: string?,
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
    static #gojuonGroupings = [];

    /** @type {Number?} */
    static #gojuonIndexOther = null;

    /** @type {String?} */
    static #beyondRange = null;

    /** ---- Accessors ---- */
    static get gojuonGroupings() {
        GojuonGroupingService.#initialiseGojuonGroupingsIfRequired();
        return GojuonGroupingService.#gojuonGroupings;
    }


    /** ---- Private Methods ---- */
    static #initialiseGojuonGroupingsIfRequired () {

        if (GojuonGroupingService.#gojuonGroupings.length == 0) {

            GojuonGroupingService.#gojuonGroupings.push(
                {"gojuonKey":"xx", "startsWith":null, "isOther": true,  "index": 0,  "title":"Non Kana", "subTitle":"Cards not starting with kana."},
                {"gojuonKey":"-a", "startsWith":"あ", "isOther": false, "index": 1,  "title":"あ", "subTitle":"a"},
                {"gojuonKey":"-i", "startsWith":"い", "isOther": false, "index": 2,  "title":"い", "subTitle":"i"},
                {"gojuonKey":"-u", "startsWith":"う", "isOther": false, "index": 3,  "title":"う", "subTitle":"u"},
                {"gojuonKey":"-e", "startsWith":"え", "isOther": false, "index": 4,  "title":"え", "subTitle":"e"},
                {"gojuonKey":"-o", "startsWith":"お", "isOther": false, "index": 5,  "title":"お", "subTitle":"o"},
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
                {"gojuonKey":"tu", "startsWith":"つ", "isOther": false, "index": 18, "title":"つ", "subTitle":"tsu, zu"},
                {"gojuonKey":"te", "startsWith":"て", "isOther": false, "index": 19, "title":"て", "subTitle":"te, de"},
                {"gojuonKey":"to", "startsWith":"と", "isOther": false, "index": 20, "title":"と", "subTitle":"to, do"},
                {"gojuonKey":"na", "startsWith":"な", "isOther": false, "index": 21, "title":"な", "subTitle":"na"},
                {"gojuonKey":"ni", "startsWith":"に", "isOther": false, "index": 22, "title":"に", "subTitle":"ni, nya, nyu, nyo"},
                {"gojuonKey":"nu", "startsWith":"に", "isOther": false, "index": 23, "title":"ぬ", "subTitle":"nu"},
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
                {"gojuonKey":"ya", "startsWith":"や", "isOther": false, "index": 36, "title":"や", "subTitle":"ya"},
                {"gojuonKey":"yu", "startsWith":"ゆ", "isOther": false, "index": 37, "title":"ゆ", "subTitle":"yu"},
                {"gojuonKey":"yo", "startsWith":"よ", "isOther": false, "index": 38, "title":"よ", "subTitle":"yo"},
                {"gojuonKey":"ra", "startsWith":"ら", "isOther": false, "index": 39, "title":"ら", "subTitle":"ra"},
                {"gojuonKey":"ri", "startsWith":"り", "isOther": false, "index": 40, "title":"り", "subTitle":"ri, rya, ryu, ryo"},
                {"gojuonKey":"ru", "startsWith":"る", "isOther": false, "index": 41, "title":"る", "subTitle":"ru"},
                {"gojuonKey":"re", "startsWith":"れ", "isOther": false, "index": 42, "title":"れ", "subTitle":"re"},
                {"gojuonKey":"ro", "startsWith":"ろ", "isOther": false, "index": 43, "title":"ろ", "subTitle":"ro"},
                {"gojuonKey":"wa", "startsWith":"わ", "isOther": false, "index": 44, "title":"わ", "subTitle":"wa"},
                {"gojuonKey":"wo", "startsWith":"を", "isOther": false, "index": 45, "title":"を", "subTitle":"wo(o)"},
                {"gojuonKey":"nn", "startsWith":"ん", "isOther": false, "index": 46, "title":"ん", "subTitle":"n"},
            );

            GojuonGroupingService.#gojuonIndexOther = 46;
            GojuonGroupingService.#beyondRange = String.fromCharCode(0x9FFF + 1);

            GojuonGroupingService.#gojuonGroupings.forEach((item) => {
                    // Do all just in case we eventually include Japanese Characters there
                    item.gojuonKey = UnicodeService.demunge(item.gojuonKey?item.gojuonKey:"");
                    item.startsWith = UnicodeService.demunge(item.startsWith?item.startsWith:"");
                    item.title = UnicodeService.demunge(item.title?item.title:"");
                    item.subTitle = UnicodeService.demunge(item.subTitle?item.subTitle:"");
            });
        }
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
            toIndex = GojuonGroupingService.#gojuonGroupings.length - 1; 

            /** @ts-ignore */
            if (str < GojuonGroupingService.#gojuonGroupings[0].startsWith || str >= GojuonGroupingService.#beyondRange) {
                /** @ts-ignore */
                return GojuonGroupingService.#gojuonGroupings[GojuonGroupingService.#gojuonIndexOther];
            }
        }

        if (fromIndex >= toIndex - 1) {
            /** @ts-ignore */
            return GojuonGroupingService.#gojuonGroupings[fromIndex];
        }

        let midIndex = Math.floor((toIndex + fromIndex)/2);

        /** @ts-ignore */
        if (str < GojuonGroupingService.#gojuonGroupings[midIndex].startsWith ) {
            return GojuonGroupingService.getGroupingFor(str, fromIndex, midIndex);
        }
        else {
            return GojuonGroupingService.getGroupingFor(str, midIndex, toIndex);
        }
    }
}