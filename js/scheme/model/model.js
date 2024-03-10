class SchemeModelService {
    _defaultScheme = {
        // when scheme is downloaded
        original: '',
        elements: {
            width: 0,
            height: 0,
            objects: {
                version: '',
                objects: []
            }
        },
        // when scheme is just taken
        dataUrl: '',
        height: '',
        width: ''
    }
    get defaultScheme() {
        return this._defaultScheme;
    }
    objectIsScheme(candidate) {
        if (typeof candidate !== 'object' || candidate == null) return false;
        return Object.keys(candidate).length === 5
            && candidate.hasOwnProperty('original')
            && candidate.hasOwnProperty('elements')
            && candidate.hasOwnProperty('dataUrl')
            && candidate.hasOwnProperty('height')
            && candidate.hasOwnProperty('width')
            && (!!candidate.elements
                && Object.keys(candidate.elements).length === 3
                && candidate.elements.hasOwnProperty('width')
                && candidate.elements.hasOwnProperty('height')
                && candidate.elements.hasOwnProperty('objects')
            )
            && (!!candidate.elements.objects
                && Object.keys(candidate.elements.objects).length === 2
                && 'objects' in candidate.elements.objects
                && 'version' in candidate.elements.objects
                && Array.isArray(candidate.elements.objects.objects)
            )
    }
    // to separate different kinds of backend responses
    respHasSchemeOriginalURLAndElementsObj(saveSchemeResponse) {
        const data = this.getResponseData(saveSchemeResponse);
        return !!data
            && Object.keys(data).length === 2
            && data.hasOwnProperty('original')
            && data.hasOwnProperty('elements')
            && Array.isArray(data.elements.objects.objects);
    }
    respHasSchemePathAndElementsURLs(saveSchemeResponse) {
        const data = this.getResponseData(saveSchemeResponse);
        return !!data
            && Object.keys(data).length === 2
            && data.hasOwnProperty('path') && typeof data.path === 'string'
            && data.hasOwnProperty('elements') && typeof data.elements === 'string';
    }
    respHasOnlySchemePathURL(presaveSchemeResponse) {
        const data = this.getResponseData(presaveSchemeResponse);
        return !!data && Object.keys(data).length === 1 && data.hasOwnProperty('path');
    }
    getResponseData(backEndResponse) {
        return !!backEndResponse && backEndResponse.hasOwnProperty('data') ? backEndResponse.data : backEndResponse;
    }
}

export const model = new SchemeModelService();