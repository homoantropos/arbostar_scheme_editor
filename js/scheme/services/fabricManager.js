import {imagesManager} from "./imagesManager.js";
import {viewController} from "./viewController.js";
import {schemeManager} from "./schemeManager.js";

class FabricManager {
    _fabric;
    backImage;
    editedImage;

    initFabricManager() {
    }

    // canvas initialisation and operation
    async initCanvas() {
        try {
            viewController.loading$.next(true);
            this._fabric ? this._fabric.clear() : this._fabric = await this.createCanvas();
            //const imgDataUrl = await imagesManager.getSchemeAsDataUrlIfOnline('https://staging.arbostar.com/uploads/clients_files/5082/estimates/34091-E/pdf_estimate_no_34091-E_scheme.png')
            this.renderFabricCanvas(schemeManager._currentScheme);
        } catch (e) {
            console.error('Error while canvas initiation: ', e);
        }
    }

    async createCanvas() {
        try {
            const _fabric = new fabric.Canvas('canvas_C', {
                selection: false
            });
            //this.addFabricEvents();
            fabric.Object.prototype.transparentCorners = false;
            fabric.Object.prototype.hasRotatingPoint = false;
            fabric.Object.prototype.objectCaching = false;
            //this.fs.fabricElements$.next(emptySerializedFabricCanvas);
            return _fabric;
        } catch (e) {
            console.error('Error while fabric.Canvas create: ', e);
        }
    }

    renderFabricCanvas(file, tries = 3) {
        if ((!file || !this._fabric) && tries > 0) {
            setTimeout(
                () => this.renderFabricCanvas(file, --tries), 300
            )
            return;
        }
        viewController.loading$.next(false);
        // this.imageIsReady = false;
        this.editedImage = file;
        const img = new Image();
        img.onload = () => {
            fabric.Image.fromURL(
                img.src,
                async (oImg) => {
                    this.setFabricBackgroundImage(oImg);
                    this.angleAllowsRotation() && (await this.rotateBackgroundImage(Number(this.editedImage.elements.deg)));
                    if (file.elements) {
                        this.resizeObjectsOnInit(file.elements);
                        await this.addObjectsOnFabricInit(file.elements);
                    }
                    this._fabric.renderAll();
                    setTimeout(() => {
                        window.addEventListener('resize', () => this.resize())
                        // this.saveImg(false, true);
                        //
                        // this.getPadding();
                    }, 100);
                },
                {
                    crossOrigin: 'anonymous'
                }
            );
        };
        img.onerror = (err) => {
            console.error('Error while cropper init: ', err);
        };
        img.src = file.original;
    }

    setFabricBackgroundImage(fabricImage) {
        this.backImage = fabricImage;
        this._fabric.setBackgroundImage(this.backImage, this._fabric.renderAll.bind(this._fabric));
        this.setFabricSizesDueBackImg();
        // this.imageWidthBeforeRotate = this._fabric.width || Number(this.canvas.nativeElement.clientWidth);
        // this.imageHeightBeforeRotate = this._fabric.height || Number(this.canvas.nativeElement.clientHeight);
    }

    setFabricSizesDueBackImg() {
        const galleryInner = viewController.getSchemeUiElement('canvasContainer').targetElement;
        const {clientWidth, clientHeight} = galleryInner;
        this.backImage.scaleToHeight(clientHeight);
        if (this.backImage.getScaledWidth() > clientWidth) {
            this.backImage.scaleToWidth(clientWidth);
        }
        this._fabric.setWidth(Math.round(this.backImage.getScaledWidth()));
        this._fabric.setHeight(Math.round(this.backImage.getScaledHeight()));
    }

    resize() {
        if (!this._fabric) {
            return;
        }
        console.log('working!')
        const oldWidth = this._fabric.width;
        if (!oldWidth) return;
        this.setFabricSizesDueBackImg();
        const scaleFactor = this.backImage.getScaledWidth() / oldWidth;
        const objects = this._fabric.getObjects();
        this.scaleObjects(objects, scaleFactor, true);
        // this.saveImg();
        // this.getPadding();
    }

    resizeObjectsOnInit(objects) {
        const {width, height} = objects;
        if (width && height) {
            const backImageWidth = this.backImage.getScaledWidth();
            const scaleFactor = backImageWidth / width;
            this.scaleObjects(objects.objects.objects, scaleFactor);
        }
    }

