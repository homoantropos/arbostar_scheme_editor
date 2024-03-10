import { imagesManager } from "./imagesManager.js";
import { getSafeCopy } from "../utils/safeJsonParser.js";
import { model } from "../model/model.js";
import { retrieve, retrieveMockImage } from "../../entryGate/http/requests.js";

class SchemeManager {
    _currentScheme = null;
    initSchemeService() {}
    async createSchemeFromOriginalURLAndElementsObj(resWithSchemeOriginalURLAndElementsObj) {
        if(!model.respHasSchemeOriginalURLAndElementsObj(resWithSchemeOriginalURLAndElementsObj)) return;
        const { original, elements } = model.getResponseData(resWithSchemeOriginalURLAndElementsObj);
        const dataUrl = await imagesManager.getSchemeAsDataUrlIfOnline(original);
        return await this.createSchemeImageFromDataUrl(dataUrl, dataUrl, elements);
    }
    // createShemeFromSchemePathAndElementsURLString(resWithSchemePathAndElementsURLString) {
    //     if(!model.respHasSchemePathAndElementsURLs(resWithSchemePathAndElementsURLString)) return;
    // }
    // createShemeFromSchemeWithoutSchemeElements(resWithoutSchemeElements) {
    //     if(!model.respHasOnlySchemePathURL(resWithoutSchemeElements)) return;
    // }


    async createSchemeImageFromDataUrl(schemeDataUrl, schemeOriginal, schemeElements) {
        if(arguments.length !== 3) return;
        if(schemeDataUrl.startsWith('http')) {
            schemeDataUrl = await imagesManager.getSchemeAsDataUrlIfOnline(schemeDataUrl);
        }
        const scheme = getSafeCopy(model.defaultScheme);
        scheme.dataUrl = schemeDataUrl;
        scheme.original = schemeOriginal;
        scheme.width = schemeElements.width;
        scheme.height = schemeElements.height;
        scheme.elements = getSafeCopy(schemeElements);
        return scheme;
    }
    async fetchScheme(url) {
        try {
            const data = await retrieve(url);
            const uploadedScheme = await schemeManager.createSchemeFromOriginalURLAndElementsObj(data);
            if(model.objectIsScheme(uploadedScheme)) {
                this._currentScheme = getSafeCopy(uploadedScheme);
            }
        } catch (error) {
            console.log('Error while scheme retrieving: ', error);
        }
    }
    async mockFetchScheme(){
        const scheme = await retrieveMockImage();
        this._currentScheme = {
            original: scheme.url,
            elements: scheme.objects,
            // when scheme is just taken
            dataUrl: scheme.objects,
            height: scheme.objects.height,
            width: scheme.objects.width
        }
        console.log(this._currentScheme);
    }
    destroySchemeService() {
        this._currentScheme = null;
    }
}

export const schemeManager = new SchemeManager();