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
        leadId: 35378,
        estimateId: 15072,
        schemeID: null
    }
    // mockData: {
    //     leadId: 35443,
    //     estimateId: 15116,
    //     schemeID: 63608
    // }
}

export const EDITING_MODES = Object.freeze({
    pending: {
        mode: 'PENDING',
        flag: ''
    },
    paint: {
        mode: 'PAINT',
        flag: 'painting'
    },
    crop: {
        mode: 'CROP',
        flag: ''
    },
    sticker: {
        mode: 'STICKER',
        flag: 'showStickers'
    },
    text: {
        mode: 'TEXT',
        flag: 'isITextSelected'
    },
    rotate: {
        mode: 'ROTATE',
        flag: ''
    },
    aboveTrash: {
        mode: 'ABOVETRASH',
        flag: 'isTrashVisible'
    }
});
