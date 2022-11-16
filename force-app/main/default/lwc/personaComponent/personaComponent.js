import { LightningElement, wire, track, api } from "lwc";
import getAllPersonaSteps from "@salesforce/apex/personaStep.getAllPersonaSteps";
import addNewCard from "@salesforce/apex/personaStep.addNewCard";
import addNewPersona from "@salesforce/apex/personaStep.addNewPersona";
import handleDragAndDropForPS from "@salesforce/apex/personaStep.handleDragAndDropForPS";
import BLUEPRINT_CARD_PERSONA_STEP from "@salesforce/schema/Blueprint_Card__c.Blueprint_Persona_Step__c";
import BLUEPRINT_CARD_DESCRIPTION from "@salesforce/schema/Blueprint_Card__c.Description__c";
import BLUEPRINT_CARD_TYPE from "@salesforce/schema/Blueprint_Card__c.Type__c";
import BLUEPRINT_CARD_OBJECT from "@salesforce/schema/Blueprint_Card__c";
import BLUEPRINT_STEP from "@salesforce/schema/Blueprint_Persona_Step__c.Blueprint_Step__c";
import BLUEPRINT_PERSONA from "@salesforce/schema/Blueprint_Persona_Step__c.Blueprint_Persona__c";
import BLUEPRINT_PERSONA_STEP_OBJECT from "@salesforce/schema/Blueprint_Persona_Step__c";
import deleteCardRecord from "@salesforce/apex/personaStep.deleteCardRecord";
import { refreshApex } from "@salesforce/apex";

export default class PersonaStepCmp extends LightningElement {
    @track BLUEPRINTPERSONASTEP = "Blueprint_Persona_Step__c";
    @track BLUEPRINTSTEP = "Blueprint_Step__c";
    @track CREATE_NEW_CARD = "Create New Blueprint Card";
    @track EDIT_CARD = "Edit Blueprint Card";
    @api currentStepId;
    @api stepIds;
    @track personaRecordForRefresh;
    @track showSpinner = false;
    @track isModalOpen = false;
    @track personaRecords = [];
    @track isPrimaryPersonaCard;
    @track apiName;

    firstStep = true;

    @track metadata;
    @track blueprintCardApiName = BLUEPRINT_CARD_OBJECT;
    @track blueprintPersonaStepApiName = BLUEPRINT_PERSONA_STEP_OBJECT;
    @track blueprintCardFieldMetadata = [
        {
            id: 1,
            name: BLUEPRINT_CARD_PERSONA_STEP,
            isDisabled: true,
            required: true,
            value: ""
        },
        {
            id: 2,
            name: BLUEPRINT_CARD_DESCRIPTION,
            isDisabled: false,
            required: false,
            value: ""
        },
        { id: 3, name: BLUEPRINT_CARD_TYPE, isDisabled: false, required: true }
    ];
    @track blueprintPersonaStepFieldMetadata = [
        {
            id: 1,
            name: BLUEPRINT_STEP,
            isDisabled: true,
            required: true,
            value: ""
        },
        { id: 2, name: BLUEPRINT_PERSONA, isDisabled: false, required: true }
    ];
    @track editRecordId;
    @track formHeading;
    @track isDelete = false;
    @track deleteTitle = "Delete Card";
    @track isDeleteRecordId;
    @track deleteMessage = "Are you sure you want to delete?";

