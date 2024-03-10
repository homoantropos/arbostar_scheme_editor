class FabricManager {
    _fabric;
    currentFabricImage;

    initFabricManager() {}
    async initCanvas() {
        try {
            this._fabric ? this._fabric.clear() : this._fabric = await this.createCanvas();
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

    async getScheme() {
        try{

        } catch(e) {
            console.error('Error while getting scheme: ', e);
        }
    }

    destroyFabricManager() {
        this._fabric = null;
        this.currentFabricImage = null;
    }
}

export const fabricManager = new FabricManager();