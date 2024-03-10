class ViewController {
    initViewController() {
        this.schemeUiElementsKeys.map(
            key => {
                let element = this.getSchemeUiElement(key);
                let {elementClass, listeners} = element;
                element.targetElement = document.getElementsByClassName(elementClass)[0];
                listeners.forEach(
                    listener => {
                        if (element.targetElement) {
                            element.targetElement.addEventListener(listener.eventName, listener.callback);
                            this.setElementVisibility(key, element.hide);
                        }
                    }
                )
            }
        )
    }
    // elements visibility
    setElementVisibility(schemeElementUiName, hide) {
        const schemeUiElement = this.getSchemeUiElement(schemeElementUiName);
        if(!schemeUiElement.targetElement) {
            console.log('Target element is empty!');
            return;
        }
        schemeUiElement.hide = hide;
        if (!schemeUiElement.elementClass.includes('button')) {
            schemeUiElement.targetElement.hidden = schemeUiElement.hide;
        } else {
            schemeUiElement.targetElement.style.display = schemeUiElement.hide ? 'none' : 'block';
        }
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
        takeScreenButton: {
            elementClass: 'take__screen__button',
            targetElement: undefined,
            hide: false,
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
        saveButton: {
            elementClass: 'save__button',
            targetElement: undefined,
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