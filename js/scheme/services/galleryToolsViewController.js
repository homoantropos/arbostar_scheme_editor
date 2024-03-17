import {config} from "../config/config.js";
import fabricManager from "./fabricManager.js";
import schemeViewController from "./schemeViewController.js";
import {setUIElementsWithListeners, setElementsVisibility, getUiElement, getUiElementsObjKeys} from "../utils/viewManager.js";

class GalleryToolsController {
    initTools() {
        console.log('GalleryToolsController');
        setUIElementsWithListeners(this.galleryToolsUiElements);
    }

    get galleryUIElementsObjKeys() {
        return schemeViewController.getUiElementsObjKeys(this.galleryToolsUiElements);
    }
    galleryToolsUiElements = Object.seal({
        toolsWrapper: {
            elementClass: 'gallery-tools',
            targetElement: undefined,
            isFlex: true,
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
        addText: {
            elementClass: 'icon-type',
            targetElement: undefined,
            isFlex: true,
            display: config.display.flex,
            hide: false,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log('WORKING!');
                        fabricManager.addText();
                    }
                }
            ]
        },
        toggleStickers: {
            elementClass: 'icon-image',
            targetElement: undefined,
            isFlex: true,
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
        togglePaintMode: {
            elementClass: 'icon-pen-tool',
            targetElement: undefined,
            isFlex: true,
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
        startCrop: {
            elementClass: 'icon-crop',
            targetElement: undefined,
            isFlex: true,
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
        rotateCCW: {
            elementClass: 'icon-rotate-ccw',
            targetElement: undefined,
            isFlex: true,
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
        rotateCW: {
            elementClass: 'icon-rotate-cw',
            targetElement: undefined,
            isFlex: true,
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
        undo: {
            elementClass: 'icon-corner-up-left',
            targetElement: undefined,
            isFlex: true,
            display: config.display.flex,
            hide: false,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log("UNDO!");
                    }
                }
            ]
        }
    })
    galleryElementsNames = ['toolsWrapper', 'addText', 'toggleStickers', 'togglePaintMode', 'startCrop', 'rotateCCW', 'rotateCW', 'rotateCW', 'undo'];
    galleryElementsClasses = ['gallery-tools', 'icon-type', 'icon-image', 'icon-pen-tool', 'icon-crop', 'icon-rotate-ccw', 'icon-rotate-cw', 'icon-corner-up-left']
}

export default new GalleryToolsController();

