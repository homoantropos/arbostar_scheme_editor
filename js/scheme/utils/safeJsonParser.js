export function getSafeCopy(value) {
    return hasStructuredClone() ? getSafeStructuredClone(value) : getSafeJSONCopy(value);
}
export function getSafeJSONCopy(value) {
    try {
        stopParsingAndReturnValue(value);
        return JSON.parse(JSON.stringify(value));
    } catch(e) {
        handleCopyError(e);
        return value;
    }
}
export function getSafeStructuredClone(value) {
    try {
        stopParsingAndReturnValue(value);
        return structuredClone(value);
    } catch(e) {
        handleCopyError(e);
        return value;
    }
}
export function hasStructuredClone() {
    return window?.structuredClone || document.structuredClone || structuredClone;
}
export function stopParsingAndReturnValue(value) {
    if(value == null) {
        throw Error("Value can't be null or undefined");
    }
}
export function handleCopyError(e) {
    console.log('Error while parsing: ', e);
}

export const existingScheme = {
    status: true,
    data: {
        "elements": "uploads/tmp/5082/34091_scheme_elements",
        "path": "https://staging.arbostar.com/uploads/clients_files/5082/estimates/34091-E/pdf_estimate_no_34091-E_scheme.png"
    }
}