import { LightningElement,track,wire,api } from 'lwc';
import getSteps from '@salesforce/apex/StepsController.getSteps';
import BLUEPRINT_STEP_NAME  from '@salesforce/schema/Blueprint_Step__c.Name';
import BLUEPRINT_NAME  from '@salesforce/schema/Blueprint_Step__c.Blueprint__c';
import BLUEPRINT_STEP_OBJECT from '@salesforce/schema/Blueprint_Step__c';
import addNewStep from '@salesforce/apex/StepsController.addNewStep';
import handleDragAndDropForBlueprintStep from  '@salesforce/apex/StepsController.handleDragAndDropForBlueprintStep';
import {refreshApex} from "@salesforce/apex";


export default class BlueprintComponent extends LightningElement {

    @api blueprintId = 'a041y0000035XMmAAM';
    @track BLUEPRINT_API = 'Blueprint__c';
    @track CREATE_NEW_STEP = 'Create New Step';
    @track allStepsData;
    @track refreshStepsData;
    @track showSpinner = false;
    @track isModalOpen = false;
    @track currentStepOrder;
    @track blueprintStepApiName = BLUEPRINT_STEP_OBJECT;
    @track formMetadata = [];
     formMetadata =[
        {
            name: BLUEPRINT_NAME,
            isDisabled: true,
            required: true,
            value: ''
        },
        {
            name: BLUEPRINT_STEP_NAME,
            isDisabled: false,
            required: true
        }
    ]

    /**
     * Get all steps data
     * @param result
     */
    @wire(getSteps, { blueprintId: '$blueprintId' })
    wiredGetSteps(result) {
        this.refreshStepsData = result;
        this.allStepsData = result.data;
        this.sendSteps(this.allStepsData);


    }

    /**
     * Send steps to parent component.
     * @param data
     */
    sendSteps(data) {
        if(data){
            this.dispatchEvent(new CustomEvent('sendsteps', {
                detail: data
            }))
        }
    }

    /**
     * perform step component refresh
     * @returns {Promise<any>}
     */
    refresh() {
        return refreshApex(this.refreshStepsData);
    }

    /**
     * create metadata for creating steps.
     * @param event
     */
    createMetadataForStep(event){
        this.isModalOpen = true;
        this.currentStepOrder = event.target.dataset.order;
        this.formMetadata.forEach(data => {
            if (data.name.fieldApiName === this.BLUEPRINT_API) {
                if(data.value){
                    data.value='';
                }
                data.value = this.blueprintId ? this.blueprintId: ''
            }
        })
    }

    /**
     * Close model on step creation success
     * @param event
     */
    stepCreationSuccess(event){
        if (event.detail.id) {
           this.closeModal(event);
        }
    }

    /**
     * close model window
     * @param event
     */
    closeModal(event) {
        if (event.detail) {
            this.isModalOpen = false;
        }
    }

    /**
     * Call apex method for step creation.
     * @param event
     */
    createBlueprintStep(event){
         if(event.detail && event.detail.fields){
             let data = JSON.stringify(event.detail.fields);
             let prevOrder = this.currentStepOrder;
             this.showSpinner = true;
             addNewStep({fields:data,order:prevOrder}).then(result=>{
                 if(result){
                     this.isModalOpen = false;
                     setTimeout(()=>{
                         this.refresh();
                         this.showSpinner = false;
                     },1000)

                 }
             }).catch(err=>{
                 this.showSpinner = false;
                 console.log('err',err);
             })
             }
         }

    /**
     * Call when step is dragged and pass id of drag and drop step to drop event.
      * @param event
     */
    handleStepDrag(event){
        event.dataTransfer.setData('dragStepId', event.target.dataset.id);
        event.dataTransfer.setData('relatedBlueprintToDrop', event.target.dataset.name);
    }
    handleStepDragover(event){
        event.preventDefault();
    }

    /**
     * handle step drop.
     * @param event
     */
    handleStepDrop(event){
        event.preventDefault();
        let relatedBlueprintToDrag = event.currentTarget.dataset.name;
        let draggedStep = event.dataTransfer.getData("dragStepId");
        let relatedBlueprintToDrop = event.dataTransfer.getData("relatedBlueprintToDrop");
        if(relatedBlueprintToDrag === relatedBlueprintToDrop){
            let dragId = draggedStep;
            let dropId = event.currentTarget.dataset.id;
            this.performDragAndDropForBlueprintStep(dragId,dropId,relatedBlueprintToDrag);
        }
    }

    /**
     * Call apex method to perform drag and drop.
     * @param dragId
     * @param dropId
     * @param relatedBlueprintToDrag
     */
    performDragAndDropForBlueprintStep(dragId,dropId,relatedBlueprintToDrag){
        this.showSpinner = true;
         handleDragAndDropForBlueprintStep({dragId:dragId,dropId:dropId,relatedBlueprintToDrag:relatedBlueprintToDrag}).then(result=>{
             if(result){
                 setTimeout(()=>{
                     this.refresh();
                     this.showSpinner = false;
                 },1000)

             }
         }).catch(err=>{
             this.showSpinner = false;
             console.log(err);
         })
    }

}