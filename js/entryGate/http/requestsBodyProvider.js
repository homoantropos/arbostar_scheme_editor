import schemeManager from "../../scheme/services/schemeManager.js";

class SchemeRequestsPayloadProvider {
    getBodyForSaveScheme(editedScheme) {
        const source = schemeManager.source;
        const body = new FormData();
        if (source) {
            body.append('source', 'true');
        } else {
            body.append('elements', JSON.stringify(editedScheme.elements));
        }
        if (typeof editedScheme === 'string') {
            body.append('image', editedScheme);
        } else {
            body.append('image', editedScheme.editedUrl && editedScheme.editedUrl.startsWith('data') ? editedScheme.editedUrl : editedScheme.url ? editedScheme.url : '');
        }
        body.append('lead_id', JSON.stringify(schemeManager.currentEstimate.leadId));
        return body;
    }
}

export default new SchemeRequestsPayloadProvider();