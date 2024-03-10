import {headers} from "./headers.js";

export async function retrieve(url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                lead_id: 34559
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