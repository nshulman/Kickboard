import { LightningElement, wire, track, api } from 'lwc';
import getAllPersonaSteps from '@salesforce/apex/personaStep.getAllPersonaSteps';

import BLUEPRINT_CARD_PERSONA_STEP from '@salesforce/schema/Blueprint_Card__c.Blueprint_Persona_Step__c';
import BLUEPRINT_CARD_DESCRIPTION from '@salesforce/schema/Blueprint_Card__c.Description__c';
import BLUEPRINT_CARD_ORDER from '@salesforce/schema/Blueprint_Card__c.Order__c';
import BLUEPRINT_CARD_TYPE from '@salesforce/schema/Blueprint_Card__c.Type__c';
import BLUEPRINT_CARD_OBJECT from '@salesforce/schema/Blueprint_Card__c';

import { refreshApex } from '@salesforce/apex';

export default class PersonaStepCmp extends LightningElement {

    @api currentStepRecord;
    @api currentStepIds;
    @track blueprintId = 'a015j00000Dna2IAAR';
    @track personaRecordForRefresh;
    @track showSpinner = false;
    @track isModalOpen = false;
    @track modelHeading = true;
    @track formData = [];
    @track personaRecords = [];
    @track isCurrentOpenPersona;
    @track primaryPersonaRecord;
    @track blueprintCardApiName = BLUEPRINT_CARD_OBJECT;
    @track blueprintCardFieldRecord = [
        {
            name: BLUEPRINT_CARD_PERSONA_STEP,
            isDisabled: true,
            required: true,
            value: ''
        },
        {
            name: BLUEPRINT_CARD_DESCRIPTION,
            isDisabled: false,
            required: false,
            value: ''
        },
        {
            name: BLUEPRINT_CARD_ORDER,
            isDisabled: false,
            required: false,
            value: ''
        },
        {
            name: BLUEPRINT_CARD_TYPE,
            isDisabled: false,
            required: false,
            value: ''
        },
    ]

    @track responseData;
    connectedCallback() {
        let data = [];
        if (this.currentStepRecord) {
            this.currentStepRecord.forEach(e => {
                data.push(e.Id);
            })
            this.currentStepIds = data;
        }

    }

    @wire(getAllPersonaSteps, { stepIds: '$currentStepIds' })
    wiredGetAllPersonaSteps(result) {
        this.personaRecordForRefresh = result;
        if (result.data) {
            this.personaRecords = this.processPersonaStepData(result.data);
        }
    }
    processPersonaStepData(data) {
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
    refresh() {
        console.log('ref')
        return refreshApex(this.personaRecordForRefresh);
    }

    closeModal(event) {
        if (event.detail) {
            this.isModalOpen = false;
            this.formData = [];
        }
    }

    @api addNewPersonaStep(event) {
        if (event.detail) {
            this.isModalOpen = true;
            this.modelHeading = false;
            this.blueprintCardFieldRecord.forEach(data => {
                if (data.name.fieldApiName === 'Blueprint_Persona_Step__c') {
                    data.value = event.detail.personaStepId;
                }

            })
            let stepObj = {
                objectApiName: this.blueprintCardApiName,
                fieldName: this.blueprintCardFieldRecord,
                visible: false
            }
            this.formData.push(stepObj);
        }

    }
    getDataFromEditForm(event){
        if (event.detail.id) {
            this.isModalOpen = false;
            this.showSpinner = true;
            this.formData = [];
        }

        //this.getAllPersonaRecord();
        setTimeout(() => {
            this.refresh();
            this.showSpinner = false;
        }, 1000);
    }
}