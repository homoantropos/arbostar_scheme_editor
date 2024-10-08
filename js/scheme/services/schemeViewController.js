import { BehaviorSubject, Subject, takeUntil } from "rxjs";
import fabricManager from "./fabricManager.js";
import mapManager from "./mapManager.js";
import debugMessageLogger from "../utils/debugMessageLogger.js";
import model from "../model/model.js";
import {config} from "../config/config.js";
import galleryToolsViewController from "./galleryToolsViewController.js";
import {
    getDOMElement,
    getUiElement,
    getUiElementsObjKeys,
    setElementsVisibility,
    setUIElementsWithListeners
} from "../utils/viewManager.js";
import schemeManager from "./schemeManager.js";
import previewManager from "./previewManager.js";

// css smooth transition
const transitionValue = '0.3s ease-out';

class SchemeViewController {
    constructor() { }

    showSchemeComponent(schemeDivEl) {
        schemeManager.initSchemeComponent().then(
            () => {
                this.initViewController();
                if(!schemeDivEl) return;
                schemeDivEl.style.display = config.display.flex;
                schemeDivEl.classList.add('enter-animation');
                schemeDivEl.classList.remove('leave-animation');
            }
        );
    }

    hideSchemeComponent(schemeDivEl) {
        schemeDivEl.classList.add('leave-animation');
        schemeDivEl.classList.remove('enter-animation');
        schemeDivEl.addEventListener('animationend', () => {
            if(schemeDivEl.classList.contains('leave-animation')) {
                schemeDivEl.style.display = config.display.none;
            }
        }, {once: true});
        this.destroyViewController();
    }
    setToggleButtonOnProjectStart(event) {
        event.stopPropagation();
        const toggleButton = getDOMElement('#toggleSchemeButton');
        const divToggle = getDOMElement('#schemeComponent');

        toggleButton.addEventListener('click', () => {
            const displayStyle = getComputedStyle(divToggle).display;
            if(displayStyle === config.display.none) {
                this.showSchemeComponent(divToggle)
            } else {
                this.hideSchemeComponent(divToggle);
            }
        });
        getDOMElement('.toggle__button').disabled = false;
        getDOMElement('.component__loader').style.display = config.display.none;
    }
    initViewController() {
        setUIElementsWithListeners(this.schemeUiElements);
        this.initNavigatorSubscription();
    }
    destroyViewController() {
        this.destroy$.next();
        this.destroy$.complete();
        this.navigatorSunscribtion = null;
    }
    // navigation between views
    viewNavigationRouter$ = new BehaviorSubject({load: false, targetElementName: 'mapContainer'});
    destroy$ = new Subject();
    navigatorSunscribtion = null;
    initNavigatorSubscription() {
        if(!this.navigatorSunscribtion) {
            this.navigatorSunscribtion =  this.viewNavigationRouter$.pipe(takeUntil(this.destroy$)).subscribe({
                    next: ({load, targetElementName}) => {
                        if(!model.viewNavigatorArgValid({load, targetElementName})) {
                            debugMessageLogger.logDebug('setLoader should be such object { load: boolean, targetElementName: string }');
                            return;
                        }
                        this.changeActiveView(load, targetElementName);
                    },
                    error: (error) => console.error('Error while loader set: ', error)
                }
            );
        }
    }
    changeActiveView(load, targetElementName) {
        if (load) {
            const buttonsNames = this.getSchemeUiElement(targetElementName)['currentButtons'];
            this.showElements(['schemeWrapper', 'loader', ...buttonsNames]);
            this.disableAllButtons();
        } else {
            this.showElements(this.getSchemeUiElement(targetElementName).elements);
            this.enableAllButtons();
        }
    }
    // elements visibility
    setSchemeUIElementVisibility(schemeElementUiName, hide) {
        setElementsVisibility(this.schemeUiElements, schemeElementUiName, hide);
    }

