import { headers, saveHeader } from "./headers.js";
import { imageExample } from "../../mockddata/imageexample.js";
import { config } from "../../scheme/config/config.js";


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
export async function retrieve(url) {
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

export async function upldateScheme(schemePayload, url) {
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