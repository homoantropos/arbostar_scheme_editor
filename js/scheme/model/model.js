class SchemeModelService {
    _defaultScheme = {
        result: '',
        // when scheme is downloaded
        original: '',
        elements: {
            width: 0,
            height: 0,
            objects: {
                version: '',
                objects: []
            },
            version: '',
            deg: 0
        },
        // when scheme is just taken
        dataUrl: '',
        height: '',
        width: '',
        id: ''
    }
    get defaultScheme() {
        return this._defaultScheme;
    }
    objectIsScheme(candidate) {
        if (typeof candidate !== 'object' || candidate == null) return false;
        return Object.keys(candidate).length === 7
            && candidate.hasOwnProperty('result')
            && candidate.hasOwnProperty('original')
            && candidate.hasOwnProperty('elements')
            && candidate.hasOwnProperty('dataUrl')
            && candidate.hasOwnProperty('height')
            && candidate.hasOwnProperty('width')
            && candidate.hasOwnProperty('id')
            && (!!candidate.elements
                && Object.keys(candidate.elements).length === 5
                && candidate.elements.hasOwnProperty('width')
                && candidate.elements.hasOwnProperty('height')
                && candidate.elements.hasOwnProperty('objects')
                && candidate.elements.hasOwnProperty('version')
                && candidate.elements.hasOwnProperty('deg')
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

    // to be sure viewNavigationRouter$ gets proper arg
    viewNavigatorArgValid(loaderArgumentsObj) {
        return !!loaderArgumentsObj
        && typeof loaderArgumentsObj === 'object'
        && Object.keys(loaderArgumentsObj).length === 2
        && loaderArgumentsObj.hasOwnProperty('load')
        && loaderArgumentsObj.hasOwnProperty('targetElementName')
        && typeof loaderArgumentsObj['load'] === 'boolean'
        && typeof loaderArgumentsObj['targetElementName'] === 'string'
    }
    // to be sure view config element has proper shape
    uiConfigElementObjValid(uiConfigElementObj) {
        return !!uiConfigElementObj
            && typeof uiConfigElementObj === 'object'
            && Object.keys(uiConfigElementObj).length >= 7
            && Object.keys(uiConfigElementObj).map(key => Array.every(this.uiConfigElementKeys.includes(key)))
    }
    uiConfigElementKeys = ['targetElement', 'isFlex', 'display', 'hide', 'elements', 'currentButtons', 'listeners' ]
}

export default new SchemeModelService();