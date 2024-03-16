import schemeManager from "../../scheme/services/schemeManager.js";
import {getSafeCopy} from "../../scheme/utils/safeJsonParser.js";

class MainCodebaseBridge {

    importDataToSchemeEditor() {

    }
    exportEditedSchemeToMainProject() {
        return schemeManager._currentScheme;
    }

    getEditedSchemeCopy() {
        return getSafeCopy(schemeManager._currentScheme);
    }
}

export default new MainCodebaseBridge();