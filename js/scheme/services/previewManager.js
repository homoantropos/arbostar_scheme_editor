import {config} from "../config/config.js";
import {getDOMElement} from "../utils/viewManager.js";

class PreviewManager {
    currentImage = null;
    allowSync = false;
    initSchemePreview(schemeUrl) {
        this.setPreviewSrc(schemeUrl);
        this.setSchemePreviewZooming();
    }
    setPreviewSrc(schemeUrl) {
        let preview = getDOMElement("#schemePreview");
        if(schemeUrl) {
            schemeUrl = this.getUrlToPreview(schemeUrl);
            preview.src = schemeUrl;
            preview.style.display = config.display.flex;
        } else {
            preview.src = '';
            preview.style.display = config.display.none;
        }
    }
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

    getUrlToPreview(imageUrl) {
        imageUrl = this.getFullPath(imageUrl);
        return !imageUrl.startsWith('data')
            ? imageUrl + '?' + String(Date.now())
            : imageUrl;
    }

    getFullPath(serverFilePath) {
        return this.isImgUrl(serverFilePath) ? serverFilePath.startsWith('http') ? serverFilePath : `${config.url}${serverFilePath}` : serverFilePath;
    }

    isImgUrl(candidateUrl) {
        return candidateUrl.includes('uploads');
    }
    destroyImagesService() {
        this.currentImage = null;
    }

    // zooming and move scheme preview:
    schemePreview = getDOMElement('#schemePreview');
    currentY = null;
    currentX = null; // Establish a variable to hold the X position.
    allowPan = false;
    deltaY = 0;
    deltaX = 0; // Establish a variable to hold the horizontal pan amount.
    scale = 1;
    setSchemePreviewZooming() {
        this.schemePreview.addEventListener("mousewheel", ($event) => {
            preventEvents($event);
            this.scale += $event.deltaY * -0.01;
            this.scale = Math.min(Math.max(1, this.scale), 3);
            transformImage(this.scale, this.deltaY, this.deltaX);
        });
        this.schemePreview.addEventListener("click", ($event) => {
            preventEvents($event);
        });
        this.schemePreview.addEventListener("mousedown", ($event) => {
            preventEvents($event);
            this.allowPan = true;
            this.currentY = $event.y;
            this.currentX = $event.x;
        });
        this.schemePreview.addEventListener("mousemove", ($event) => {
            preventEvents($event);
            if(!this.allowPan) return;
            if (this.currentY !== null) {
                const directionY = $event.y - this.currentY;
                this.deltaY += directionY * 3;
            }
            if (this.currentX !== null) {
                const directionX = $event.x - this.currentX;
                this.deltaX += directionX * 3;
            }
            transformImage(this.scale, this.deltaY, this.deltaX);
            this.currentY = $event.y;
            this.currentX = $event.x;
        });
        this.schemePreview.addEventListener("mouseup", ($event) => {
            preventEvents($event);
            this.currentY = null;
            this.currentX = null;
            this.allowPan = false;
        });
        const transformImage = (scale, deltaY, deltaX) => {
            if (this.schemePreview) {
                const parent = this.schemePreview.parentNode;
                const {height: parentHeight, width: parentWidth} = parent.getBoundingClientRect();
                const scaledHeight = this.schemePreview.offsetHeight * scale;
                const scaledWidth = this.schemePreview.offsetWidth * scale;
                const maxDeltaY = (scaledHeight - parentHeight) / 2;
                const maxDeltaX = (scaledWidth - parentWidth) / 2;
                this.deltaY = Math.min(maxDeltaY, Math.max(deltaY, -maxDeltaY));
                this.deltaX = Math.min(maxDeltaX, Math.max(deltaX, -maxDeltaX));
                this.schemePreview.style.transform = `translate(${this.deltaX}px,${this.deltaY}px) scale(${scale})`;
            }
        }
        function preventEvents(event) {
            event.stopPropagation && event.stopPropagation();
            event.preventDefault && event.preventDefault();
        }
    }
}

export default new PreviewManager();