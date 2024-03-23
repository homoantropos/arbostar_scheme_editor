import {keys} from "../../scheme/config/keys.js";

export const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Authorization': localStorage.getItem('token'),
    'Role': 'estimator'
}

export const saveHeader = {
    'Authorization': localStorage.getItem('token')
}

export const authHeader = {
    'Content-Type': 'application/json',
    'Role': 'estimator'
}