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



/*TO DO
LOGIC
1. add figure marker to stickers
2. add trash bin functionality

VIEW
1. approve proper view
2. set input slider color along with paintColor prop

 */