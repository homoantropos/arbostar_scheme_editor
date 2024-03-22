import {config} from "../scheme/config/config.js";
import {getSafeCopy} from "../scheme/utils/safeJsonParser.js";

export const mockEstimate = {
    leadId: config.mockData.leadId,
    lead: {
        latitude: 0,
        longitude: 0
    },
    id: config.mockData.estimateId,
    scheme: {
        id: undefined,
        result: '',
        original: '',
        elements: undefined
    }
}