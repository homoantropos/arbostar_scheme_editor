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
3. add proper behavior of gallery tools icons - when fabric page is closed every should set as untouched
VIEW
1. approve proper view
2. [ schemeViewController - fabric ] set input slider color along with paintColor prop
3. [ schemeViewController - fabric ] add new one loader to hide fabric renders while rotate and other transitions
4. [ schemeViewController - preview ] set proper img's sizing while window resizes
 */