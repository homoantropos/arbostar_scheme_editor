import {imagesManager} from "./imagesManager.js";
import {viewController} from "./viewController.js";

class FabricManager {
    _fabric;
    backImage;

    initFabricManager() {}
    drawImage(oImg) {
        this._fabric.add(oImg);
        setTimeout(
            () => viewController.loading$.next(false), 1000
        )

    }
    async initCanvas() {
        try {
            viewController.loading$.next(true);
            this._fabric ? this._fabric.clear() : this._fabric = await this.createCanvas();
            const imgDataUrl = await imagesManager.getSchemeAsDataUrlIfOnline('https://staging.arbostar.com/uploads/clients_files/5082/estimates/34091-E/pdf_estimate_no_34091-E_scheme.png')

            this.setImg(imgDataUrl);
        } catch(e) {
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
        } catch(e) {
            console.error('Error while fabric.Canvas create: ', e);
        }
    }
    setImg(file, tries = 3) {
        if (!this._fabric && tries > 0) {
            this.setImg(file, --tries);

            return;
        }

        viewController.loading$.next(false);

        // this.imageIsReady = false;
        //
        // this.selectedImage = file;

        const img = new Image();

        img.onload = ()=> {
            fabric.Image.fromURL(
                img.src,
                async (oImg) => {
                this.setFabricBackgroundImage(oImg);

                //this.angleAllowsRotation() && (await this.rotateBackgroundImage(Number(this.selectedImage?.objects?.deg)));

                // if (file.objects) {
                //     this.resizeObjectsOnInit(file.objects);
                //
                //     await this.addObjectsOnFabricInit(file.objects);
                // }

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

        img.src = file;
    }
    setFabricBackgroundImage(fabricImage) {
        this.backImage = fabricImage;

        this._fabric.setBackgroundImage(this.backImage, this._fabric.renderAll.bind(this._fabric));

        this.setFabricSizesAsBackImg();

        // this.imageWidthBeforeRotate = this._fabric.width || Number(this.canvas.nativeElement.clientWidth);
        //
        // this.imageHeightBeforeRotate = this._fabric.height || Number(this.canvas.nativeElement.clientHeight);
    }

    setFabricSizesAsBackImg() {
        const galleryInner = viewController.getSchemeUiElement('canvasContainer').targetElement;
        const { clientWidth, clientHeight } = galleryInner;
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
        this.setFabricSizesAsBackImg();
        const scaleFactor = this.backImage.getScaledWidth() / oldWidth;
        const objects = this._fabric.getObjects();
        //this.scaleObjects(objects, scaleFactor, true);
        // this.saveImg();
        // this.getPadding();
    }
    async getScheme() {
        try{

        } catch(e) {
            console.error('Error while getting scheme: ', e);
        }
    }

    destroyFabricManager() {
        this._fabric = null;
        this.backImage = null;
    }
}

export const fabricManager = new FabricManager();