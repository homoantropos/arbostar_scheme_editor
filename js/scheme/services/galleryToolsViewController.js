import {config} from "../config/config.js";
import fabricManager from "./fabricManager.js";
import schemeViewController from "./schemeViewController.js";
import {
    setUIElementsWithListeners,
    setElementsVisibility,
    getUiElement,
    getUiElementsObjKeys,
    showElement,
    hideElement
} from "../utils/viewManager.js";
import debugMessageLogger from "../utils/debugMessageLogger.js";

class GalleryToolsController {
    initTools() {
        setUIElementsWithListeners(this.galleryToolsUiElements);
        //this.toggleColorPanAndBrushSlider();
        this.createColorsPanel();
    }

    get galleryUIElementsObjKeys() {
        return schemeViewController.getUiElementsObjKeys(this.galleryToolsUiElements);
    }

    toggleColorPickAndBrushSlider() {
        if(fabricManager.isITextSelected || fabricManager.painting) {
            showElement(this.galleryToolsUiElements, 'colorPick');
            showElement(this.galleryToolsUiElements, 'sizeBrushSlider');
        } else {
            hideElement(this.galleryToolsUiElements, 'colorPick');
            hideElement(this.galleryToolsUiElements, 'sizeBrushSlider');
        }
        fabricManager.isShowPalette = !fabricManager.isShowPalette;
    }
    toggleColorsPanel() {
        if(fabricManager.isShowPalette) {
            showElement(this.galleryToolsUiElements, 'colorsPanel');
            showElement(this.galleryToolsUiElements, 'closePanelSign');
        } else {
            hideElement(this.galleryToolsUiElements, 'colorsPanel');
            hideElement(this.galleryToolsUiElements, 'closePanelSign');
        }
        fabricManager.isShowPalette = ! fabricManager.isShowPalette;
    }
    createColorsPanel() {
        if (true) {
            const colorsPanelElement = getUiElement(this.galleryToolsUiElements, 'colorsPanel');
            if(!colorsPanelElement || !colorsPanelElement.targetElement) {
                debugMessageLogger.logDebug('target element should be HTMLElement');
                return;
            }
            fabricManager.colors.forEach(color => {
                const colorClassName = 'color-' + color.replace('#', '');
                let colorElement = document.querySelector('.' + colorClassName);
                if(!colorElement) {
                    colorElement = document.createElement('span');
                    colorElement.className = 'edit-color';
                    colorElement.style.background = color;
                    colorElement.addEventListener('click', async ($event) => {
                        await fabricManager.updatePaint(color);
                        fabricManager.isShowPalette = false;
                        this.toggleColorsPanel();
                        $event.stopPropagation();
                    });
                    colorsPanelElement.targetElement.appendChild(colorElement);
                }
            });
        }
    }
    setSelected() {
        this.galleryElementsNames.map(
            elementName => {
                const element = getUiElement(this.galleryToolsUiElements, elementName).targetElement;
                if(element.classList.contains('cl-main')) {
                    element.classList.remove('cl-main');
                }
                if(fabricManager.isITextSelected && elementName === 'addText') {
                    element.classList.add('cl-main');
                }
                if(fabricManager.showStickers && elementName === 'toggleStickers') {
                    element.classList.add('cl-main');
                }
                if(fabricManager.painting && elementName === 'togglePaintMode') {
                    element.classList.add('cl-main');
                }
                if(fabricManager.showPhotos && elementName === 'startCrop') {
                    element.classList.add('cl-main');
                }
            }
        )
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
                        fabricManager.addText();
                        this.setSelected();
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
                        fabricManager.toggleStickers();
                        this.setSelected();
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
                        fabricManager.togglePaintMode();
                        this.toggleColorPickAndBrushSlider();
                        this.setSelected();
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
                        this.setSelected();
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
                        this.setSelected();
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
                        this.setSelected();
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
                        this.setSelected();
                        console.log("UNDO!");
                    }
                }
            ]
        },
        colorPick: {
            elementClass: 'ei-color-pick',
            targetElement: undefined,
            isFlex: true,
            display: config.display.none,
            hide: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        this.toggleColorsPanel();
                    }
                }
            ]
        },
        closePanelSign: {
            elementClass: 'icon-x',
            targetElement: undefined,
            isFlex: true,
            display: config.display.none,
            hide: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log("EDIT COLOR!");
                    }
                }
            ]
        },
        colorsPanel: {
            elementClass: 'ei-color-panel',
            targetElement: undefined,
            isFlex: true,
            display: config.display.none,
            hide: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: async ($event) => {
                        $event.stopPropagation();
                        console.log("COLOR PANEL!");
                    }
                }
            ]
        },
        sizeBrushSlider: {
            elementClass: 'size-slider-box',
            targetElement: undefined,
            isFlex: true,
            display: config.display.none,
            hide: true,
            elements: [],
            currentButtons: [],
            listeners: [
                {
                    eventName: 'click',
                    callback: ($event) => {
                        $event.stopPropagation();
                        console.log("BRUSH SLIDER!");
                    }
                }
            ]
        },
        sizeBrushInput: {
            elementClass: 'slider-brush',
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
                        console.log("INPUT BRUSH!");
                    }
                },
                {
                    eventName: 'input',
                    callback: ($event) => {
                        $event.stopPropagation();
                        fabricManager.changeBrushSize($event.target.value);
                    }
                }
            ]
        },
        trashBin: {
            elementClass: 'ei-bin',
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
                        console.log("TRASH!");
                    }
                }
            ]
        }
    })
    galleryElementsNames = ['toolsWrapper', 'addText', 'toggleStickers', 'togglePaintMode', 'startCrop', 'rotateCCW', 'rotateCW', 'rotateCW', 'undo'];
    galleryElementsClasses = ['gallery-tools', 'icon-type', 'icon-image', 'icon-pen-tool', 'icon-crop', 'icon-rotate-ccw', 'icon-rotate-cw', 'icon-corner-up-left']
}

export default new GalleryToolsController();
