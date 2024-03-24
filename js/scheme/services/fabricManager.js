import debugMessenger from "../utils/debugMessageLogger.js"
import galleryToolsViewController from "./galleryToolsViewController.js";
import schemeManager from "./schemeManager.js";
import schemeViewController from "./schemeViewController.js";
import { EDITING_MODES } from "../config/config.js";
import { getDOMElement } from "../utils/viewManager.js";
import { getSafeCopy } from "../utils/safeJsonParser.js";

const { BehaviorSubject } = rxjs;

class FabricManager {
    container = getDOMElement('.content__wrapper');
    canvas = getDOMElement('#canvas_C');
    galleryInner = getDOMElement('.media__wrap.canvas__container')
    brushSlider = getDOMElement('#brush-slider');
    trash = getDOMElement('#trash');
    _fabric;
    backImage;
    editedScheme;
    serializedCanvas;
    paddingImage = {
        top: 0,
        left: 0
    };
    rect;
    fabricHeight;
    fabricWidth;
    isShowPalette = false;
    isTrashVisible = false;
    isMouseOverTrash = false;
    showStickers = false;
    isITextSelected = false;
    showPhotos = false;
    text_color = '#dfff30';
    text_size = 30;
    paintColor = '#44bd32';
    brushSize = 4;

    _currentMode;
    editorMode;

    imageWidthBeforeRotate = 0;
    imageHeightBeforeRotate = 0;
    imageIsReady = false;
    allowChanges = true;

    fabricElements$ = new BehaviorSubject({});
    isCropping$ = new BehaviorSubject(false);
    initFabricManager() {
    }

    // canvas initialisation and operation
    async initCanvas() {
        try {
            this._fabric ? this._fabric.clear() : this._fabric = await this.createCanvas();
            this._fabric.freeDrawingBrush.color = 'green';
            this._fabric.freeDrawingBrush.width = 20;
            this.addFabricEvents();
            this.renderFabricCanvas(schemeManager.currentScheme);
        } catch (e) {
            console.error('Error while canvas initiation: ', e);
        }
    }

    async createCanvas() {
        try {
            const _fabric = new fabric.Canvas('canvas_C', {
                selection: false
            });
            fabric.Object.prototype.transparentCorners = false;
            fabric.Object.prototype.hasRotatingPoint = false;
            fabric.Object.prototype.objectCaching = false;
            //this.fs.fabricElements$.next(emptySerializedFabricCanvas);
            return _fabric;
        } catch (e) {
            console.error('Error while fabric.Canvas create: ', e);
        }
    }

    addFabricEvents() {
        const onObjectOverTrash = (event, cb = () => undefined) => {
            const trashOffset = {
                x: this.trash.offsetLeft,
                y: this.trash.offsetTop - this.paddingImage.top
            };
            if (!event.pointer) {
                return;
            }
            if (this.paddingImage.left > 0) {
                event.pointer.x += this.paddingImage.left;
            }
            if (
                event.pointer.x >= trashOffset.x &&
                event.pointer.x <= Number(trashOffset.x) + 35 &&
                event.pointer.y >= trashOffset.y &&
                event.pointer.y <= trashOffset.y + 35
            ) {
                cb();
            } else this.isMouseOverTrash = false;
        };
        this._fabric.on('mouse:down', (event) => {
            if (this.painting) {
                return;
            }
            if (event.target) {
                this._fabric.bringToFront(event.target);
                this.selectedObject = this._fabric.getActiveObject() || {};
                if (event.target.type === 'i-text') {
                    this.showStickers = false;
                    console.log('addFabricEvents');
                    galleryToolsViewController.toggleStickers();
                    this.painting = false;
                    this.isITextSelected = true;
                } else {
                    this.isITextSelected = false;
                }
            } else {
                this.selectedObject = {};
                this.isITextSelected = false;
            }
        });
        this._fabric.on('mouse:up', (event) => {
            if (this.fabricContainsObj(this.rect)) {
                this.crop();
            }
            if (event.target) {
                onObjectOverTrash(event, () => {
                    this._fabric.remove(this.selectedObject);
                    this.isITextSelected = false;
                    this._fabric.renderAll();
                    this.isMouseOverTrash = false;
                    this.selectedObject = {};
                    this.saveImg();
                });
                this.isTrashVisible = false;
            }

            if (this.painting) {
                this.saveImg();
            }
        });
        this._fabric.on('object:moving', (event) => {
            if (event.target) {
                this.isTrashVisible = true;
                onObjectOverTrash(event, () => {
                    this.isMouseOverTrash = true;
                });
            }
            this.saveImg();
        });
        this._fabric.on('object:scaling', () => {
            if (this.isCurrentEditorMode(EDITING_MODES.sticker) || this.isCurrentEditorMode(EDITING_MODES.paint)) {
                this.saveImg();
            }
        });
        this._fabric.on('object:modified', (event) => {
            if (event.target) {
                event.target ._lastAngle = event.target.angle;
                this.saveImg();
            }
        });
    }