    async addObjectsOnFabricInit(serializedObjects) {
        try {
            fabric.util.enlivenObjects(
                serializedObjects.objects?.objects,
                objects => {
                    objects.forEach(object => {
                        this._fabric.add(object);
                    });
                },
                ''
            );
        } catch (e) {
            console.error('Error while objects init: ', e);
            throw e;
        }
    }

    // fabric image operations
    addText(){}
    toggleStickers(){}
    togglePaintMode() {}
    startCrop() {}
    rotateFabric(rotateAngle) {}
    async rotateBackgroundImage(deg) {
        return new Promise((resolve, reject) => {
            if (this._fabric?.backgroundImage && typeof this._fabric.backgroundImage !== 'string') {
                const multiplier = this.calculateScaleMultiplier();
                this._fabric.backgroundImage.rotate(deg);
                const img = new Image();
                img.onload = () => {
                    fabric.Image.fromURL(
                        img.src,
                        oImg => {
                            this.setFabricBackgroundImage(oImg);
                            resolve();
                        },
                        {
                            crossOrigin: 'anonymous'
                        }
                    );
                };
                img.onerror = error => {
                    console.error('Error rotated image loading: ', error);
                    reject(error);
                };
                img.src = this._fabric.backgroundImage.toDataURL({
                    format: 'jpeg',
                    multiplier
                });
            }
        });
    }
    undo() {}
    // helpers
    angleAllowsRotation() {
        if (!this.editedImage.elements) {
            return false;
        }
        const {deg} = this.editedImage.elements;
        return typeof deg !== 'undefined' && deg != null && deg !== 0 && deg !== 360;
    }

    calculateScaleMultiplier(width, height) {
        const w = width ? width : this.backImage.getScaledWidth();
        const h = height ? height : this.backImage.getScaledHeight();
        let multiplier = 1;
        if (this._fabric?.backgroundImage && typeof this._fabric.backgroundImage !== 'string') {
            multiplier = Math.min(
                (this._fabric.backgroundImage.width || w) / w,
                (this._fabric.backgroundImage.height || h) / h
            );
        }
        return (multiplier > 1 && multiplier) || 1;
    }

    scaleObjects(objects, scaleFactor, setCoords) {
        objects.forEach(object => {
            const {scaleX, scaleY, left, top} = object;
            object.scaleX = this.calculateScaledValue(scaleX, scaleFactor);
            object.scaleY = this.calculateScaledValue(scaleY, scaleFactor);
            object.left = this.calculateScaledValue(left, scaleFactor);
            object.top = this.calculateScaledValue(top, scaleFactor);
            setCoords && object.setCoords();
        });
    }

    calculateScaledValue(value, scaleFactor) {
        return typeof value === 'number' ? value * scaleFactor : scaleFactor;
    }

    async getScheme() {
        try {

        } catch (e) {
            console.error('Error while getting scheme: ', e);
        }
    }

    destroyFabricManager() {
        this._fabric = null;
        this.backImage = null;
    }

    colors = Object.freeze(['#2f3640', '#f5f6fa', '#e1b12c', '#0097e6', '#c23616', '#8c7ae6', '#44bd32', '#718093', '#192a56']);

    _stickers = Object.freeze([
        'assets/stickers/sm_bee.svg',
        'assets/stickers/sm_branch_chipper.svg',
        'assets/stickers/sm_branch_chipper_2.svg',
        'assets/stickers/sm_chainsaw.svg',
        'assets/stickers/sm_cross.svg',
        'assets/stickers/sm_excavator.svg',
        'assets/stickers/sm_forklift.svg',
        'assets/stickers/sm_green.svg',
        'assets/stickers/sm_grey.svg',
        'assets/stickers/sm_home.svg',
        'assets/stickers/sm_hook.svg',
        'assets/stickers/sm_lightning.svg',
        'assets/stickers/sm_lorry.svg',
        'assets/stickers/sm_roof.svg',
        'assets/stickers/sm_tree.svg',
        'assets/stickers/sm_wood.svg',
        'assets/stickers/sm_xmastree.svg'
    ]);
}

export const fabricManager = new FabricManager();