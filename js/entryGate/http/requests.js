import {headers} from "./headers.js";
import {imageExample} from "../../mockddata/imageexample.js";

export async function saveCreatedScheme(scheme) {

}
export async function retrieve(url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                lead_id: 35056
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

export async function upldateScheme(schemePayload, bodyObj) {

}

export async function deleteScheme(schemeUrlOrID) {

}
export async function retrieveMockImage() {
    try {
        await new Promise(resolve => setTimeout(() => resolve(), 1000));

        return imageExample;
    } catch(e) {
        console.log('Error while http request: ', e);
    }
}