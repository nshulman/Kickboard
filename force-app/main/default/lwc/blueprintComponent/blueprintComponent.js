import { LightningElement, track } from 'lwc';
import getSteps from '@salesforce/apex/StepsController.getSteps';
import updateDisplayOrdersOfSteps from '@salesforce/apex/StepsController.updateDisplayOrdersOfSteps';
import updateOnDragDrop from '@salesforce/apex/StepsController.updateOnDragDrop';
import STEP_OBJECT from '@salesforce/schema/Blueprint_Step__c';
import STEP_DESCRIPTION from '@salesforce/schema/Blueprint_Step__c.Description__c';
import STEP_BLUEPRINT from '@salesforce/schema/Blueprint_Step__c.Blueprint__c';
import STEP_DISPLAY_ORDER from '@salesforce/schema/Blueprint_Step__c.Order__c';
import STEP_STAGE from '@salesforce/schema/Blueprint_Step__c.Stage__c';
import STEP_NAME from '@salesforce/schema/Blueprint_Step__c.Name';

var indexFrom;
var indexTo;
export default class BlueprintComponent extends LightningElement {
    @track arrayOfMapOfStepIndexToName = [];
    showModal = false;
    targetOrder = null;
    objectApiName = STEP_OBJECT;
    stepDescriptionField = STEP_DESCRIPTION;
    stepBlueprintField = STEP_BLUEPRINT;
    stepDisplayOrder = STEP_DISPLAY_ORDER;
    stepStageField = STEP_STAGE;

    blueprintId = 'a041y0000035XMmAAM';
    error = '';
    showDisplayNumber = false;
    showAddPersona = true;
    newStepId = '';

    connectedCallback() {
        getSteps({ blueprintId: this.blueprintId })
            .then(result => {
                this.arrayOfMapOfStepIndexToName = result;
                this.sendSteps();
                if (this.arrayOfMapOfStepIndexToName.length > 0) {
                    this.showAddPersona = false;
                }
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.arrayOfMapOfStepIndexToName = undefined;
            });

    }

    handleAddStep(event) {
        this.showModal = true;
        this.targetOrder = event.target.dataset.order;
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        if (this.arrayOfMapOfStepIndexToName.length == 0) {
            this.targetOrder = 0;
            fields.Order__c = this.targetOrder;
        } else {
            fields.Order__c = parseInt(this.targetOrder) + 1;
        }
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    addStep(event) {

        if (event.detail.id) {
            this.newStepId = event.detail.id;
            let stepIdsToUpdate = [];
            let localArrayOfMapOfStepIndexToName = this.arrayOfMapOfStepIndexToName;
            let newStep = { Id: event.detail.id, Name: event.detail.fields.Name.value };
            let arrayOfFirstItems = localArrayOfMapOfStepIndexToName.slice(0, parseInt(this.targetOrder) + 1);
            arrayOfFirstItems.push(newStep);
            let arrayOfLastItems = localArrayOfMapOfStepIndexToName.slice(parseInt(this.targetOrder) + 1);
            localArrayOfMapOfStepIndexToName = arrayOfFirstItems.concat(arrayOfLastItems);
            this.arrayOfMapOfStepIndexToName = localArrayOfMapOfStepIndexToName;
            if (this.arrayOfMapOfStepIndexToName.length > 0) {
                this.showAddPersona = false;
            }
            arrayOfLastItems.forEach(function (step, index) {
                stepIdsToUpdate.push(step.Id);

            });

            if (stepIdsToUpdate.length > 0) {
                this.updateDisplayOrders(stepIdsToUpdate);
            }
        }
    }

    updateDisplayOrders(stepsToChange) {
        updateDisplayOrdersOfSteps({ stepsToUpdate: stepsToChange })
            .then(result => {
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
            });
    }

    enableModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    getStepId(index) {
        return this.arrayOfMapOfStepIndexToName[index].Id;
    }

    handleDragStart(event) {
        event.dataTransfer.dropEffect = 'move';
        indexFrom = parseInt(event.target.dataset.order, 10);
    }



    handleDrop(event) {
        indexTo = parseInt(event.target.dataset.order, 10);
        let localArray = this.arrayOfMapOfStepIndexToName;
        let arrayToUpdate = [];

        if (indexFrom < indexTo) {

            let arrayOfFirstItems = localArray.slice(0, indexFrom);

            let arrayOfMiddleItems = localArray.slice(indexFrom + 1, indexTo + 1);
            arrayOfMiddleItems.forEach(function (step, index) {
                let st = JSON.parse(JSON.stringify(step));
                st.Display_Order__c = step.Display_Order__c - 1;
                arrayToUpdate.push(st);
            });

            let arrayOfLastItems = localArray.slice(indexTo + 1);
            arrayOfLastItems.forEach(function (step, index) {
                let st = JSON.parse(JSON.stringify(step));
                st.Display_Order__c = step.Display_Order__c + 1;
                arrayToUpdate.push(st);
            });


            arrayOfFirstItems = arrayOfFirstItems.concat(arrayOfMiddleItems);
            let newStep = JSON.parse(JSON.stringify(localArray[indexFrom]));
            newStep.Display_Order__c = localArray[indexTo].Display_Order__c;
            arrayOfFirstItems.push(newStep);
            arrayToUpdate.push(newStep);
            localArray = arrayOfFirstItems.concat(arrayOfLastItems);
            this.arrayOfMapOfStepIndexToName = localArray;
        } else {


            let arrayOfLastItems = localArray.slice(indexFrom + 1);

            let arrayOfFirstItems = localArray.slice(0, indexTo);

            let newStep = JSON.parse(JSON.stringify(localArray[indexFrom]));
            arrayOfFirstItems.push(newStep);

            let arrayOfMiddleItems = localArray.slice(indexTo, indexFrom);


            arrayOfFirstItems = arrayOfFirstItems.concat(arrayOfMiddleItems);
            localArray = arrayOfFirstItems.concat(arrayOfLastItems);
            this.arrayOfMapOfStepIndexToName = localArray;
        }

        if (arrayToUpdate.length > 0) {
            updateOnDragDrop({ stepsToUpdate: arrayToUpdate })
                .then(result => {
                    this.error = undefined;
                })
                .catch(error => {
                    this.error = error;

                });
        }


    }

    handleDragover(event) {
        event.preventDefault();
    }

    sendSteps() {
        this.dispatchEvent(new CustomEvent('sendsteps', {
            detail: this.arrayOfMapOfStepIndexToName
        }))

    }
}