/**
 * Created by KeyurJain on 20-05-2022.
 */

import { LightningElement, api } from "lwc";

export default class MessageBox extends LightningElement {
    @api isModalOpen = false;
    // showModal = false;
    // @api get isModalOpen() {
    //     return this.showModal;
    // }
    // set isModalOpen(value) {
    //     this.showModal = value;
    // }
    @api modalMessage;
    @api modalHeader;
    @api deleteRecordId;
    
    closeModal() {
        this.dispatchEvent(
            new CustomEvent("closedelete", {
                detail: true
            })
        );
        // this.showModal = false;
    }
    submitDetails() {
        let obj = {};
        obj.isDelete = true;
        obj.deleteId = this.deleteRecordId;
        this.dispatchEvent(
            new CustomEvent("delete", {
                detail: obj
            })
        );
        // this.showModal = false;
        this.closeModal();
    }
}
