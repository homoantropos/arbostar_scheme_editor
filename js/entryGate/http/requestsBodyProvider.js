import schemeEditorAPI from "../mainCodeBridge/schemeEditorAPI.js";

class SchemeRequestsPayloadProvider {
    getBodyForSaveScheme(editedScheme) {
        const source = !schemeEditorAPI.importDataToSchemeEditor('estimate').scheme.result;
        const body = new FormData();
        if (source) {
            body.append('source', 'true');
        } else {
            body.append('elements', JSON.stringify(editedScheme.elements));
        }
        if (typeof editedScheme === 'string') {
            body.append('image', editedScheme);
        } else {
            body.append('image', editedScheme.editedUrl && editedScheme.editedUrl.startsWith('data') ? editedScheme.editedUrl : editedScheme.url ? editedScheme.url : '');
        }
        body.append('lead_id', JSON.stringify(schemeEditorAPI.importDataToSchemeEditor('estimate').leadId));
        return body;

        // await new Promise<void>((resolve) => {
        //     this.event.post(
        //         '/estimates/presave_scheme',
        //         body,
        //         (response: any): void => {
        //         //this.backToEstimateEditor();
        //
        //         this._obis.removeTmpImageState(
        //             this._imagesState.branchName,
        //             this._is.getActualFileName(String(this.es.estimate.scheme.original))
        //         );
        //
        //         this.schemeImg = body.get('image') as string;
        //
        //         if (source) {
        //             this.es.estimate.scheme.original = response.data.path + '?' + Date.now();
        //
        //             this.es.estimate.scheme.dataUrl = body.get('image') as string;
        //         }
        //
        //         this.es.estimate.scheme.result = response.data.path;
        //
        //         response.data.path && (this.es.estimate.scheme.fileName = this._is.getActualFileName(String(response.data.path)));
        //
        //         this.es.estimate.scheme.elements = body.get('elements')
        //             ? JSON.parse(JSON.stringify(body.get('elements')))
        //             : this.elements;
        //
        //         this.es.setDraftField({
        //             presave_scheme: this.es.estimate.scheme
        //         });
        //
        //         if (this._imagesState.getCurrentImagesBranchArray(this.branchName)) {
        //             const index = this._imagesState
        //                 .getCurrentImagesBranchArray(this.branchName)
        //                 ?.findIndex((f: Image) => f.fileName?.includes('scheme'));
        //
        //             if (index && index > -1) {
        //                 const schemeBranch = this._imagesState.getCurrentImagesBranchArray(this.branchName);
        //
        //                 schemeBranch && (schemeBranch[index].editedUrl = this.es.estimate.scheme.result);
        //             }
        //         }
        //
        //         this.showMap = false;
        //
        //         this._alert.destroy();
        //
        //         this._alert.success({
        //             text: this.ts.instant('e.schemeIsSaved')
        //         });
        //
        //         const fileName = this.es.estimate.scheme.fileName || this._is.getActualFileName(String(response.data.path));
        //
        //         fileName && this._obis.removeTmpImageState(this._imagesState.branchName, fileName);
        //
        //         this.unshiftSchemeToImages(this.es.estimate.scheme.result || response.data.path, this.es.estimate.scheme.fileName);
        //
        //         this.loading$.next(false);
        //
        //         resolve();
        //     },
        //     () => {
        //         this.loading$.next(false);
        //
        //         this._alert.error({ text: 'Save screen error' });
        //
        //         resolve();
        //     }
        // );
        // });
    }
}

export default new SchemeRequestsPayloadProvider();