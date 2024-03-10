import { viewController } from "./js/scheme/services/viewController.js";
import { fabricManager } from "./js/scheme/services/fabricManager.js";

viewController.initViewController();

await fabricManager.initCanvas();

await fabricManager.getScheme();