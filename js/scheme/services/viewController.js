const { BehaviorSubject, Subject } = rxjs;
const { takeUntil } = rxjs.operators;
class ViewController {
    loading$ = new BehaviorSubject(false);
    destroy$ = new Subject();
    constructor() { }

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
                next: (load) => {
                    this.setLoader(load);
                },
                error: (error) => console.error('Error while loader set: ', error)
            }
        );
    }

    setLoader(load) {
        if (load) {
            this.showElements(['schemeWrapper', 'loader']);
            this.disableAllButtons();
        } else {
            this.showElements(this.getSchemeUiElement('previewContainer').elements);
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
            display: 'block',
            hide: false,
            elements: [],
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
            display: 'block',
            hide: false,
            elements: ['schemeWrapper', 'mapContainer', 'takeScreenButton', 'closeMapButton'],
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
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                    }
                }
            ]
        },
        loader: {
            elementClass: 'loader',
            targetElement: undefined,
            display: 'none',
            hide: true,
            elements: [],
            listeners: []
        },
        takeScreenButton: {
            elementClass: 'take__screen__button',
            targetElement: undefined,
            hide: false,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.loading$.next(true);
                        setTimeout(
                            () => this.loading$.next(false), 1000
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
            disabled: false,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.showElements([]);
                    }
                }
            ]
        },
        editButton: {
            elementClass: 'edit__button',
            targetElement: undefined,
            display: 'none',
            hide: true,
            disabled: false,
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
            disabled: false,
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
            disabled: false,
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
            disabled: false,
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
            display: 'block',
            hide: false,
            disabled: false,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.showElements([]);
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

export const viewController = new ViewController();