import { schemeManager } from "./services/schemeManager.js";
import { fabricManager } from "./services/fabricManager.js";
import { imagesManager } from "./services/imagesManager.js";

// export async function fetchScheme(url) {
//     await schemeManager.fetchScheme(url);
// }

export function closeSchemeComponent() {
    schemeManager.destroySchemeService();
    fabricManager.destroyFabricManager();
    imagesManager.destroyImagesService();
}
