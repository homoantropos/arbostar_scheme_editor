import { viewController } from "./js/scheme/services/viewController.js";
import { fabricManager } from "./js/scheme/services/fabricManager.js";
import {fetchScheme} from "./js/scheme/scheme.main.js";
import {config} from "./js/scheme/config/config.js";

console.log('FIRST STAEP');

viewController.initViewController();

console.log('FETCH SCHEME');

await fetchScheme(config.schemeUrl);

await fabricManager.initCanvas();

await fabricManager.getScheme();

