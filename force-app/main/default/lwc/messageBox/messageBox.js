/**
 * Created by KeyurJain on 20-05-2022.
 */

import {LightningElement,track,api} from 'lwc';

export default class MessageBox extends LightningElement {
    @api isModalOpen;
    @api modelMessage;
    @api modelHeader;
    @api deleteRecordId;

    closeModal() {
        this.dispatchEvent(new CustomEvent('closedelete',{
            detail:true
        }))
        this.isModalOpen = false;
    }
    submitDetails() {
        let obj={};
        obj.isDelete = true;
        obj.deleteId= this.deleteRecordId;
        this.dispatchEvent(new CustomEvent('delete',{
            detail:obj
        }))
        this.isModalOpen = false;
    }
}