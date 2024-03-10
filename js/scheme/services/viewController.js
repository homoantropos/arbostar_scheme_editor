class ViewController {
    initViewController() {
        Object.keys(this.elementsMap).map(
            key => {
                let element = this.getElementFromMap(key);
                let { elementClass, targetElement, listeners } = element;
                targetElement = document.getElementsByClassName(elementClass)[0];
                element.targetElement = targetElement;
                listeners.forEach(
                    listener => targetElement && targetElement.addEventListener(listener.eventName, listener.callback)
                )
            }
        )
    }
    getElementFromMap(elementName) {
        return this.elementsMap[elementName];
    }
    closeElement(elementName) {
        const { targetElement } = this.getElementFromMap(elementName);
        targetElement && (targetElement.hidden = true);
    }
    elementsMap = {
        schemeWrapper: {
            elementClass: 'scheme__wrapper',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.schemeWrapper.targetElement)
                    }
                }
            ]
        },
        mapContainer: {
            elementClass: 'map__container',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.mapContainer.targetElement);
                    }
                }
            ]
        },
        previewContainer: {
            elementClass: 'preview__container',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.previewContainer.targetElement);
                    }
                }
            ]
        },
        canvasContainer: {
            elementClass: 'canvas__container',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.canvasContainer.targetElement);
                    }
                }
            ]
        },
        takeScreenButton: {
            elementClass: 'take__screen__button',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.takeScreenButton.targetElement);
                    }
                }
            ]
        },
        saveButton: {
            elementClass: 'save__button',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.saveButton.targetElement);
                    }
                }
            ]
        },
        editButton: {
            elementClass: 'edit__button',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.editButton.targetElement);
                    }
                }
            ]
        },
        restoreButton: {
            elementClass: 'restore__button',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.restoreButton.targetElement);
                    }
                }
            ]
        },
        canselButton: {
            elementClass: 'cansel__button',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.canselButton.targetElement);
                    }
                }
            ]
        },
        closeButton: {
            elementClass: 'close__button',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.closeElement('schemeWrapper');
                    }
                }
            ]
        },
        deleteButton: {
            elementClass: 'delete__button',
            targetElement: undefined,
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('Class: ', this.elementsMap.deleteButton.targetElement);
                    }
                }
            ]
        }
    }
}

export const viewController =  new ViewController();