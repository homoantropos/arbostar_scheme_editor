import model from "../../scheme/model/model.js";
import { config } from "../../scheme/config/config.js";
import { getSafeCopy } from "../../scheme/utils/safeJsonParser.js";
import {authHeader, headers, saveHeader} from "./headers.js";
import { imageExample } from "../../mockddata/imageexample.js";
import { keys } from "../../scheme/config/keys.js";
import { mockEstimate } from "../../mockddata/mockEstimate.js";


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

export async function fetchEstimateOnStart(leadId, token) {
    try {
        const url = config.url + `app/project/details/${leadId}`;
        if(token) {
            headers.Authorization = token;
            const response = await fetch(url,{method: 'GET', headers});
            if (!response.ok) {
                throw response;
            }
            const data = await response.json();
            if(data) {
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
        }
        else return null;
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
export async function loginOnComponentStart() {
    try {
        if(!authNeed()) {
            return localStorage.getItem('token');
        } else {
            keys.token = '';
            localStorage.setItem('exp', String(Date.now()));
            const response = await fetch('https://staging.arbostar.com/app/auth',
                {
                    method: 'POST',
                    headers: authHeader,
                    body: JSON.stringify({
                        company: "staging",
                        username: "sea",
                        password: "20231332aA"
                    })
                });
            if (!response.ok) {
                throw response;
            }
            const data = await response.json();
            if(data.status) {
                const token = data.data.Token;
                if(token) {
                    keys.token = token;
                    localStorage.setItem('token', token);
                    localStorage.setItem('exp', String(Date.now() + 1000 * 60 * 60 * 24));
                    return token;
                }
            }
            return false;
        }
    } catch(e) {
        console.error('Error when login: ', e);
    }
}

function authNeed() {
    let token = localStorage.getItem('token');
    if(!token) {
        token = keys.token // if auth doesn't work please do auth of main project and put token from it to keys
        localStorage.setItem('token', token);
        localStorage.setItem('exp', String(Date.now()));
    }
    if(!!token) return false;
    const candidate = localStorage.getItem('exp');
    if(!candidate) return true;
    const expTime = new Date(Number(candidate));
    return expTime > Date.now();
}