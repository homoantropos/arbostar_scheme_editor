import { viewController } from "./js/scheme/services/viewController.js";
import { fabricManager } from "./js/scheme/services/fabricManager.js";

const { of } = rxjs;

console.log('RXJS', of);

viewController.initViewController();

await fabricManager.initCanvas();

await fabricManager.getScheme();