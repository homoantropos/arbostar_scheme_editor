import {keys} from "../../scheme/config/keys.js";

export const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Authorization': keys.token,
    'Role': 'estimator'
}

export const saveHeader = {
    'Authorization': keys.token
}

export const authHeader = {
    'Content-Type': 'application/json',
    'Role': 'estimator'
}