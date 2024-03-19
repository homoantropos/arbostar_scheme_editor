import imagesManager from "./previewManager.js";
import { getSafeCopy } from "../utils/safeJsonParser.js";
import model from "../model/model.js";
import {retrieve, retrieveMockImage, saveCreatedScheme} from "../../entryGate/http/requests.js";
import debugMessageLogger from "../utils/debugMessageLogger.js";
import {config} from "../config/config.js";
import schemeViewController from "./schemeViewController.js";
import mapManager from "./mapManager.js";
import previewManager from "./previewManager.js";
import schemeEditorAPI from "../../entryGate/mainCodeBridge/schemeEditorAPI.js";
import requestsBodyProvider from "../../entryGate/http/requestsBodyProvider.js";

class SchemeManager {
    _currentScheme = null;
    get currentScheme() {
        return this._currentScheme;
    }

    setCurrentScheme(newScheme) {
        this._currentScheme = getSafeCopy(newScheme);
    }

    seCurrentSchemeProperty(propertyName, propertyValue) {
        this.currentScheme[propertyName] = propertyValue;
    }

    async initSchemeComponent() {
        try {
            schemeViewController.viewNavigationRouter$.next({load: true, targetElementName: 'mapContainer'});
            const mockEstimate = schemeEditorAPI.importDataToSchemeEditor('estimate');
            if (mockEstimate.scheme.result) {
                previewManager.initSchemePreview(mockEstimate.scheme.result);
                schemeViewController.viewNavigationRouter$.next({load: false, targetElementName: 'previewContainer'});
            } else {
                mapManager.initMap().then(
                    () => schemeViewController.viewNavigationRouter$.next({
                            load: false,
                            targetElementName: 'mapContainer'
                        }
                    ));
                //schemeViewController.viewNavigationRouter$.next({ load: false, targetElementName: 'mapContainer' });
            }
        } catch (e) {
            console.error('Error while init scheme component: ', e);
        }
    }
    async createSchemeFromOriginalURLAndElementsObj(resWithSchemeOriginalURLAndElementsObj) {
        if(!model.respHasSchemeOriginalURLAndElementsObj(resWithSchemeOriginalURLAndElementsObj)) return;
        const { original, elements } = model.getResponseData(resWithSchemeOriginalURLAndElementsObj);
        const dataUrl = await imagesManager.getSchemeAsDataUrlIfOnline(original);
        return await this.createScheme(dataUrl, dataUrl, elements);
    }
    // createShemeFromSchemePathAndElementsURLString(resWithSchemePathAndElementsURLString) {
    //     if(!model.respHasSchemePathAndElementsURLs(resWithSchemePathAndElementsURLString)) return;
    // }
    // createShemeFromSchemeWithoutSchemeElements(resWithoutSchemeElements) {
    //     if(!model.respHasOnlySchemePathURL(resWithoutSchemeElements)) return;
    // }

    initSchemeWithMapScreenShot(mapAsDataUrl) {
        const scheme = getSafeCopy(model.defaultScheme);
        scheme.original = mapAsDataUrl;
        this.setCurrentScheme(scheme);
    }
    async createScheme(schemeDataUrl, schemeOriginal, schemeElements) {
        if(arguments.length !== 3) {
            debugMessageLogger.logDebug('should be 3 arg')
            return;
        }
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
            let data = await retrieve(url);
            if(data && data.data.elements && typeof data.data.elements === 'string') {
                data.data.elements = JSON.parse(data.data.elements);
            }
            const uploadedScheme = await this.createSchemeFromOriginalURLAndElementsObj(data);
            if(model.objectIsScheme(uploadedScheme)) {
                this.setCurrentScheme(getSafeCopy(uploadedScheme));
            }
        } catch (error) {
            console.log('Error while scheme retrieving: ', error);
        }
    }

    async saveScheme() {
        try {
            const body = requestsBodyProvider.getBodyForSaveScheme(this.currentScheme);
            const url = config.apiRoute + '/estimates/presave_scheme';
            let data = await saveCreatedScheme(body, url);
            console.log('response: ', data);
        } catch (error) {
            console.log('Error while scheme saving: ', error);
        }
    }

    destroySchemeService() {
        this.setCurrentScheme(null);
    }
}

export default new SchemeManager();