import fabricManager from "./fabricManager.js";
import mapManager from "./mapManager.js";

const { BehaviorSubject, Subject } = rxjs;
const { takeUntil } = rxjs.operators;
class ViewController {
    loading$ = new BehaviorSubject({load: false, targetElementName: 'mapContainer'});
    destroy$ = new Subject();
    constructor() { }

    showEditor(divToggle) {
        if(!divToggle) return;
        divToggle.style.display = 'flex';
        divToggle.classList.add('enter-animation');
        divToggle.classList.remove('leave-animation');
        this.initViewController();
    }

    hideEditor(divToggle) {
        divToggle.classList.add('leave-animation');
        divToggle.classList.remove('enter-animation');
        divToggle.addEventListener('animationend', () => {
            if(divToggle.classList.contains('leave-animation')) {
                divToggle.style.display = 'none';
            }
        }, {once: true});
        this.destroyViewController();
    }
    setToggleButtonOnProjectStart(event) {
        event.stopPropagation();
        const toggleButton = document.getElementById('toggleSchemeButton');
        const divToggle = document.querySelector('.scheme__main.back__drop');

        toggleButton.addEventListener('click', () => {
            const displayStyle = getComputedStyle(divToggle).display;
            if(displayStyle === 'none') {
                this.showEditor(divToggle)
            } else {
                this.hideEditor(divToggle);
            }
        });
    }
    initViewController() {
        this.schemeUiElementsKeys.map(
            key => {
                let element = this.getSchemeUiElement(key);
                let {elementClass, listeners} = element;
                element.targetElement = document.getElementsByClassName(elementClass)[0];
                listeners.length && listeners.forEach(
                    listener => {
                        if (element.targetElement) {
                            element.targetElement.addEventListener(listener.eventName, listener.callback);
                            this.setElementVisibility(key, element.hide);
                        }
                    }
                )
            }
        );
        this.loading$.pipe(takeUntil(this.destroy$)).subscribe({
                next: (opts) => this.setLoader(opts.load, opts.targetElementName),
                error: (error) => console.error('Error while loader set: ', error)
            }
        );
        this.loading$.next({load: true, targetElementName: 'mapContainer'});
        mapManager.initMap().then(() => this.loading$.next({load: false, targetElementName: 'mapContainer'}));
    }
    destroyViewController() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    setLoader(load, targetElementName) {
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
    setElementVisibility(schemeElementUiName, hide) {
        const schemeUiElement = this.getSchemeUiElement(schemeElementUiName);
        if (!schemeUiElement.targetElement) {
            console.log('Target element is empty!');
            return;
        }
        schemeUiElement.hide = hide;
        schemeUiElement.display = hide ? 'none' : 'block';
        schemeUiElement.targetElement && (schemeUiElement.targetElement.style.display = schemeUiElement.hide ? 'none' : 'block');
    }

    showElement(schemeElementUiName) {
        this.setElementVisibility(schemeElementUiName, false);
    }

    hideElement(schemeElementUiName) {
        this.setElementVisibility(schemeElementUiName, true);
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
        return this.schemeUiElements[elementName];
    }

    get schemeUiElementsKeys() {
        return Object.keys(this.schemeUiElements);
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
            display: 'flex',
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
            display: 'flex',
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
            display: 'none',
            hide: true,
            elements: ['schemeWrapper', 'previewContainer', 'editButton', 'closePreviewButton'],
            currentButtons: ['editButton', 'closePreviewButton'],
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
            display: 'none',
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
            display: 'none',
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
                        //this.showElements(this.getSchemeUiElement('previewContainer').elements);
                        this.loading$.next({load: true, targetElementName: 'previewContainer'});
                        setTimeout(
                            async () => {

                                // await fetchScheme(config.schemeUrl);
                                // await fabricManager.initCanvas();
                                // await fabricManager.getScheme();
                                //this.loading$.next(false)
                                this.loading$.next({load: false, targetElementName: 'previewContainer'});
                            }, 200
                        )
                    }
                }
            ]
        },
        saveButton: {
            elementClass: 'save__button',
            targetElement: undefined,
            display: 'none',
            hide: true,
            disabled: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.loading$.next(true);
                        const divToggle = document.querySelector('.scheme__main.back__drop');
                        setTimeout(
                            async () => {
                                this.loading$.next(false);
                                await new Promise(resolve => setTimeout(() => {
                                    this.hideEditor(divToggle);
                                    resolve();
                                    }, 300));
                            }, 1000
                        )
                    }
                }
            ]
        },
        editButton: {
            elementClass: 'edit__button',
            targetElement: undefined,
            display: 'none',
            hide: true,
            disabled: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.showElements(this.getSchemeUiElement('canvasContainer').elements);
                    }
                }
            ]
        },
        restoreButton: {
            elementClass: 'restore__button',
            targetElement: undefined,
            display: 'none',
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
            display: 'none',
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
            display: 'none',
            hide: true,
            disabled: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.showElements(this.getSchemeUiElement('mapContainer').elements);
                    }
                }
            ]
        },
        closeMapButton: {
            elementClass: 'close__map__button',
            targetElement: undefined,
            display: 'flex',
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
                        this.hideEditor(divToggle);
                    }
                }
            ]
        },
        deleteButton: {
            elementClass: 'delete__button',
            targetElement: undefined,
            display: 'none',
            hide: true,
            disabled: false,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.showElements(['schemeWrapper', 'mapContainer', 'takeScreenButton', 'closeMapButton']);
                    }
                }
            ]
        }
    })
}

export default new ViewController();