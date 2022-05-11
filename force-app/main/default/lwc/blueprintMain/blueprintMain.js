import { LightningElement,track,api,wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import STEP_OBJECT from '@salesforce/schema/Blueprint_Step__c';
import STEP_STAGE from '@salesforce/schema/Blueprint_Step__c.Stage__c';
export default class BlueprintMain extends LightningElement {
    @track stageArray = [];
    @track isPersonaStepsVisible = false;
    @track stepsRecord;
    allValues = [];
    // @api ss;
    // get setpsWithOrder() {
    //     return this.ss;
    // }
    // set setpsWithOrder(val) {
    //     this.ss = val;
    // }

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

    /**
     * Method called from custom event - sendsteps
     * Get all the steps record with order of steps.
     * @param event
     */
    getAllSteps(event) {
        this.isPersonaStepsVisible = true;
        this.stepsRecord = event.detail;
    }

    /**
     * Get the blueprint card details from custom event i.e 'onsendbpcarddetail',
     * call api method to create new blueprint card.
     * @param event
     */
    createBlueprintCardFromParent(event) {
        console.log('createPersonaStepFromParent')
        if (event) {
            this.template.querySelector('c-persona-comopnent').createFormForBlueprintCard(event,true);
        }
    }

    /**
     * call primary-persona method for component refresh
     * @param event
     */
    refreshPrimaryPersona(event){
        if(event.detail){
            console.log('in refreshPrimaryPersona')
            this.template.querySelector('c-primary-persona-cmp').refreshPrimary();
        }
    }

}