    /**
     * Get all persona step data
     * @param result
     */
    @wire(getAllPersonaSteps, { stepIds: "$currentStepId" })
    wiredGetAllPersonaSteps(result) {
        if (result && result.data) {
            this.personaRecordForRefresh = result;
            if (result && result.data && result.data.length > 0) {
                let data = result.data;
                this.personaRecords = this.processPersonaStepData(data);
            }
        } else if (result.error) {
            console.log("Error", result.error);
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
        if (data) {
            data.forEach((perStep) => {
                if (
                    Object.keys(stepToPersonaMap).includes(
                        perStep.Blueprint_Step__c
                    )
                ) {
                    stepToPersonaMap[perStep.Blueprint_Step__c].push(perStep);
                } else {
                    let personaStepArray = [];
                    personaStepArray.push(perStep);
                    stepToPersonaMap[perStep.Blueprint_Step__c] =
                        personaStepArray;
                }
            });
            Object.keys(stepToPersonaMap).forEach((stepRec) => {
                let indexOfStep;
                for (let i = 0; i < this.currentStepId.length; i++) {
                    if (this.currentStepId[i] === stepRec) {
                        indexOfStep = i;
                        break;
                    }
                }
                let obj = {};
                obj.key = indexOfStep;
                obj.value = stepToPersonaMap[stepRec];
                result[indexOfStep] = obj;
            });
            for (let c = 0; c < this.currentStepId.length; c++) {
                if (!result[c]) {
                    let obj = {};
                    obj.key = c;
                    result[c] = obj;
                }
            }
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
            this.metadata = null;
            this.apiName = "";
            this.editRecordId = null;
        }
    }

    /**
     * Create and send metadata to record-edit-form to create new blueprint card.
     * @param event
     * @param isPrimary
     */
    @api createMetadataBlueprintCard(event, isPrimary) {
        if (this.apiName) {
            this.apiName = "";
        }
        this.apiName = this.blueprintCardApiName;
        this.isPrimaryPersonaCard = isPrimary;
        let personastepId;
        if (event.detail.isEdit) {
            this.editRecordId = event.detail.id ? event.detail.id : "";
            this.formHeading = this.EDIT_CARD;
        } else {
            this.editRecordId = "";
            personastepId = isPrimary
                ? event.detail.id
                : event.target.dataset.id;
            this.formHeading = this.CREATE_NEW_CARD;
        }

        if (personastepId || this.editRecordId) {
            this.isModalOpen = true;
            this.blueprintCardFieldMetadata.forEach((data) => {
                if (data.name.fieldApiName === this.BLUEPRINTPERSONASTEP) {
                    if (data.value) {
                        data.value = "";
                    }
                    data.value = personastepId ? personastepId : "";
                }
            });
        }
        if (this.metadata && this.metadata.length > 0) {
            this.metadata = null;
        }
        this.metadata = this.blueprintCardFieldMetadata;
    }

    /**
     * Handel record creation of card and persona step.
     * @param event
     */
    createRecord(event) {
        if (event.detail && event.detail.objectName) {
            if (
                event.detail.objectName ===
                    this.blueprintPersonaStepApiName.objectApiName &&
                event.detail.fields != null
            ) {
                this.createBlueprintPersona(event.detail.fields);
            } else if (
                event.detail.objectName ===
                    this.blueprintCardApiName.objectApiName &&
                event.detail.fields != null
            ) {
                this.createBlueprintCard(event.detail.fields);
            }
        }
    }
    /**
     * create new blueprint card by calling method from apex class.
     * @param event
     */
    createBlueprintCard(data) {
        if (data != null) {
            this.showSpinner = true;
            let fields = JSON.stringify(data);
            addNewCard({ fields: fields })
                .then((response) => {
                    if (response) {
                        this.isModalOpen = false;
                        this.metadata = null;
                        if (!this.isPrimaryPersonaCard) {
                            this.refresh();
                        } else {
                            this.dispatchEvent(
                                new CustomEvent("refreshprimarycard", {
                                    detail: true
                                })
                            );
                        }
                        this.showSpinner = false;
                    }
                })
                .catch((err) => {
                    console.log("err" + err);
                })
                .finally(() => {
                    this.showSpinner = false;
                });
        }
    }

    /**
     * When card is successfully created it is used to refresh component
     * @param event
     */
    cardCreationSuccess(event) {
        if (event.detail.id) {
            this.isModalOpen = false;
            this.showSpinner = true;
            this.metadata = null;
        }
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            if (!this.isPrimaryPersonaCard) {
                this.refresh();
            } else {
                this.dispatchEvent(
                    new CustomEvent("refreshprimarycard", {
                        detail: true
                    })
                );
            }
            this.showSpinner = false;
        }, 1000);
    }

    /**
     * Call method for component refresh.
     * @param event
     */
    refreshOnDragDrop(event) {
        if (event.detail) {
            this.refresh();
        }
    }

    /**
     * Drag persona step
     * @param event
     */
    dragPersona(event) {
        event.dataTransfer.setData("dragPSId", event.target.dataset.id);
        event.dataTransfer.setData(
            "relatedStepToDrop",
            event.target.dataset.name
        );
    }

    /**
     *
     * @param event
     */
    dragOverPersona(event) {
        event.preventDefault();
    }

    /**
     * set drag and drop id.
     * @param event
     */
    dropPersona(event) {
        event.preventDefault();
        let relatedStepToDrag = event.currentTarget.dataset.name;
        let draggedPS = event.dataTransfer.getData("dragPSId");
        let relatedStepToDrop = event.dataTransfer.getData("relatedStepToDrop");
        if (relatedStepToDrag === relatedStepToDrop) {
            let dragId = draggedPS;
            let dropId = event.currentTarget.dataset.id;
            this.performDragAndDropForPersona(
                dragId,
                dropId,
                relatedStepToDrag
            );
        }
    }

    /**
     * call method from apex for drag-drop.
     * @param dragId
     * @param dropId
     * @param relatedStepToDrag
     */
    performDragAndDropForPersona(dragId, dropId, relatedStepToDrag) {
        this.showSpinner = true;
        handleDragAndDropForPS({
            dragId: dragId,
            dropId: dropId,
            relatedStepToDrag: relatedStepToDrag
        })
            .then((result) => {
                if (result) {
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(() => {
                        this.refresh();
                        this.showSpinner = false;
                    }, 1000);
                }
            })
            .catch((err) => {
                console.log("err", err);
            })
            .finally(() => {
                this.showSpinner = false;
            });
    }

    /**
     * Create metadata for new persona.
     * @param event
     */
    createFormForNewPersona(event) {
        if (this.apiName || this.editRecordId) {
            this.apiName = null;
            this.editRecordId = null;
        }
        this.apiName = this.blueprintPersonaStepApiName;
        let currentIndex =
            event.currentTarget && event.currentTarget.dataset
                ? event.currentTarget.dataset.id
                : "";
        let personastepId =
            this.currentStepId && this.currentStepId.length > 0
                ? this.currentStepId[currentIndex]
                : "";
        if (personastepId) {
            this.isModalOpen = true;
            this.blueprintPersonaStepFieldMetadata.forEach((data) => {
                if (
                    data.name &&
                    data.name.fieldApiName === this.BLUEPRINTSTEP
                ) {
                    if (data.value) {
                        data.value = "";
                    }
                    data.value = personastepId ? personastepId : "";
                }
            });
        }
        if (this.metadata && this.metadata.length > 0) {
            this.metadata = null;
        }
        this.metadata = this.blueprintPersonaStepFieldMetadata;
    }

    /**
     * Creation of new blueprint persona.
     * @param data
     */
    createBlueprintPersona(data) {
        if (data != null) {
            this.showSpinner = true;
            let fields = JSON.stringify(data);
            addNewPersona({ fields: fields })
                .then((response) => {
                    if (response) {
                        this.isModalOpen = false;
                        this.metadata = null;
                        this.refresh();
                        this.dispatchEvent(
                            new CustomEvent("refreshprimarycard", {
                                detail: true
                            })
                        );
                        this.showSpinner = false;
                    }
                })
                .catch((err) => {
                    console.log("err" + err);
                    this.showSpinner = false;
                });
        }
    }
    /**
     * Set delete record Id.
     * @param event
     */
    handleRecordDelete(event) {
        this.isDelete = true;
        let recordId =
            event.target && event.target.dataset.id
                ? event.target.dataset.id
                : "";
        if (this.isDeleteRecordId) {
            this.isDeleteRecordId = null;
        }
        this.isDeleteRecordId = recordId;
    }
    /**
     * handle deletion of card record.
     * @param event
     */
    deleteRecord(event) {
        if (event.detail && event.detail.isDelete && event.detail.deleteId) {
            deleteCardRecord({ deleteId: event.detail.deleteId })
                .then((response) => {
                    if (response) {
                        this.isDelete = false;
                        this.closeModal(event);
                        this.refreshOnDragDrop(event);
                        this.dispatchEvent(
                            new CustomEvent("refreshprimarycard", {
                                detail: true
                            })
                        );
                    }
                })
                .catch((error) => {
                    console.log("error", error);
                });
        }
    }
    handleClose(event) {
        if (event.detail) {
            this.isDelete = false;
        }
    }
}
