import debugMessageLogger from "./debugMessageLogger.js";
import {config} from "../config/config.js";

export function getDOMElement(queryName) {
    return document.querySelector(queryName);
}

export function addDotToClassName(className) {
    const dotSign = '.';
    switch (typeof className) {
        case('string') : {
            if(className.startsWith('.')) return className;
            return dotSign + className;
        }
        default : {
            debugMessageLogger.logDebug(`classname should be 'string' type! provided type is: typeof ${className}`);
            return null;
        }
    }
}
export function setUIElementsWithListeners(uiElementsKeysObj) {
    const objKeys = Object.keys(uiElementsKeysObj);
    objKeys.map(key => {
        let element = getUiElement(uiElementsKeysObj, key);
        let {elementClass, listeners} = element;
        element.targetElement = getDOMElement(addDotToClassName(elementClass));
        listeners.length && listeners.forEach(
            listener => {
                if (element.targetElement) {
                    element.targetElement.addEventListener(listener.eventName, listener.callback);
                    setElementsVisibility(uiElementsKeysObj, key, element.hide);
                }
            }
        )
    });
}

export function getUiElement(uiConfigObj, elementName) {
    return uiConfigObj[elementName];
}

export function getUiElementsObjKeys(uiElementsKeysObj) {
    return Object.keys(uiElementsKeysObj);
}
// elements visibility
export function setElementsVisibility(uiElementsObj, elementUiName, hide) {
    const uiElement = getUiElement(uiElementsObj, elementUiName);
    if (!uiElement && !uiElement.targetElement) {
        debugMessageLogger.logDebug('Target element is empty!');
        return;
    }
    uiElement.hide = hide;
    uiElement.display = hide ? config.display.none : uiElement.isFlex ? config.display.flex : config.display.block;
    uiElement.targetElement && (uiElement.targetElement.style.display = uiElement.hide ? config.display.none : uiElement.isFlex ? config.display.flex : config.display.block);
}

export function showElement(uiElementsObj, elementUiName) {

    setElementsVisibility(uiElementsObj, elementUiName, false);
}

export function hideElement(uiElementsObj, schemeElementUiName) {
    setElementsVisibility(uiElementsObj, schemeElementUiName, true);
}

//
// showElements(namesElementsToShowArray) {
//     if (!Array.isArray(namesElementsToShowArray)) return;
//     const checkType = namesElementsToShowArray.every(el => typeof el === 'string');
//     if (!checkType) return;
//     this.schemeUiElementsKeys.map(
//         key => {
//             namesElementsToShowArray.includes(key) ? this.showElement(key) : this.hideElement(key);
//         }
//     );
// }
//
// // buttons disable attribute
// setButtonDisabledState(buttonName, disableSate) {
//     const button = this.getSchemeUiElement(buttonName);
//     button.hide = disableSate;
//     button.disabled = disableSate;
//     button.targetElement && (button.targetElement.disabled = button.disabled);
// }
//
// enableButton(elementName) {
//     this.setButtonDisabledState(elementName, false)
// }
//
// disableButton(elementName) {
//     this.setButtonDisabledState(elementName, true)
// }
//
// enableAllButtons() {
//     this.schemeButtons.forEach(
//         elementName => this.enableButton(elementName)
//     )
// }
//
// disableAllButtons() {
//     this.schemeButtons.forEach(
//         elementName => this.disableButton(elementName)
//     )
// }
//
// // scheme dom elements and config

// getSchemeUiElement(elementName) {
//     return this.getUiElement(this.schemeUiElements, elementName);
// }
//

//
// get schemeUiElementsKeys() {
//     return this.getUiElementsObjKeys(this.schemeUiElements);
// }
// get schemeButtons() {
//     return this.schemeUiElementsKeys.filter(key => key.includes('Button'))
// }
//
// get schemeDivs() {
//     this.schemeUiElementsKeys.filter(key => !key.includes('Button'))
// }
