import schemeViewController from "./services/schemeViewController.js";
import {fetchEstimateOnStart, loginOnComponentStart} from "../entryGate/http/requests.js";
import {config} from "./config/config.js";

export function initSchemeComponent() {
    document.addEventListener('DOMContentLoaded', (event) => {
        schemeViewController.setToggleButtonOnProjectStart(event);
        loginOnComponentStart().then(
            (loginSuccess) => loginSuccess && fetchEstimateOnStart(config.mockData.leadId, loginSuccess)
        )
    });
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
2. add trash bin functionality
3. add proper behavior of gallery tools icons - when fabric page is closed every should set as untouched
5. [ schemeViewController - fabric ] add stickers panel hiding after sticker choice
6. [ schemeViewController - fabric ] add cropper hide on choice some other control
8. [ fabricManager ] reduce saveImg() method calls
VIEW
1. approve proper view
2. [ schemeViewController - fabric ] set input slider color along with paintColor prop
3. [ schemeViewController - fabric ] add new one loader to hide fabric renders while rotate and other transitions
 */