    showElement(schemeElementUiName) {
        this.setSchemeUIElementVisibility(schemeElementUiName, false);
    }

    hideElement(schemeElementUiName) {
        this.setSchemeUIElementVisibility(schemeElementUiName, true);
    }

    showElements(namesElementsToShowArray) {
        if (!Array.isArray(namesElementsToShowArray)) return;
        const checkType = namesElementsToShowArray.every(el => typeof el === 'string');
        if (!checkType) return;
        this.schemeUiElementsKeys.map(
            key => {
                namesElementsToShowArray.includes(key) ? this.showElement(key) : this.hideElement(key);
            }
        );
    }

    // buttons disable attribute
    setButtonDisabledState(buttonName, disableSate) {
        const button = this.getSchemeUiElement(buttonName);
        button.hide = disableSate;
        button.disabled = disableSate;
        button.targetElement && (button.targetElement.disabled = button.disabled);
    }

    enableButton(elementName) {
        this.setButtonDisabledState(elementName, false)
    }

    disableButton(elementName) {
        this.setButtonDisabledState(elementName, true)
    }

    enableAllButtons() {
        this.schemeButtons.forEach(
            elementName => this.enableButton(elementName)
        )
    }

    disableAllButtons() {
        this.schemeButtons.forEach(
            elementName => this.disableButton(elementName)
        )
    }

    // scheme dom elements and config
    getSchemeUiElement(elementName) {
        return getUiElement(this.schemeUiElements, elementName);
    }

    getUiElementsObjKeys(uiElementsKeysObj) {
        return Object.keys(uiElementsKeysObj);
    }

    get schemeUiElementsKeys() {
        return getUiElementsObjKeys(this.schemeUiElements);
    }
    get schemeButtons() {
        return this.schemeUiElementsKeys.filter(key => key.includes('Button'))
    }

    get schemeDivs() {
        this.schemeUiElementsKeys.filter(key => !key.includes('Button'))
    }

