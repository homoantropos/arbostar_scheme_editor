import fabricManager from "./fabricManager.js";
import mapManager from "./mapManager.js";
import debugMessageLogger from "../utils/debugMessageLogger.js";
import model from "../model/model.js";
import {config} from "../config/config.js";
import galleryToolsViewController from "./galleryToolsViewController.js";
import {setUIElementsWithListeners, setElementsVisibility, getUiElement, getUiElementsObjKeys} from "../utils/viewManager.js";
import schemeManager from "./schemeManager.js";
import schemeEditorAPI from "../../entryGate/mainCodeBridge/schemeEditorAPI.js";

const { BehaviorSubject, Subject } = rxjs;
const { takeUntil } = rxjs.operators;
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
        const toggleButton = document.querySelector('#toggleSchemeButton');
        const divToggle = document.querySelector('#schemeComponent');

        toggleButton.addEventListener('click', () => {
            const displayStyle = getComputedStyle(divToggle).display;
            if(displayStyle === config.display.none) {
                this.showSchemeComponent(divToggle)
            } else {
                this.hideSchemeComponent(divToggle);
            }
        });
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
    // getUiElement(uiConfigObj, elementName) {
    //     return uiConfigObj[elementName];
    // }
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
                        await mapManager.takeMapAsScreenshot();
                        this.viewNavigationRouter$.next({load: true, targetElementName: 'previewContainer'});
                        setTimeout(
                            async () => {
                                this.viewNavigationRouter$.next({load: false, targetElementName: 'previewContainer'});
                            }, 200
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
                        galleryToolsViewController.initTools();
                        this.viewNavigationRouter$.next({load: true, targetElementName: 'canvasContainer'});
                        if(schemeManager.currentEstimate.scheme?.result) {
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
                        this.showElements(this.getSchemeUiElement('previewContainer').elements);
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
                        const divToggle = document.querySelector('.scheme__main.back__drop');
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
                        this.viewNavigationRouter$.next({load: true, targetElementName: 'previewContainer'});
                        const { leadId, id, scheme } = schemeManager.currentEstimate;
                        const response = await schemeManager.deleteScheme({ lead_id: leadId, id, file: scheme?.result });
                        if(response) {
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