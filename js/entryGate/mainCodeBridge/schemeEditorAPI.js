import schemeManager from "../../scheme/services/schemeManager.js";
import { getSafeCopy } from "../../scheme/utils/safeJsonParser.js";
import { mockEstimate } from "../../mockddata/mockEstimate.js";

class MainCodebaseBridge {

    importDataToSchemeEditor(request) {
        switch (request) {
            case('estimate') :
                return mockEstimate;
            default:
                return null;
        }
    }
    exportEditedSchemeToMainProject() {
        return schemeManager.schemeOutput$; // just subscribe to have fresh scheme state outside schemeManagerComponent
    }

    getEditedSchemeCopy() {
        return getSafeCopy(schemeManager.currentScheme);
    }
}

export default new MainCodebaseBridge();