    schemeUiElements = Object.seal({
        schemeWrapper: {
            elementClass: 'scheme__wrapper',
            targetElement: undefined,
            display: config.display.flex,
            hide: false,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                    }
                }
            ]
        },
        mapContainer: {
            elementClass: 'map__container',
            targetElement: undefined,
            display: config.display.flex,
            hide: false,
            elements: ['schemeWrapper', 'mapContainer', 'takeScreenButton', 'closeMapButton'],
            currentButtons: ['takeScreenButton', 'closeMapButton'],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                    }
                }
            ]
        },
        previewContainer: {
            elementClass: 'preview__container',
            targetElement: undefined,
            isFlex: true,
            display: config.display.none,
            hide: true,
            elements: ['schemeWrapper', 'previewContainer', 'editButton', 'closeMapButton', 'deleteButton'],
            currentButtons: ['editButton', 'closeMapButton', 'deleteButton'],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                    }
                }
            ]
        },
        canvasContainer: {
            elementClass: 'canvas__container',
            targetElement: undefined,
            display: config.display.none,
            hide: true,
            elements: ['schemeWrapper', 'canvasContainer', 'saveButton', 'canselButton'],
            currentButtons: ['saveButton', 'canselButton'],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                    }
                },
                {
                    eventName: 'resize',
                    callback: () => fabricManager.resize()
                }
            ]
        },
        loader: {
            elementClass: 'loader',
            targetElement: undefined,
            display: config.display.none,
            hide: true,
            elements: [],
            currentButtons: [],
            listeners: []
        },
        takeScreenButton: {
            elementClass: 'take__screen__button',
            targetElement: undefined,
            hide: false,
            disabled: false,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: async ($event) => {
                        $event.stopPropagation();
                        previewManager.setPreviewSrc('');
                        await mapManager.takeMapAsScreenshot();
                        this.viewNavigationRouter$.next({load: true, targetElementName: 'previewContainer'});
                        setTimeout(
                            () => {
                                this.viewNavigationRouter$.next({load: false, targetElementName: 'previewContainer'});
                            }, 100
                        )
                    }
                }
            ]
        },
        saveButton: {
            elementClass: 'save__button',
            targetElement: undefined,
            display: config.display.none,
            hide: true,
            disabled: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: async ($event) => {
                        $event.stopPropagation();
                        this.viewNavigationRouter$.next({load: true, targetElementName: 'previewContainer'});
                        const response = await schemeManager.saveScheme();
                        if(response && response.status) {
                            galleryToolsViewController.resetGallery();
                            previewManager.allowSync = true;
                            await fabricManager.saveImg();
                            this.viewNavigationRouter$.next({load: false, targetElementName: 'previewContainer'});
                        } else {
                            this.viewNavigationRouter$.next({load: false, targetElementName: 'canvasContainer'});
                            alert('Something went wrong, can\'t save scheme');
                        }
                    }
                }
            ]
        },
        editButton: {
            elementClass: 'edit__button',
            targetElement: undefined,
            display: config.display.none,
            hide: true,
            disabled: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: async ($event) => {
                        $event.stopPropagation();
                        previewManager.resetZooming();
                        galleryToolsViewController.initTools();
                        this.viewNavigationRouter$.next({load: true, targetElementName: 'canvasContainer'});
                        const { result } = schemeManager.currentEstimate.scheme;
                        if(result) {
                            await schemeManager.fetchScheme(config.schemeUrl);
                        }
                        await fabricManager.initCanvas();
                        this.viewNavigationRouter$.next({load: false, targetElementName: 'canvasContainer'});
                    }
                }
            ]
        },
        restoreButton: {
            elementClass: 'restore__button',
            targetElement: undefined,
            display: config.display.none,
            hide: true,
            disabled: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                    }
                }
            ]
        },
        canselButton: {
            elementClass: 'cansel__button',
            targetElement: undefined,
            display: config.display.none,
            hide: true,
            disabled: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        galleryToolsViewController.resetGallery();
                        this.showElements(this.getSchemeUiElement('previewContainer').elements);
                        previewManager.initSchemePreview(schemeManager.currentScheme.filepath);
                    }
                }
            ]
        },
        closePreviewButton: {
            elementClass: 'close__preview__button',
            targetElement: undefined,
            display: config.display.none,
            hide: true,
            disabled: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: async ($event) => {
                        $event.stopPropagation();
                        await mapManager.initMap();
                        this.showElements(this.getSchemeUiElement('mapContainer').elements);
                    }
                }
            ]
        },
        closeMapButton: {
            elementClass: 'close__map__button',
            targetElement: undefined,
            display: config.display.flex,
            hide: false,
            disabled: false,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        const divToggle = getDOMElement('.scheme__main.back__drop');
                        this.hideSchemeComponent(divToggle);
                    }
                }
            ]
        },
        deleteButton: {
            elementClass: 'delete__button',
            targetElement: undefined,
            display: config.display.none,
            hide: true,
            disabled: false,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: async ($event) => {
                        $event.stopPropagation();
                        this.viewNavigationRouter$.next({load: true, targetElementName: 'mapContainer'});
                        const { leadId, scheme } = schemeManager.currentEstimate;
                        const file = previewManager.cutUrlToServerPath(scheme?.filepath);
                        const response = await schemeManager.deleteScheme({ lead_id: leadId, id: scheme.id, file });
                        if(response) {
                            previewManager.setPreviewSrc('');
                            await mapManager.initMap();
                            this.viewNavigationRouter$.next({load: false, targetElementName: 'mapContainer'});
                        } else {
                            this.viewNavigationRouter$.next({load: false, targetElementName: 'previewContainer'});
                            alert('Something went wrong, can\'t remove scheme');
                        }
                    }
                }
            ]
        }
    })
}

export default new SchemeViewController();