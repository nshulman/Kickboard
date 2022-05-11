import { LightningElement, wire, track, api } from 'lwc';
import getAllPersonaSteps from '@salesforce/apex/personaStep.getAllPersonaSteps';
import addNewCard from '@salesforce/apex/personaStep.addNewCard';
import handleDragAndDropForPS from '@salesforce/apex/personaStep.handleDragAndDropForPS';


import BLUEPRINT_CARD_PERSONA_STEP from '@salesforce/schema/Blueprint_Card__c.Blueprint_Persona_Step__c';
import BLUEPRINT_CARD_DESCRIPTION from '@salesforce/schema/Blueprint_Card__c.Description__c';
import BLUEPRINT_CARD_TYPE from '@salesforce/schema/Blueprint_Card__c.Type__c';
import BLUEPRINT_CARD_OBJECT from '@salesforce/schema/Blueprint_Card__c';

import { refreshApex } from '@salesforce/apex';

export default class PersonaStepCmp extends LightningElement {
    @track BLUEPRINTPERSONASTEP = 'Blueprint_Persona_Step__c';
    @api currentStepRecord;
    @api stepIds;
    @track personaRecordForRefresh;
    @track showSpinner = false;
    @track isModalOpen = false;
    @track F;
    @track formMetadata = [];
    @track personaRecords = [];
    @track isPrimaryPersonaCard;
    @track blueprintCardApiName = BLUEPRINT_CARD_OBJECT;
    @track blueprintCardFieldMetadata = [
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
            name: BLUEPRINT_CARD_TYPE,
            isDisabled: false,
            required: false,
            value: ''
        },
    ]

    /**
     * create array of stepIds when stepRecord is available.
     */
    connectedCallback() {
        let data = [];
        if (this.currentStepRecord) {
            this.currentStepRecord.forEach(e => {
                data.push(e.Id);
            })
            this.stepIds = data;
        }

    }

    /**
     * Get all persona step data
     * @param result
     */
    @wire(getAllPersonaSteps, { stepIds: '$stepIds' })
    wiredGetAllPersonaSteps(result) {
        console.log('wire called')
        if(result && result.data){
            this.personaRecordForRefresh = result;
            if(result && result.data && result.data.length>0){
                let data = result.data;
                this.personaRecords = this.processPersonaStepData(data);
                console.log('processed record',this.personaRecords)
            }
        }else if(result.error){
            console.log('Error',result.error);
        }
    }

    /**
     * process the data coming from wired service.
     * Arrange step-to-persona on basis of index of steps.
     * @param data
     * @returns {*[]}
     */
    processPersonaStepData(data) {
        let result = [];
        let stepToPersonaMap = {};
        if(data){
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
        }
        return result;
    }

    /**
     * Refresh the component
     * @returns {Promise<any>}
     */
   @api refresh() {
        return refreshApex(this.personaRecordForRefresh);
    }

    /**
     * close the modal window
     * @param event
     */
    closeModal(event) {
        if (event.detail) {
            this.isModalOpen = false;
            this.formMetadata = [];
        }
    }

    /**
     * Create and send metadata to record-edit-form to create new blueprint card.
     * @param event
     * @param isPrimary
     */
    @api createFormForBlueprintCard(event,isPrimary) {
        this.isPrimaryPersonaCard = isPrimary;
        console.log('createFormForBlueprintCard',this.personaRecords)
        let personastepId = isPrimary?event.detail.id:event.target.dataset.id;
        if (personastepId) {
            this.isModalOpen = true;
            this.blueprintCardFieldMetadata.forEach(data => {
                if (data.name.fieldApiName === this.BLUEPRINTPERSONASTEP) {
                    data.value =personastepId
                }
            })
            let cardObj = {
                objectApiName: this.blueprintCardApiName,
                fieldName: this.blueprintCardFieldMetadata,
                visible: false,
            }
            this.formMetadata.push(cardObj);
        }

    }


    /**
     * create new blueprint card by calling method from apex class.
     * @param event
     */
    createBlueprintCard(event){
        console.log('in persona cmp',event.detail);
        if(event.detail && event.detail.fields) {
            this.showSpinner = true;
            let fields = JSON.stringify(event.detail.fields);
            addNewCard({fields: fields })
                .then(response => {
                    console.log('success' + response)
                    if (response) {
                        this.isModalOpen = false;
                        this.formMetadata = [];
                        if (!this.isPrimaryPersonaCard) {
                            this.refresh();
                        } else {
                            this.dispatchEvent(new CustomEvent('refreshprimarycard', {
                                detail: true
                            }))
                        }
                        this.showSpinner = false;
                    }
                })
                .catch(err => {
                    console.log('err' + err)
                    this.showSpinner = false;
                })
        }
    }

    /**
     * When card is successfully created it is used to refresh component
     * @param event
     */
    cardCreationSuccess(event){
        console.log('getDataFromEditForm')
        if (event.detail.id) {
            this.isModalOpen = false;
            this.showSpinner = true;
            this.formMetadata = [];
        }
        setTimeout(() => {
            this.refresh();
            this.showSpinner = false;
        }, 1000);
    }

    /**
     * Call method for component refresh.
     * @param event
     */
    refreshOnDragDrop(event){
        if(event.detail){
            console.log('inside refresh called');
            this.refresh();
        }
    }

    /**
     * Drag persona step
     * @param event
     */
    dragPersonaStep(event){
        event.dataTransfer.setData('dragPSId', event.target.dataset.id);
        event.dataTransfer.setData('relatedStepToDrop', event.target.dataset.name);

    }

    /**
     *
     * @param event
     */
    dragOverPersonaStep(event){
        event.preventDefault();
    }

    /**
     * set drag and drop id.
     * @param event
     */
    dropPersonaStep(event){
        event.preventDefault();
        let relatedStepToDrag = event.currentTarget.dataset.name;
        let draggedPS = event.dataTransfer.getData("dragPSId");
        let relatedStepToDrop = event.dataTransfer.getData("relatedStepToDrop");
        if(relatedStepToDrag === relatedStepToDrop){
            let dragId = draggedPS;
            let dropId = event.currentTarget.dataset.id;
           this.performDragAndDropForPersonaStep(dragId,dropId,relatedStepToDrag);
        }
    }

    /**
     * call method from apex for drag-drop.
     * @param dragId
     * @param dropId
     * @param relatedStepToDrag
     */
    performDragAndDropForPersonaStep(dragId,dropId,relatedStepToDrag){
        handleDragAndDropForPS({dragId:dragId,dropId:dropId,relatedStepToDrag:relatedStepToDrag})
            .then((result)=>{
                if(result)
                this.refresh();
            }).catch((err)=>{
                    console.log('err',err);
        })
    }
}