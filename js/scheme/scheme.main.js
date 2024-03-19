import schemeManager from "./services/schemeManager.js";
import fabricManager from "./services/fabricManager.js";
import imagesManager from "./services/previewManager.js";
import schemeViewController from "./services/schemeViewController.js";

export function initSchemeComponent() {
    document.addEventListener('DOMContentLoaded', (event) => schemeViewController.setToggleButtonOnProjectStart(event));
}
// export async function fetchScheme(url) {
//     await schemeManager.fetchScheme(url);
// }
//
// export function closeSchemeComponent() {
//     schemeManager.destroySchemeService();
//     fabricManager.destroyFabricManager();
//     imagesManager.destroyImagesService();
// }



