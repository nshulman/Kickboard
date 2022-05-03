import { LightningElement, wire, api, track } from 'lwc';
import getPrimaryPersona from '@salesforce/apex/personaStep.getPrimaryPersona';
export default class PrimaryPersonaCmp extends LightningElement {
    @track primaryPersonaName;
    @api currentStepId;
    @track primaryPersonaData = [];
    @track processedPrimaryPersona = [];
    @api currentStepRecord;
    @api refreshPrimaryPersonaData;
    @wire(getPrimaryPersona)
    wiredGetPrimaryPersona(result) {
        if (result.data) {
            this.refreshPrimaryPersonaData = result;
            this.processedPrimaryPersona = this.processPrimaryPersonaData(result.data);
            this.primaryPersonaName = result.data[0].Blueprint_Persona__r.Name;
        }
    }
    @api refreshPrimary() {
        return refreshApex(this.refreshPrimaryPersonaData);
    }
    processPrimaryPersonaData(data) {
        let result = [];
        let stepToPersonaMap = {};
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

            for (let i = 0; i < this.currentStepRecord.length; i++) {
                if (this.currentStepRecord[i].Id === stepRec) {
                    indexOfStep = i;
                    break;
                }
            }
            result[indexOfStep] = stepToPersonaMap[stepRec];
        })
        return result;
    }
    addPrimaryPersonaStep(event) {
        this.dispatchEvent(new CustomEvent('newprimaryps', {
            detail: event.detail
        }))
    }
}