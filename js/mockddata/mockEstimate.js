import {config} from "../scheme/config/config.js";
import {getSafeCopy} from "../scheme/utils/safeJsonParser.js";

export const mockEstimate = {
    leadId: config.mockData.leadId,
    id: config.mockData.estimateId,
    scheme: {
        id: undefined,
        result: '',
        original: '',
        elements: undefined
    }
}