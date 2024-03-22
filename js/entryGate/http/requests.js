import { headers, saveHeader } from "./headers.js";
import { imageExample } from "../../mockddata/imageexample.js";
import { config } from "../../scheme/config/config.js";
import {getSafeCopy} from "../../scheme/utils/safeJsonParser.js";
import model from "../../scheme/model/model.js";
import {mockEstimate} from "../../mockddata/mockEstimate.js";


export async function saveCreatedScheme(schemePayload, url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: saveHeader,
            body: schemePayload
        });

        if (!response.ok) {
            throw response;
        }
        const data = await response.json();
        return data;
    } catch(e) {
        console.log('Error while http request: ', e);
    }
}
export async function retrieveScheme(url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                lead_id: config.mockData.leadId
            })
        });

        if (!response.ok) {
            throw response;
        }
        const data = await response.json();
        return data;
    } catch(e) {
        console.log('Error while http request: ', e);
    }
}

export async function updateScheme(schemePayload, url) {
    return saveCreatedScheme(schemePayload, url);
}

export async function deleteScheme(url, {lead_id, id, file}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({lead_id, id, file})
        });

        if (!response.ok) {
            throw response;
        }
        const data = await response.json();
        return data;
    } catch(e) {
        console.log('Error while http request: ', e);
    }
}
export async function retrieveMockImage() {
    try {
        await new Promise(resolve => setTimeout(() => resolve(), 1000));

        return imageExample;
    } catch(e) {
        console.log('Error while http request: ', e);
    }
}

// mock methods for component start

export async function fetchEstimateOnStart(leadId) {
    try {
        const url = config.url + `app/project/details/${leadId}`;
        const response = await fetch(url,{method: 'GET', headers});
        if (!response.ok) {
            throw response;
        }
        const data = await response.json();
        if(data) {
            console.log('estimate: ', data.data);
            mockEstimate.lead.latitude = data.data.lead.latitude;
            mockEstimate.lead.longitude = data.data.lead.longitude;
            const estScheme = findSchemeInClientFiles(data.data?.estimate?.client_files);
            if(!estScheme) return;
            const scheme = createSchemeFromResponce(estScheme);
            if(model.objectIsScheme(scheme)) {
                mockEstimate.scheme = scheme;
            }
        }
        return mockEstimate;
    } catch(e) {
        console.log('Error while estimate retrieve: ', e);
    }
}

export function findSchemeInClientFiles(clientFilesArr) {
    if(!Array.isArray(clientFilesArr)) return;
    for (let clientFile of clientFilesArr) {
        if(!clientFile && !Object.keys(clientFile).length) return;
        if(clientFile.filepath?.includes('scheme')) {
            return clientFile;
        }
    }
}
export function createSchemeFromResponce(backendResponce) {
    const scheme = getSafeCopy(model.defaultScheme);
    scheme.result = backendResponce.filepath;
    scheme.id = backendResponce.id
    return scheme;
}
