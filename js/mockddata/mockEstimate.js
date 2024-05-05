import {config} from "../scheme/config/config.js";
import {getSafeCopy} from "../scheme/utils/safeJsonParser.js";

export const mockEstimate = {
    leadId: config.mockData.leadId,
    lead: {
        latitude: 49.5647540553906,
        longitude: 25.62124204859817
    },
    id: config.mockData.estimateId,
    scheme: {
        id: undefined,
        result: '',
        original: '',
        elements: undefined
    }
}
