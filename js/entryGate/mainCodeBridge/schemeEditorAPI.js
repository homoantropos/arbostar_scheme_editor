import schemeManager from "../../scheme/services/schemeManager.js";
import {getSafeCopy} from "../../scheme/utils/safeJsonParser.js";

class MainCodebaseBridge {

    importDataToSchemeEditor() {

    }
    exportEditedSchemeToMainProject() {
        return schemeManager.currentScheme;
    }

    getEditedSchemeCopy() {
        return getSafeCopy(schemeManager.currentScheme);
    }
}

export default new MainCodebaseBridge();