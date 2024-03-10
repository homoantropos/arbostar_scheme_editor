import { viewController } from "./js/scheme/services/viewController.js";
import { fabricManager } from "./js/scheme/services/fabricManager.js";
import {fetchScheme} from "./js/scheme/scheme.main.js";

console.log('FIRST STAEP');

viewController.initViewController();

console.log('FETCH SCHEME');

await fetchScheme();

await fabricManager.initCanvas();

await fabricManager.getScheme();

