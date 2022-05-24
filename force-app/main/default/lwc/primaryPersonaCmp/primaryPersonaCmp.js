import { LightningElement, wire, api, track } from 'lwc';
import getPrimaryPersonaRecords from '@salesforce/apex/personaStep.getPrimaryPersonaRecords';
import {refreshApex} from "@salesforce/apex";
export default class PrimaryPersonaCmp extends LightningElement {
    @api stepId;
    @track primaryPersonaName;
    @track processedPrimaryPersona = [];
    @track refreshPrimaryPersonaData;
    @track isRefresh=false;

    /**
     * Get primary persona records and process the records.
     * @param result
     */
    @wire(getPrimaryPersonaRecords,{stepIds:'$stepId'})
    wiredGetPrimaryPersona(result) {
        if(result && result.data){
            this.refreshPrimaryPersonaData = result;
            let primaryData = result.data;
            if (primaryData.length>0) {
                this.processedPrimaryPersona = this.processPrimaryPersonaData(primaryData);
                this.primaryPersonaName = primaryData[0] && primaryData[0].Blueprint_Persona__r ? primaryData[0].Blueprint_Persona__r.Name: '';
            }
        }else if(result.error){
            console.log('Error',result.error);
        }

    }

    /**
     * This method is used to refresh data coming from wire service.
     * @returns {Promise<any>}
     */
    @api refreshPrimary() {
        return refreshApex(this.refreshPrimaryPersonaData);
    }

    /**
     * Process the data  from wired service and
     * arrange all the persona under each step.
     * @param data
     * @returns {*[]}
     */
    processPrimaryPersonaData(data) {
        let result = [];
        let stepToPersonaMap = {};
        if(data && data.length>0){
            data.forEach(perStep => {
                if (Object.keys(stepToPersonaMap).includes(perStep.Blueprint_Step__c)) {
                    stepToPersonaMap[perStep.Blueprint_Step__c].push(perStep);
                } else {
                    let personaStepArray = [];
                    personaStepArray.push(perStep);
                    stepToPersonaMap[perStep.Blueprint_Step__c] = personaStepArray;
                }
            })
            Object.keys(stepToPersonaMap).forEach(stepRec => {
                let indexOfStep;
                for (let i = 0; i < this.stepId.length; i++) {
                    if (this.stepId[i] === stepRec) {
                        indexOfStep = i;
                        break;
                    }
                }
                result[indexOfStep] = stepToPersonaMap[stepRec];
            })
        }
        return result;
    }

    /**
     * Send personaStepId and order coming method to parent component.
     * @param event
     */
    sendBlueprintCardDetails(event) {
        let obj={};
        if(event.detail.isEdit){
            obj = event.detail
        }else{
            obj.id = event.target.dataset.id;
        }

        this.dispatchEvent(new CustomEvent('sendbpcarddetail', {
            detail: obj
        }))
    }
}