    renderFabricCanvas(file, tries = 3) {
        if ((!file || !this._fabric) && tries > 0) {
            setTimeout(
                () => this.renderFabricCanvas(file, --tries), 300
            )
            return;
        }
        if (!file || !file.original) {
            debugMessenger.logDebug(!file ? 'file' : 'file.original');
            return;
        }
        schemeViewController.viewNavigationRouter$.next({load: false, targetElementName: 'canvasContainer'});
        this.imageIsReady = false;
        this.editedScheme = file;
        const img = new Image();
        img.onload = () => {
            fabric.Image.fromURL(
                img.src,
                async (oImg) => {
                    this.setFabricBackgroundImage(oImg);
                    this.angleAllowsRotation() && (await this.rotateBackgroundImage(Number(this.editedScheme.elements.deg)));
                    if (file.elements) {
                        this.resizeObjectsOnInit(file.elements);
                        await this.addObjectsOnFabricInit(file.elements);
                    }
                    this._fabric.renderAll();
                    setTimeout(() => {
                        window.addEventListener('resize', () => this.resize())
                        this.saveImg(false, true);
                        this.getPadding();
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
        this.imageWidthBeforeRotate = this._fabric.width || Number(this.canvas.clientWidth);
        this.imageHeightBeforeRotate = this._fabric.height || Number(this.canvas.clientHeight);
    }

    setFabricSizesDueBackImg() {
        const {clientWidth, clientHeight} = this.galleryInner;
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
        const oldWidth = this._fabric.width;
        if (!oldWidth) return;
        this.setFabricSizesDueBackImg();
        const scaleFactor = this.backImage.getScaledWidth() / oldWidth;
        const objects = this._fabric.getObjects();
        this.scaleObjects(objects, scaleFactor, true);
        this.saveImg();
        this.getPadding();
    }
    resizeObjectsOnInit(objects) {
        const {width, height} = objects;
        if (width && height) {
            const backImageWidth = this.backImage.getScaledWidth();
            const scaleFactor = backImageWidth / width;
            this.scaleObjects(objects.objects.objects, scaleFactor);
        }
    }
    objIsNumberCycle(candidate) {
        if(candidate.type !== 'group') return false;
        const { _objects } = candidate;
        const types = _objects.map( obj => obj.type);
        return Array.isArray(_objects)
        && _objects.length === 2
        && types.includes('circle')
        && types.includes('textbox')
    }
    getGroupMemberByType(fabricGroup, objType) {
        return fabricGroup.type === 'group' && Array.isArray(fabricGroup._objects)
            ? fabricGroup._objects.find(obj => obj.type === objType)
            : undefined;
    }
    async addObjectsOnFabricInit(serializedObjects) {
        try {
            fabric.util.enlivenObjects(
                serializedObjects.objects?.objects,
                objects => {
                    objects.forEach(object => {
                        if (this.objIsNumberCycle(object)) {
                            this.copyNumberPicker(object);
                        } else {
                            this._fabric.add(object);
                        }
                    });
                },
                ''
            );
        } catch (e) {
            console.error('Error while objects init: ', e);
            throw e;
        }
    }
    getPadding() {
        // empty space between fabric canvas and .gallery-inner borders
        this.paddingImage = {
            top: (this.container.offsetHeight - this._fabric.getHeight()) / 2,
            left: (this.container.offsetWidth - this._fabric.getWidth()) / 2
        };

        this.trash.style.bottom = `${this.paddingImage.top + 10}px`;
    }
    resetFabric() {
        this._fabric.renderAll();

        this._fabric.remove(...this._fabric.getObjects());

        this._fabric.renderAll();
    }
    // fabric image operations
    addText() {
        this.deleteCrop();
        galleryToolsViewController.toggleColorsPanel();
        this.showStickers = false;
        console.log('addText');
        galleryToolsViewController.toggleStickers();
        this.endPaint();
        const text = new fabric.IText('Comment', {
            strokeWidth: 2,
            stroke: '#000000',
            fill: this.text_color,
            fontSize: this.text_size,
            fontFamily: 'Roboto',
            fontWeight: 'bold'
        });
        text.on('changed', () => {
            if (!this.rect) {
                this.saveImg();
            }
        });
        this._fabric.add(text);
        this._fabric.setActiveObject(text);
        text.enterEditing();
        text.setSelectionStart(0);
        text.setSelectionEnd((text.text || '').length);
        text.center();
        this.isITextSelected = true;
        this.saveImg();
    }
    addSticker(sticker) {
        this.endPaint();
        this.setEditorMode(EDITING_MODES.sticker);
        fabric.loadSVGFromURL(sticker, (objects, options) => {
            const svg = fabric.util.groupSVGElements(objects, options);
            if (svg.hasOwnProperty('viewBoxHeight') && svg.hasOwnProperty('viewBoxWidth')) {
                if (svg.viewBoxHeight > svg.viewBoxWidth) {
                    svg.scaleToHeight(Math.floor(55));
                } else {
                    svg.scaleToWidth(Math.floor(55));
                }
            }
            this._fabric.add(svg);
            svg.center();
            this._fabric.renderAll();
            this.saveImg();
        });
        this.showStickers = false;
        galleryToolsViewController.toggleStickers();
    }
    addNewNumberPicker() {
        const group = this.createEditableNumberFabricInput();
        this._fabric.add(group);
    }
    copyNumberPicker(origin) {
        const circleArg = this.getGroupMemberByType(origin, 'circle');
        const textBox = this.getGroupMemberByType(origin, 'textbox');
        const group = this.createEditableNumberFabricInput(circleArg, textBox, origin);
        this._fabric.add(group);
    }
    createEditableNumberFabricInput(circleArg, textArg, originObj) {
        const circle = circleArg ? circleArg : new fabric.Circle({
            radius: 30,
            fill: '#cc4c42',
            originX: 'center',
            originY: 'center',
            stroke: '#ffffff',
            strokeWidth: 2
        });
        const text = textArg ? textArg : new fabric.Textbox('0', {
            originX: 'center',
            originY: 'center',
            textAlign: 'center',
            fontSize: this.text_size,
            hasControls: false,
            name: 'ITextNumber'
        });
        const group = new fabric.Group([circle, text], {
            originX: 'center',
            originY: 'center',
            left: originObj?.left !== undefined ? originObj?.left : this._fabric.getWidth() / 2,
            top: originObj?.top !== undefined ? originObj?.top : this._fabric.getHeight() / 2,
            scaleX: originObj?.scaleX || 1,
            scaleY: originObj?.scaleY || 1,
            angle: originObj?.angle || 0
        });
        let clickCounter = 0;
        group.on('mouseup', (event) => {
            const trashOffset = this.trash.getBoundingClientRect();
            trashOffset.y -= 140;
            if (
                event.pointer &&
                event.pointer.x >= trashOffset.x &&
                event.pointer.x <= Number(trashOffset.x) + 90 &&
                event.pointer.y >= trashOffset.y &&
                event.pointer.y <= Number(trashOffset.y) + 90
            ) {
                return;
            }
            clickCounter++;
            if (clickCounter >= 2) {
                this.showStickers = false;
                galleryToolsViewController.toggleStickers();
                const textForEditing = new fabric.Textbox(text.text, {
                    originX: 'center',
                    originY: 'center',
                    textAlign: text.textAlign,
                    fontSize: text.fontSize,
                    name: 'ITextNumber',
                    left: group.left,
                    top: group.top
                });
                text.visible = false;
                group.addWithUpdate();
                textForEditing.visible = true;
                textForEditing.hasControls = false;
                this._fabric.add(textForEditing);
                this._fabric.setActiveObject(textForEditing);
                textForEditing.enterEditing();
                textForEditing.selectAll();
                textForEditing.on('changed', () => {
                    if (!textForEditing.text) {
                        return;
                    }
                    textForEditing.text = textForEditing.text.replace(/\D/g, '');
                    if (textForEditing.text.length > 3) {
                        textForEditing.text = textForEditing.text.slice(0, 3);
                        this._fabric.remove(textForEditing);
                    }
                });
                textForEditing.on('editing:exited', () => {
                    text.set({
                        text: textForEditing.text,
                        visible: true
                    });
                    text.setSelectionStyles({ underline: true }, 0, text.text?.length);
                    group.addWithUpdate();
                    this._fabric.remove(textForEditing);
                    this._fabric.setActiveObject(group);
                    this.saveImg();
                });
                clickCounter = 0;
            }
        });
        if (originObj?.left === undefined || originObj?.top === undefined) {
            group.center();
        }
        this.showStickers = false;
        galleryToolsViewController.toggleStickers();
        return group;
    }
    togglePaintMode() {
        this.deleteCrop();
        this.setEditorMode(EDITING_MODES.paint);
        this.isITextSelected = false;
        this.showStickers = false;
        console.log('togglePaintMode');
        galleryToolsViewController.toggleStickers();
        this.painting = !this.painting;
        this._fabric.isDrawingMode = this.painting;
        this._fabric.freeDrawingBrush.color = this.paintColor;
        this._fabric.freeDrawingBrush.width = this.brushSize;
        setTimeout(() => {
            if (this.brushSlider) {
                this.brushSlider.style.setProperty('--slider-color', this.paintColor);
            }
        }, 20);
    }
    changeBrushSize(newBrushSize) {
        this.brushSize = parseInt(newBrushSize, 10);
        this._fabric.freeDrawingBrush.width = this.brushSize;
    }
    async updatePaint(color = this.paintColor) {
        if (this.painting) {
            this._fabric.isDrawingMode = true;
            this.paintColor = color;
            //await this._store.set('paint_color', color);
            this._fabric.freeDrawingBrush.color = color;
            this._fabric.freeDrawingBrush.width = this.brushSize;
            setTimeout(() => {
                if (this.brushSlider) {
                    this.brushSlider.style.setProperty('--slider-color', this.paintColor);
                }
            }, 20);
        } else if (this.isITextSelected) {
            const activeObject = this._fabric.getActiveObject();
            const text = activeObject.text;
            activeObject.set('text', '');
            activeObject.fill = color;
            activeObject.set('text', text);
            this._fabric.setActiveObject(activeObject);
            this._fabric.renderAll();
        }
    }
    endPaint() {
        this.setEditorMode(EDITING_MODES.pending);

        this.painting = false;

        //this.paintColor = '';

        this._fabric.isDrawingMode = this.painting;
    }
    startCrop() {
        if (this.fabricContainsObj(this.rect)) {
            this._fabric.remove(this.rect);
            this.isCropping$.next(false);
            return;
        }
        if (this.showStickers) {
            this.showStickers = false;
            console.log('startCrop');
            galleryToolsViewController.toggleStickers();
        }
        if (this.painting) {
            this.togglePaintMode();
        }
        this.fabricHeight = this._fabric.height || 0;
        this.fabricWidth = this._fabric.width || 0;
        this.rect = new fabric.Rect({
            fill: 'rgb(255, 255, 255, 0.2)',
            originX: 'left',
            originY: 'top',
            borderColor: '#242424',
            borderScaleFactor: 3,
            borderDashArray: [3, 3],
            cornerColor: '#242424',
            cornerSize: 20,
            width: this._fabric.width,
            height: this._fabric.height,
            lockScalingFlip: true,
            lockMovementX: true,
            lockMovementY: true
        });
        this.isCropping$.next(this._fabric.getObjects().length > 0);
        this._fabric.add(this.rect);
        this._fabric.setActiveObject(this.rect);
        this._fabric.renderAll();
    }
    crop() {
        if (!this.rect) {
            return;
        }
        this.setEditorMode(EDITING_MODES.crop); ////////////////////
        const x = this.rect.left;
        const y = this.rect.top;
        let w = 0;
        let h = 0;
        if (this.rect.width && this.rect.scaleX) {
            w = this.rect.width * this.rect.scaleX;
        }
        if (this.rect.height && this.rect.scaleY) {
            h = this.rect.height * this.rect.scaleY;
        }
        this._fabric.remove(...this._fabric.getObjects());
        this.isCropping$.next(this._fabric.getObjects().length > 0);
        const multiplier = this.calculateScaleMultiplier(w, h);
        const cropOptions = {
            left: x,
            top: y,
            width: w,
            height: h,
            multiplier
        };
        const cropDataUrl = this._fabric.toDataURL(cropOptions);
        fabric.Image.fromURL(
            cropDataUrl,
            (oImg) => {
                this.setFabricBackgroundImage(oImg);
                this.saveImg(true);
                this.setCrop();
            },
            {
                crossOrigin: 'anonymous'
            }
        );
    }
    setCrop() {
        const copy = JSON.parse(JSON.stringify(this.editedScheme));
        delete copy.crop;
        this.editedScheme.crop?.push(copy);
    }
    deleteCrop() {
        if (this.fabricContainsObj(this.rect)) {
            this._fabric.remove(this.rect);
        }

        this.isCropping$.next(false);
    }
    resetPaint() {
        this.deleteCrop();

        if (this.painting) {
            this.togglePaintMode();
        } else if (this.showStickers) {
            this.showStickers = false;
            console.log('resetPaint');
            galleryToolsViewController.toggleStickers();
        }
    }
    async rotateFabric(deg){
        if (!this.allowChanges) return;
        this.allowChanges = !this.allowChanges;
        if (deg === 0) return;
        try {
            this.resetPaint();
            this.imageIsReady = false;
            if (this.editedScheme.elements) {
                if(!this.editedScheme.elements.deg || Number.isNaN(this.editedScheme.elements.deg)) this.editedScheme.elements.deg = 0;
                const fullDeg = this.editedScheme.elements.deg ? this.editedScheme.elements.deg + deg : deg;
                this.editedScheme.elements.deg = this.normalizeAngle(fullDeg);
            }
            const currentObjects = await this.cloneFabricObjectsAndRemoveIfNeeded(true);
            if (this._fabric?.backgroundImage && typeof this._fabric.backgroundImage !== 'string') {
                const multiplier = this.calculateScaleMultiplier();
                this._fabric.backgroundImage.rotate(deg);
                const img = new Image();
                img.onload = () => {
                    fabric.Image.fromURL(
                        img.src,
                        (oImg) => {
                            this.backImage = oImg;
                            this._fabric.setBackgroundImage(this.backImage, this._fabric.renderAll.bind(this._fabric));
                            this.setFabricSizesDueBackImg();
                            currentObjects.forEach((object) => {
                                const resAngle = deg + (object.angle || 0);
                                const newCoords = this.calculateCoordsPostQuadRotation(object, deg);
                                object.set({
                                    left: newCoords.left,
                                    top: newCoords.top,
                                    scaleY: newCoords.scaleY,
                                    scaleX: newCoords.scaleX,
                                    angle: resAngle
                                });
                                if(this.objIsNumberCycle(object)) {
                                    this.copyNumberPicker(object);
                                } else {
                                    this._fabric.add(object);
                                }
                            });
                            setTimeout(() => {
                                this.imageIsReady = true;
                             });
                            this.saveImg();
                            this.getPadding();
                        },
                        {
                            crossOrigin: 'anonymous'
                        }
                    );
                };

                img.onerror = (error) => console.error('Error rotated image loading: ', error);

                img.src = this._fabric.backgroundImage.toDataURL({
                    format: 'jpeg',
                    multiplier
                });
            }
        } catch (e) {
            console.error('Error during rotation: ', e);
        }
    }
    calculateCoordsPostQuadRotation(object, deg) {
        const {
            left: objectLeft = this.imageWidthBeforeRotate,
            top: objectTop = this.imageHeightBeforeRotate,
            scaleX = 1,
            scaleY = 1
        } = object;

        const { width: rotatedImgWidth = this.imageWidthBeforeRotate, height: rotatedImgHeight = this.imageHeightBeforeRotate } =
            this._fabric;

        const widthRatio = objectLeft / this.imageWidthBeforeRotate;

        const heightRatio = objectTop / this.imageHeightBeforeRotate;

        const scaleXRatio = scaleX / this.imageWidthBeforeRotate;

        const scaleYRatio = scaleY / this.imageHeightBeforeRotate;

        const newScaleX = rotatedImgHeight * scaleXRatio;

        const newScaleY = rotatedImgWidth * scaleYRatio;

        const newLeft = deg > 0 ? rotatedImgWidth - rotatedImgWidth * heightRatio : rotatedImgWidth * heightRatio;

        const newTop = deg < 0 ? rotatedImgHeight - rotatedImgHeight * widthRatio : rotatedImgHeight * widthRatio;

        return { left: newLeft, top: newTop, scaleX: newScaleX, scaleY: newScaleY };
    }
    async cloneFabricObjectsAndRemoveIfNeeded(ifRemove) {
        return new Promise((resolve, reject) => {
            try {
                const currentObjects = [];
                this._fabric.getObjects().forEach((item) => item.clone((object) => currentObjects.push(object)));
                ifRemove && this._fabric.remove(...this._fabric.getObjects());
                resolve(currentObjects);
            } catch (e) {
                console.error('Error while get Fabric objects: ', e);
                reject();
            }
        });
    }
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
    chooseImg(file) {
        this.imageIsReady = false;

        this.resetFabric();

        this.renderFabricCanvas(file);
    }
    undo(repeat = false) {
        // if (!this._fabric && this.editingSteps.length === 0) {
        //     return;
        // }
        this.deleteCrop();
        const arr = this._fabric.getObjects();
        if (arr.length) {
            this._fabric.remove(arr.pop());
            this._fabric.renderAll();
            if (repeat) {
                return this.undo(repeat);
            }
            this.saveImg();
        } else if (this.editedScheme?.crop && this.editedScheme?.crop?.length > 0) {
            const lastState = this.editedScheme.crop.pop();
            if (lastState) {
                this.editedScheme.dataUrl = this.editedScheme.crop.length === 0 ? lastState.dataUrl : lastState.result || lastState.dataUrl;
                this.chooseImg(this.editedScheme);
            }
        } else {
            //this._alert.show({ text: this.ts.instant('a.youClearedChanges')});
        }
    }
    saveImg(cropAgain) {
        new Promise(
            resolve => setTimeout(() => resolve(), 50)
        ).then(
            async () => {
                if(this._fabric && this.editedScheme) {
                        this.stringifyImage();
                        this.editedScheme.elements = this.getSerializedObjects();
                        this.editedScheme.width = this.editedScheme.elements.width;
                        this.editedScheme.height = this.editedScheme.elements.height;
                        const multiplier = this.calculateScaleMultiplier();
                        await new Promise(resolve => {
                            const format = this.editedScheme.ext === 'png' ? 'png' : 'jpeg';
                            this.editedScheme.result = this._fabric.toDataURL({format, multiplier});
                            schemeManager.setCurrentScheme(getSafeCopy(this.editedScheme));
                            resolve();
                        });
                        this.imageWidthBeforeRotate = Math.max(this._fabric.width || 0, Number(this.canvas.clientWidth));
                        this.imageHeightBeforeRotate = Math.max(this._fabric.height || 0, Number(this.canvas.clientHeight));
                        this.imageIsReady = true;
                        this.allowChanges = true;
                        if (cropAgain) {
                            this.startCrop();
                        }
                }

            }
        )
    }
    stringifyImage() {
        const elements = this.getSerializedObjects();
        this.fabricElements$.next(elements);
    }
    getSerializedObjects() {
        const serializedCanvas = this._fabric.toJSON(['width', 'height']);
        serializedCanvas.objects.map((object) => {
            if (Object.prototype.hasOwnProperty.call(object, '_lastAngle')) {
                object.angle = object._lastAngle;
                object._lastAngle = null;
            }
        });
        return {
            version: serializedCanvas.version,
            objects: { version: serializedCanvas.version, objects: serializedCanvas.objects },
            deg: this.normalizeAngle(Number(this.editedScheme?.elements?.deg), { allowNegative: true }),
            width: serializedCanvas.width,
            height: serializedCanvas.height
        };
    }
    // helpers
    normalizeAngle(angle, opts) {
        const baseAngle = opts?.fullCycle || 360;
        const halfBase = baseAngle / 2;
        let result = angle;
        if (Math.abs(angle) >= baseAngle) {
            const cycles = Math.floor(angle / baseAngle);
            result = angle - cycles * baseAngle;
        }
        opts?.allowNegative && (result = Math.abs(result) > halfBase ? (baseAngle - Math.abs(result)) * -Math.sign(result) : result);
        return result;
    }
    angleAllowsRotation() {
        if (!this.editedScheme.elements) {
            return false;
        }
        const {deg} = this.editedScheme.elements;
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

    fabricContainsObj(obj) {
        return this._fabric?.contains(obj) === true;
    }

    setEditorMode(mode) {
        this._currentMode = EDITING_MODES[mode.mode.toLowerCase()];
    }
    isCurrentEditorMode(mode) {
        return mode === this.editorMode;
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

export default new FabricManager();