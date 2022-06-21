import { LightningElement, api,track } from 'lwc';
export default class ChildCmp extends LightningElement {
    @api objectName;
    @api fieldRecord;
    @api editRecordId;
    @track recId;
     connectedCallback() {
         console.log('record-deit fieldRecord',this.fieldRecord);
         console.log('record-deit editRecordId',this.editRecordId);
         this.recId = this.editRecordId?this.editRecordId:'';
    }

    handleSubmit(event){
         if(!this.recId){
            event.preventDefault();
            if(Object.keys(event.detail.fields).length>0){
                let obj={};
                obj.objectName = this.objectName.objectApiName;
                obj.fields = event.detail.fields;
                this.dispatchEvent(new CustomEvent('formsubmit', {
                    detail: obj
                }))
            }
        }


    }
    handelSuccess(event) {
        if(this.recId || this.fieldRecord || this.objectApiName){
            this.recId='';
            this.fieldRecord='';
            this.objectApiName='';
        }
        if (event.detail.id) {
            this.dispatchEvent(new CustomEvent('formsuccess', {
                detail: event.detail
            }))
        }

    }
    handelError(event) {
        if(this.recId || this.fieldRecord || this.objectApiName){
            this.recId='';
            this.fieldRecord='';
            this.objectApiName='';
        }
    }
    closeModalWindow() {
        if(this.recId || this.fieldRecord || this.objectApiName){
            this.recId='';
            this.fieldRecord='';
            this.objectApiName='';
        }
        this.dispatchEvent(new CustomEvent('closemodelwindow', {
            detail: true
        }))
    }
}