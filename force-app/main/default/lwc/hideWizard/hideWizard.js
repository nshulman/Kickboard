import { LightningElement, api, wire } from "lwc";
import {
    getRecord,
    updateRecord,
    getRecordNotifyChange
} from "lightning/uiRecordApi";

export default class HideWizard extends LightningElement {
    @api recordId;

    selected = false;

    @wire(getRecord, {
        recordId: "$recordId",
        fields: ["Blueprint__c.Hide_Wizard__c"]
    })
    updateSelected({ data, error }) {
        if (data) {
            this.selected = data.fields?.Hide_Wizard__c?.value;
            this.hidey = JSON.stringify(data);
        } else if (error) {
            console.log(error);
        }
    }

    async handleClick() {
        this.selected = !this.selected;
        const fields = {
            Id: this.recordId,
            Hide_Wizard__c: this.selected
        };
        const recordInput = { fields };
        try {
            await updateRecord(recordInput);
        } catch (error) {
            console.log("Error updating", error);
        }
        getRecordNotifyChange([{ recordId: this.recordId }]);
    }
}
