import { LightningElement, api } from 'lwc';
export default class ChildCmp extends LightningElement {
    @api objectApiName;
    @api fieldRecord;

    handleSubmit(event){
        event.preventDefault();
        console.log('formSubmittion')
        if(Object.keys(event.detail.fields).length>0){
            this.dispatchEvent(new CustomEvent('formsubmit', {
                detail: event.detail
            }))
        }

    }
    handelSuccess(event) {
        if (event.detail.id) {
            this.dispatchEvent(new CustomEvent('formsuccess', {
                detail: event.detail
            }))
        }

    }
    handelError(event) {
    }
    closeModalWindow() {
        this.dispatchEvent(new CustomEvent('closemodelwindow', {
            detail: true
        }))
    }
}