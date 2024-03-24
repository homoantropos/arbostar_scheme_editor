import { config } from "../config/config.js";
import fabricManager from "./fabricManager.js";
import {
    setUIElementsWithListeners,
    getUiElement,
    showElement,
    hideElement, addDotToClassName, getDOMElement
} from "../utils/viewManager.js";
import debugMessageLogger from "../utils/debugMessageLogger.js";

class GalleryToolsController {
    stickersAreAdded = false;
    galleryTollsItitiated = false;
    initTools() {
        if(this.galleryTollsItitiated) return;
        setUIElementsWithListeners(this.galleryToolsUiElements);
        this.createColorsPanel();
        this.createStickersBlock();
        this.galleryTollsItitiated = true;
    }

    // toggleTools() {
    //     this.toggleColorPickAndBrushSlider();
    // }
    // get galleryUIElementsObjKeys() {
    //     return schemeViewController.getUiElementsObjKeys(this.galleryToolsUiElements);
    // }
    // toggleSctickers() {}
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
        fabricManager.isShowPalette = !fabricManager.isShowPalette;
    }
    createColorsPanel() {
        const colorsPanelElement = getUiElement(this.galleryToolsUiElements, 'colorsPanel');
        if(!colorsPanelElement || !colorsPanelElement.targetElement) {
            debugMessageLogger.logDebug('target element should be HTMLElement');
            return;
        }
        fabricManager.colors.forEach(color => {
            const colorClassName = 'color-' + color.replace('#', '');
            let colorElement = getUiElement(addDotToClassName(colorClassName));
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
    createStickersBlock() {
        if(this.stickersAreAdded) return;
        const stickersContainer = getUiElement(this.galleryToolsUiElements, 'stickers');
        if(!stickersContainer || !stickersContainer.targetElement) {
            debugMessageLogger.logDebug('at createStickersBlock() target element should be HTMLElement');
            return;
        }
        const container = stickersContainer.targetElement;
        fabricManager._stickers.map(
            stickerPath => {
                const img = document.createElement('IMG');
                img.src = stickerPath;
                img.addEventListener('click', ($event) => {
                    $event.stopPropagation();
                    fabricManager.addSticker(stickerPath);
                    this.toggleStickers();
                })
                container.appendChild(img);
            }
        )
        this.addNumberPickerListener();
        this.stickersAreAdded = true;
     }
    addNumberPickerListener() {
        const numbersPicker = getDOMElement('#numbersPicker');
        if(numbersPicker) {
            numbersPicker.addEventListener('click', ($event) => {
                $event.stopPropagation();
                fabricManager.addNewNumberPicker();
                this.toggleStickers();
            });
        }
    }
    toggleStickers(){
        if(!fabricManager.showStickers) {
            hideElement(this.galleryToolsUiElements, 'stickers');
        } else {
            showElement(this.galleryToolsUiElements, 'stickers');
            fabricManager.painting = false;
            fabricManager.isITextSelected = false;
        }
        this.setSelected(true);
    }
    setSelected(notReSet) {
        this.galleryElementsNames.map(
            elementName => {
                const element = getUiElement(this.galleryToolsUiElements, elementName).targetElement;
                if(element.classList.contains('cl-main')) {
                    element.classList.remove('cl-main');
                }
                if(notReSet) return;
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
                        showElement(this.galleryToolsUiElements, 'stickers');
                        fabricManager.showStickers = !fabricManager.showStickers;
                        this.toggleStickers();
                        this.toggleColorPickAndBrushSlider();
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
                        fabricManager.startCrop();
                        hideElement(this.galleryToolsUiElements, 'stickers');
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
                        fabricManager.rotateFabric(-90);
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
                        fabricManager.rotateFabric(90);
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
                        fabricManager.undo();
                        this.setSelected();
                    }
                }
            ]
        },
        stickers: {
            elementClass: 'stickers',
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
                        fabricManager.showStickers = true;
                        console.log('THIRD')
                        this.toggleStickers();
                        this.setSelected();
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
                        this.toggleColorsPanel();
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
            display: config.display.none,
            hide: true,
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
