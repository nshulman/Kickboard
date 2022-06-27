import { LightningElement, api } from "lwc";
export default class ChildCmp extends LightningElement {
    recId;
    fieldRec;
    @api objectName;
    @api get fieldRecord() {
        return this.fieldRec;
    }
    set fieldRecord(value) {
        this.fieldRec = value;
    }
    @api get editRecordId() {
        return this.recId;
    }
    set editRecordId(value) {
        this.recId = value || "";
    }

    handleSubmit(event) {
        if (!this.recId) {
            event.preventDefault();
            if (Object.keys(event.detail.fields).length > 0) {
                let obj = {};
                obj.objectName = this.objectName.objectApiName;
                obj.fields = event.detail.fields;
                this.dispatchEvent(
                    new CustomEvent("formsubmit", {
                        detail: obj
                    })
                );
            }
        }
    }
    handelSuccess(event) {
        if (this.recId || this.fieldRecord || this.objectApiName) {
            this.recId = "";
            this.fieldRec = "";
            this.objectApiName = "";
        }
        if (event.detail.id) {
            this.dispatchEvent(
                new CustomEvent("formsuccess", {
                    detail: event.detail
                })
            );
        }
    }
    handleError(event) {
        if (this.recId || this.fieldRecord || this.objectApiName) {
            this.recId = "";
            this.fieldRec = "";
            this.objectApiName = "";
        }
        console.log("err", event.detail);
    }
    closeModalWindow() {
        if (this.recId || this.fieldRecord || this.objectApiName) {
            this.recId = "";
            this.fieldRec = "";
            this.objectApiName = "";
        }
        this.dispatchEvent(
            new CustomEvent("closemodalwindow", {
                detail: true
            })
        );
    }
}
