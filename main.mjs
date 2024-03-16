import viewController from "./js/scheme/services/viewController.js";
import fabricManager from "./js/scheme/services/fabricManager.js";
import mainCodebaseBridge from "./js/entryGate/mainCodeBridge/schemeEditorAPI.js"
import {fetchScheme} from "./js/scheme/scheme.main.js";
import { config } from "./js/scheme/config/config.js";

console.log('FIRST STEP');

viewController.initViewController();

console.log('FETCH SCHEME');

await fetchScheme(config.schemeUrl);

await fabricManager.initCanvas();

await fabricManager.getScheme();

const scheme1 = mainCodebaseBridge.exportEditedSchemeToMainProject();

const scheme2 = mainCodebaseBridge.exportEditedSchemeToMainProject();

const scheme3 = mainCodebaseBridge.getEditedSchemeCopy();

console.log('scheme equal scheme: ', scheme1 === scheme2);

console.log('schemes doesn\'t equal copy: ', scheme1 === scheme3, scheme2 ===scheme3 )