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
            preview.addEventListener('load', () => this.setMinScale())
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
    schemePreviewContainer = getDOMElement('#pinch');
    schemePreview = getDOMElement('#schemePreview');
    currentY = null;
    currentX = null;
    allowPan = false;
    deltaY = 0;
    deltaX = 0;
    scale = 1;
    imgHeight = 0;
    imgWidth = 0;
    parentHeight = 0;
    parentWidth = 0;
    minScale = 0;
    calcScale($event) {
        return this.scale >1 ? $event.deltaY * -0.01 : $event.deltaY * -0.0005;
    }
    setSchemePreviewZooming() {
        this.schemePreview.addEventListener("mousewheel", ($event) => {
            preventEvents($event);
            const scaleChange = this.calcScale($event);
            let potentialScale = this.scale + scaleChange;
            const newHeight = this.schemePreview.offsetHeight * potentialScale;
            const newWidth = this.schemePreview.offsetWidth * potentialScale;
            if (scaleChange < 0) {
                if (newHeight > this.parentHeight || newWidth > this.parentWidth) {
                    this.scale = potentialScale;
                } else {
                    this.scale = this.minScale;
                }
            } else {
                this.scale = Math.min(potentialScale, 3);
            }
            this.transformImage(this.scale, this.deltaY, this.deltaX);
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
            this.transformImage(this.scale, this.deltaY, this.deltaX);
            this.currentY = $event.y;
            this.currentX = $event.x;
        });
        this.schemePreview.addEventListener("mouseup", ($event) => {
            preventEvents($event);
            this.currentY = null;
            this.currentX = null;
            this.allowPan = false;
        });
        function preventEvents(event) {
            event.stopPropagation && event.stopPropagation();
            event.preventDefault && event.preventDefault();
        }
    }
    setMinScale() {
        if(this.minScale) return;
        if(this.schemePreview.offsetHeight > this.schemePreviewContainer.offsetHeight) {
            this.schemePreview.style.height = this.schemePreviewContainer.offsetHeight + 'px';
            this.schemePreview.style.width = 'auto';
        }
        this.imgHeight = this.schemePreview.offsetHeight;
        this.imgWidth = this.schemePreview.offsetWidth;
        this.parentHeight = this.schemePreviewContainer.offsetHeight;
        this.parentWidth = this.schemePreviewContainer.offsetWidth;
        this.minScale = Math.min(this.parentHeight / this.imgHeight, this.parentWidth / this.imgWidth);
    }

    transformImage (scale, deltaY, deltaX) {
        if (this.schemePreview) {
            const parent = this.schemePreview.parentNode;
            const {height: parentHeight, width: parentWidth} = parent.getBoundingClientRect();
            const scaledHeight = this.schemePreview.offsetHeight * scale;
            const scaledWidth = this.schemePreview.offsetWidth * scale;
            let maxDeltaY = 0;
            let maxDeltaX = 0;
            if (scaledHeight > parentHeight) {
                maxDeltaY = (scaledHeight - parentHeight) / 2;
            }
            if (scaledWidth > parentWidth) {
                maxDeltaX = (scaledWidth - parentWidth) / 2;
            }
            this.deltaY = Math.min(maxDeltaY, Math.max(deltaY, -maxDeltaY));
            this.deltaX = Math.min(maxDeltaX, Math.max(deltaX, -maxDeltaX));
            this.schemePreview.style.transform = `translate(${this.deltaX}px,${this.deltaY}px) scale(${scale})`;
        }
    }
    resetZooming() {
        this.currentY = null;
        this.currentX = null;
        this.allowPan = false;
        this.deltaY = 0;
        this.deltaX = 0;
        this.scale = 1;
        this.imgHeight = 0;
        this.imgWidth = 0;
        this.parentHeight = 0;
        this.parentWidth = 0;
        this.minScale = 0;
        this.transformImage(this.scale, this.deltaY, this.deltaX);
    }
}

export default new PreviewManager();