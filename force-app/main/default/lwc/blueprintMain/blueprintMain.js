import { LightningElement,track,api,wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import STEP_OBJECT from '@salesforce/schema/Blueprint_Step__c';
import STEP_STAGE from '@salesforce/schema/Blueprint_Step__c.Stage__c';
export default class BlueprintMain extends LightningElement {
    @track stageArray = [];
    @track showPersonaSteps = false;
    allValues = [];
    @api ss;
    get setpsWithOrder() {
        return this.ss;
    }
    set setpsWithOrder(val) {
        this.ss = val;
    }

    @wire(getObjectInfo, { objectApiName: STEP_OBJECT })
    stepMetadata;

    @wire(getPicklistValues, { recordTypeId: '$stepMetadata.data.defaultRecordTypeId', fieldApiName: STEP_STAGE })
    stages({ error, data }) {
        if (data) {
            let localArray = [];
            this.allValues = data.values;
            this.allValues.forEach(function (step, index) {
                localArray.push(step.value);
            })
            this.stageArray = localArray;
        }
        else if (error) {

        }
    }
    getAllSteps(event) {

        this.showPersonaSteps = true;
        this.setpsWithOrder = event.detail;
    }
    createPersonaStepFromParent(event) {
        if (event) {
            this.template.querySelector('c-persona-comopnent').addNewPersonaStep(event);
        }
    }

}