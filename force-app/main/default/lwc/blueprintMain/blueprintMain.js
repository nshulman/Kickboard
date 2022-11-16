/* eslint-disable lines-between-class-members */
import { LightningElement, track, api, wire } from "lwc";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import STEP_OBJECT from "@salesforce/schema/Blueprint_Step__c";
import STEP_STAGE from "@salesforce/schema/Blueprint_Step__c.Stage__c";
export default class BlueprintMain extends LightningElement {
    @api recordId;
    @track stageArray = [];
    @track showPersonaSteps = false;
    @track stepsRecord;
    @track allValues = [];
    @wire(getObjectInfo, { objectApiName: STEP_OBJECT })
    stepMetadata;

    @wire(getPicklistValues, {
        recordTypeId: "$stepMetadata.data.defaultRecordTypeId",
        fieldApiName: STEP_STAGE
    })
    stages({ error, data }) {
        if (data) {
            this.allValues = data.values;
            this.stageArray = this.allValues.map((x) => x.value);
            // let localArray = [];
            // this.allValues = data.values;
            // this.allValues.forEach(function (step) {
            //     localArray.push(step.value);
            // });
            // this.stageArray = localArray;
        } else if (error) {
            this.stageArray = [];
        }
    }

    /**
     * Method called from custom event - sendsteps
     * Get all the steps record with order of steps.
     * @param event
     */
    getAllSteps(event) {
        console.log("getAllSteps", JSON.stringify(event.detail));
        if (event.detail.length > 0) {
            this.showPersonaSteps = true;
        }
        if (this.stepsRecord?.length > 0) {
            this.stepsRecord = null;
        }
        if (event.detail) {
            this.stepsRecord = event.detail.map((x) => x.Id);
        }
        // let data = [];
        // if (event.detail) {
        //     event.detail.forEach((e) => {
        //         data.push(e.Id);
        //     });
        //     this.stepsRecord = data;
        // }
    }

    /**
     * Get the blueprint card details from custom event i.e 'onsendbpcarddetail',
     * call api method to create new blueprint card.
     * @param event
     */
    createBlueprintCardFromParent(event) {
        if (event) {
            this.template
                .querySelector("c-persona-component")
                .createMetadataBlueprintCard(event, true);
        }
    }

    /**
     * call primary-persona method for component refresh
     * @param event
     */
    refreshPrimaryPersona(event) {
        if (event.detail) {
            this.template
                .querySelector("c-primary-persona-cmp")
                .refreshPrimary();
        }
    }
}
