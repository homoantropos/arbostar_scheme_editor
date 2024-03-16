import {config} from "../config/config.js";

class ImagesManager {
    currentImage = null;
    initImagesService() {}


    async getSchemeAsDataUrlIfOnline(schemeUrl) {
        try {
            if(navigator && !navigator.onLine) return;
            const response = await fetch(schemeUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            return await new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.onerror = reject;
            });
        } catch(e) {
            console.error('Error while scheme url converse to dataUrl');
        }
        if (navigator.onLine) {
            return Promise.reject('No internet connection');
        }
    }

    async getSchemeAsDataUrlIfOnlineOtherOne(schemeUrl) {
        const urlSrc = schemeUrl.split('?')[0];
        const splitedUrlArr = urlSrc.split('.');
        const ext = splitedUrlArr[splitedUrlArr.length - 1];
        try {
            if (navigator && !navigator.onLine) return;
            const schemeOrigin = new Image();
            schemeOrigin.crossOrigin = 'anonymous';
            return await new Promise((resolve, reject) => {
                    schemeOrigin.onload = () => {
                        const canvas = document.createElement('canvas');
                        if (schemeOrigin.width && schemeOrigin.height) {
                            canvas.width = schemeOrigin.width;
                            canvas.height = schemeOrigin.height;
                            const context = canvas.getContext('2d');
                            if (context) {
                                context.drawImage(schemeOrigin, 0, 0, schemeOrigin.width, schemeOrigin.height);
                                const dataType = ext === 'png' ? 'image/png' : 'image/jpeg';
                                const dataUrlReady = canvas.toDataURL(dataType);
                                canvas.remove();
                                resolve(dataUrlReady);
                            } else {
                                canvas.remove();
                                reject();
                            }
                        }
                    };
                    schemeOrigin.onerror = () => reject;
                    schemeOrigin.src = schemeUrl;
                }
            );
        } catch (e) {
            console.error('Error while scheme url converse to dataUrl');
        }
    }

    getFileExt(fileName) {
        if (!fileName || !fileName.includes('.')) return 'png';

        let currName = '';

        if (fileName.includes('?')) {
            currName = fileName.split('?')[0];
        }

        const parts = currName ? currName.split('.') : fileName.split('.');

        return parts[parts.length - 1].toLowerCase();
    }

    getActualFileName(serverUrlPath) {
        if (!serverUrlPath || !serverUrlPath.includes('uploads')) return String(Date.now());

        const parts = serverUrlPath.split('/');

        return parts[parts.length - 1].toLowerCase();
    }

    cutUrlToServerPath(url) {
        if (url.includes('?')) {
            url = url.split('?')[0];
        }

        let parts = url.split('/');

        const startIndex = parts.indexOf('uploads');

        parts = parts.splice(startIndex, parts.length);

        return parts.join('/');
    }

    getFullPath(serverFilePath) {
        return serverFilePath?.startsWith('uploads') ? `${config.url}${serverFilePath}` : serverFilePath;
    }

    isImgUrl(candidateUrl) {
        return candidateUrl.includes('uploads');
    }
    destroyImagesService() {
        this.currentImage = null;
    }
}

export default new ImagesManager();