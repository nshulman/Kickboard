import { LightningElement, api } from 'lwc';

export default class ChildCmp extends LightningElement {
    @api objectApiName;
    @api fieldRecord;


    handelSuccess(event) {
        if (event.detail.id) {
            this.dispatchEvent(new CustomEvent('formsubmittion', {
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