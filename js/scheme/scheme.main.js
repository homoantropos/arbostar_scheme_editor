import schemeViewController from "./services/schemeViewController.js";
import {fetchEstimateOnStart, loginOnComponentStart} from "../entryGate/http/requests.js";
import {config} from "./config/config.js";
import {getDOMElement} from "./utils/viewManager.js";

export function initSchemeComponent() {
    document.addEventListener('DOMContentLoaded', (event) => {
        getDOMElement('.toggle__button').disabled = true;
        getDOMElement('.component__loader').style.display = config.display.flex;
        loginOnComponentStart().then(
            (loginSuccess) => {
                loginSuccess && fetchEstimateOnStart(config.mockData.leadId, loginSuccess).then(
                    () => schemeViewController.setToggleButtonOnProjectStart(event)
                );
            }
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
5. [ schemeViewController - fabric ] add stickers panel hiding after sticker choice
6. [ schemeViewController - fabric ] add cropper hide on choice some other control
8. [ fabricManager ] reduce saveImg() method calls
9. add component destroy logic to cleare all not needed;
10. set proper behavior if scheme is really heavy
VIEW
1. approve proper view
2. [ schemeViewController - fabric ] set input slider color along with paintColor prop
 */