import { viewController } from "./js/scheme/services/viewController.js";
import { fabricManager } from "./js/scheme/services/fabricManager.js";
import {fetchScheme} from "./js/scheme/scheme.main.js";
import {config} from "./js/scheme/config/config.js";

viewController.initViewController();

await fabricManager.initCanvas();

await fabricManager.getScheme();

fetchScheme(config.url);