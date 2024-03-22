import debugMessageLogger from "../utils/debugMessageLogger.js";
import imagesManager from "./previewManager.js";
import mapManager from "./mapManager.js";
import model from "../model/model.js";
import previewManager from "./previewManager.js";
import requestsBodyProvider from "../../entryGate/http/requestsBodyProvider.js";
import schemeEditorAPI from "../../entryGate/mainCodeBridge/schemeEditorAPI.js";
import schemeViewController from "./schemeViewController.js";
import { getSafeCopy } from "../utils/safeJsonParser.js";
import { config } from "../config/config.js";
import { deleteScheme, retrieve, saveCreatedScheme } from "../../entryGate/http/requests.js";

const { BehaviorSubject } = rxjs;

class SchemeManager {
    currentEstimate;
    _currentScheme = null;
    schemeOutput$;
    source = true;
    get currentScheme() {
        return this._currentScheme;
    }

    setCurrentScheme(newScheme) {
        newScheme && (schemeEditorAPI.importDataToSchemeEditor('estimate').scheme = getSafeCopy(newScheme));
        this._currentScheme = newScheme ? getSafeCopy(newScheme) : newScheme;
        this.schemeOutput$.next(this._currentScheme);
        previewManager.setPreviewSrc(newScheme?.editedUrl || newScheme?.result || newScheme?.original);
    }

    seCurrentSchemeProperty(propertyName, propertyValue) {
        this.currentScheme[propertyName] = propertyValue;
        if(propertyName === 'original' || propertyName === 'editedUrl') {
            previewManager.setPreviewSrc(propertyValue);
        }
        this.schemeOutput$.next(this._currentScheme);
    }

    async initSchemeComponent() {
        try {
            schemeViewController.viewNavigationRouter$.next({load: true, targetElementName: 'mapContainer'});
            this.currentEstimate = schemeEditorAPI.importDataToSchemeEditor('estimate');
            if (this.currentEstimate.scheme?.result) {
                previewManager.initSchemePreview(this.currentEstimate.scheme?.result);
                schemeViewController.viewNavigationRouter$.next({load: false, targetElementName: 'previewContainer'});
            } else {
                await mapManager.initMap();
                schemeViewController.viewNavigationRouter$.next({load: false, targetElementName: 'mapContainer'});
            }
            this.schemeOutput$ = new BehaviorSubject(this.currentScheme);
        } catch (e) {
            console.error('Error while init scheme component: ', e);
        }
    }
    async createSchemeFromOriginalURLAndElementsObj(resWithSchemeOriginalURLAndElementsObj) {
        if(!model.respHasSchemeOriginalURLAndElementsObj(resWithSchemeOriginalURLAndElementsObj)) return;
        const { original, elements } = model.getResponseData(resWithSchemeOriginalURLAndElementsObj);
        const dataUrl = await imagesManager.getSchemeAsDataUrlIfOnline(original);
        return await this.createScheme(dataUrl, dataUrl, elements, false);
    }
    // createShemeFromSchemePathAndElementsURLString(resWithSchemePathAndElementsURLString) {
    //     if(!model.respHasSchemePathAndElementsURLs(resWithSchemePathAndElementsURLString)) return;
    // }
    // createShemeFromSchemeWithoutSchemeElements(resWithoutSchemeElements) {
    //     if(!model.respHasOnlySchemePathURL(resWithoutSchemeElements)) return;
    // }

    initSchemeWithMapScreenShot(mapAsDataUrl) {
        const scheme = getSafeCopy(model.defaultScheme);
        scheme.editedUrl = mapAsDataUrl;
        scheme.original = mapAsDataUrl;
        scheme.result = mapAsDataUrl;
        this.setCurrentScheme(scheme);
    }
    async createScheme(schemeDataUrl, schemeOriginal, schemeElements, source) {
        if(!(arguments.length >= 3 || arguments.length <= 4)) {
            debugMessageLogger.logDebug(`createScheme() should has 3 or 4 arg, got ${arguments.length}`);
            return;
        }
        if(schemeDataUrl.startsWith('http')) {
            schemeDataUrl = await imagesManager.getSchemeAsDataUrlIfOnline(schemeDataUrl + '?' + String(Date.now()));
        }
        const scheme = getSafeCopy(model.defaultScheme);
        scheme.dataUrl = schemeDataUrl;
        scheme.original = schemeOriginal;
        scheme.width = schemeElements.width;
        scheme.height = schemeElements.height;
        scheme.elements = getSafeCopy(schemeElements);
        this.source = source;
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
            const response = await saveCreatedScheme(body, url);
            if(response && response.status) {
                const data = model.getResponseData(response);
                if(model.respHasSchemePathAndElementsURLs(data)) {
                    this.seCurrentSchemeProperty('result', data.path + '?' + String(Date.now()));
                }
                this.setCurrentScheme(this._currentScheme);
                this.source = false;
            }
            return response;
        } catch (error) {
            console.log('Error while scheme saving: ', error);
        }
    }

    async deleteScheme({lead_id, id, file}) {
        try {
            const url = config.apiRoute + '/estimates/deleteDraftFile';
            const response = await deleteScheme(url, {lead_id, id, file});
            if(response && response.status) {
                this.setCurrentScheme(model.defaultScheme);
                this.source = true;
            }
            return response;
        } catch (error) {
            console.log('Error while scheme saving: ', error);
        }
    }
    destroySchemeService() {
        this.setCurrentScheme(model.defaultScheme);
    }
}

export default new SchemeManager();