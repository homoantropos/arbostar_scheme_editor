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
import { deleteScheme, retrieveScheme, saveCreatedScheme } from "../../entryGate/http/requests.js";

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
        newScheme.filepath = this.currentScheme.filepath;
        newScheme && (schemeEditorAPI.importDataToSchemeEditor('estimate').scheme = getSafeCopy(newScheme));
        this._currentScheme = newScheme ? getSafeCopy(newScheme) : newScheme;
        this.schemeOutput$.next(this._currentScheme);
        previewManager.allowSync && previewManager.setPreviewSrc(newScheme?.editedUrl || newScheme?.result || newScheme?.original || newScheme?.filepath);
        previewManager.allowSync = false;
    }

    seCurrentSchemeProperty(propertyName, propertyValue) {
        this.currentScheme[propertyName] = propertyValue;
        if(propertyName === 'result' || propertyName === 'editedUrl') {
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
            this._currentScheme = this.currentEstimate.scheme;
            this.schemeOutput$ = new BehaviorSubject(this.currentScheme);
        } catch (e) {
            console.error('Error while init scheme component: ', e);
        }
    }
    async createSchemeFromOriginalURLAndElementsObj(resWithSchemeOriginalURLAndElementsObj) {
        if(!model.respHasSchemeOriginalURLAndElementsObj(resWithSchemeOriginalURLAndElementsObj)) {
            debugMessageLogger.logDebug('createSchemeFromOriginalURLAndElementsObj() - arg is not proper model');
            return;
        }
        const data = model.getResponseData(resWithSchemeOriginalURLAndElementsObj);
        const { original, elements } = data;
        const dataUrl = await imagesManager.getSchemeAsDataUrlIfOnline(original);
        return await this.createScheme(dataUrl, dataUrl, elements, false);
    }
    createSchemeFromSchemePathAndElementsURLString(resWithSchemePathAndElementsURLString) {
        if(!model.respHasSchemePathAndElementsURLs(resWithSchemePathAndElementsURLString)) {
            debugMessageLogger.logDebug('createShemeFromSchemePathAndElementsURLString() - arg is not proper model');
            //return;
        }
    }
    createShemeFromSchemeWithoutSchemeElements(resWithoutSchemeElements) {
        if(!model.respHasOnlySchemePathURL(resWithoutSchemeElements)) {
            debugMessageLogger.logDebug('createShemeFromSchemeWithoutSchemeElements() - arg is not proper model');
            //return;
        }
    }

    initSchemeWithMapScreenShot(mapAsDataUrl) {
        const scheme = getSafeCopy(model.defaultScheme);
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
        scheme.id = this.currentEstimate.scheme?.id
        this.source = source;
        return scheme;
    }
    async fetchScheme(url) {
        try {
            let data = await retrieveScheme(url);
            let { elements } = model.getResponseData(data);
            if(elements && typeof elements === 'string') {
                data.data.elements = JSON.parse(elements);
            }
            let uploadedScheme;
            if(model.respHasSchemeOriginalURLAndElementsObj(data)) {
                uploadedScheme = await this.createSchemeFromOriginalURLAndElementsObj(data);
            } else if(model.respHasSchemePathAndElementsURLs(data)) {
                console.log('origin and elpath: ', data);
                //uploadedScheme = await this.createSchemeFromSchemePathAndElementsURLString(data);
            } else if(!model.respHasOnlySchemePathURL(data)) {
                console.log('origin and without elpath: ', data);
                //uploadedScheme = await this.createShemeFromSchemeWithoutSchemeElements(data);
            }
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
                if(model.respHasSchemePathAndElementsURLs(data) || model.respHasOnlySchemePathURL(data)) {
                    this.seCurrentSchemeProperty('result', data.path + '?' + String(Date.now()));
                    this.seCurrentSchemeProperty('filepath', previewManager.getFullPath(data.path));
                } else {
                    console.log('else: ', data);
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
            if(id && file) {
                const response = await deleteScheme(url, {lead_id, id, file});
                if(response && response.status) {
                    this.setCurrentScheme(model.defaultScheme);
                    this.source = true;
                }
                return response;
            } else {
                this.setCurrentScheme(model.defaultScheme);
                this.source = true;
                return true;
            }
        } catch (error) {
            console.log('Error while scheme saving: ', error);
        }
    }
    destroySchemeService() {
        this.setCurrentScheme(model.defaultScheme);
    }
}

export default new SchemeManager();