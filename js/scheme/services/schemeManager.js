import { imagesManager } from "./imagesManager.js";
import { getSafeCopy } from "../utils/safeJsonParser.js";
import { model } from "../model/model.js";
import {keys} from "../config/keys.js";

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
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Referer': 'https://stageapp.arbostar.com/',
                    'Authorization': keys.token
                },
                body: JSON.stringify({
                    lead_id: 34091
                })
            });

            if (!response.ok) {
                throw response;
            }
            const data = await response.json();
            const uploadedScheme = await schemeManager.createSchemeFromOriginalURLAndElementsObj(data);
            if(model.objectIsScheme(uploadedScheme)) {
                this._currentScheme = getSafeCopy(uploadedScheme);
            }
        } catch (error) {
            console.log(error);
        }
    }
    destroySchemeService() {
        this._currentScheme = null;
    }
}

export const schemeManager = new SchemeManager();