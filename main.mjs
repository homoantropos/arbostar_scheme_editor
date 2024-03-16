import viewController from "./js/scheme/services/viewController.js";
import fabricManager from "./js/scheme/services/fabricManager.js";
import mainCodebaseBridge from "./js/entryGate/mainCodeBridge/schemeEditorAPI.js"
import {fetchScheme} from "./js/scheme/scheme.main.js";
import { config } from "./js/scheme/config/config.js";

console.log('FIRST STEP');

viewController.initViewController();

export function toggleScheme() {
    viewController.setElementVisibility('schemeWrapper', true);
}

console.log('FETCH SCHEME');

//await fetchScheme(config.schemeUrl);

await fabricManager.initCanvas();

//await fabricManager.getScheme();
