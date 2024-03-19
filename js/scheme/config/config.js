import { keys } from "./keys.js";

export const config = {
    url: 'https://staging.arbostar.com/',
    apiRoute: 'https://staging.arbostar.com/app',
    schemeUrl: 'https://staging.arbostar.com/app/estimates/scheme',
    token: keys.token,
    display: {
        none: 'none',
        block: 'block',
        flex: 'flex'
    },
    mockData: {
        leadId: 35130,
        estimateId: 14864
    }
}

export const EDITING_MODES = Object.freeze({
    pending: 'PENDING',
    paint: 'PAINT',
    crop: 'CROP',
    sticker: 'STICKER',
    text: 'TEXT',
    rotate: 'ROTATE',
    aboveTrash: 'ABOVETRASH'
});
