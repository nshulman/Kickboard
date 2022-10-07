import { LightningElement, api, track } from "lwc";
import handleDragAndDrop from "@salesforce/apex/personaStep.handleDragAndDrop";
// import deleteCardRecord from "@salesforce/apex/personaStep.deleteCardRecord";
export default class PersonaStepComponent extends LightningElement {
    @track personas = [];

    @api
    get personaStepData() {
        return this.personas;
    }

    set personaStepData(value) {
        // recreate the array and values and lose the proxy
        this.personas = Array.isArray(value)
            ? value.map((x) => ({ ...x }))
            : [];
    }

    @track showSpinner = false;

    @track isDelete = false;

    @track deleteTitle = "Delete Card";

    @track isDeleteRecordId;

    @track deleteMessage = "Are you sure you want to delete?";

    /**
     * Call apex method for drag and drop.
     * returns true if drag and drop successfully happen,
     * then call event for component refresh.
     * @param dragId
     * @param dropCardId
     * @param dropCardPSId
     */
    runDragAndDrop(dragId, dropCardId, dropCardPSId) {
        handleDragAndDrop({
            dragCardId: dragId,
            dropCardId: dropCardId,
            dragDropPSId: dropCardPSId
        })
            .then((data) => {
                if (data) {
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(() => {
                        this.showSpinner = false;
                        this.dispatchEvent(
                            new CustomEvent("refreshdragdrop", {
                                detail: true
                            })
                        );
                    }, 1000);
                }
            })
            .catch((err) => {
                console.log("err", err);
            });
    }

    /**
     * Set persona-step-id and card-id when we start dragging
     * @param event
     */
    dragCard(event) {
        event.dataTransfer.setData(
            "dragPersonaStepId",
            event.target.dataset.name
        );
        event.dataTransfer.setData("dragCardId", event.target.dataset.id);
    }

    /**
     *
     * @param event
     */
    allowDrop(event) {
        event.preventDefault();
    }

    /**
     * check wether drag and drop is happen under same persona-step.
     * @param event
     */
    dropCard(event) {
        event.preventDefault();
        let dropCardPSId = event.currentTarget.dataset.name;
        let dragCardPSId = event.dataTransfer.getData("dragPersonaStepId");
        let dragId = event.dataTransfer.getData("dragCardId");
        if (dropCardPSId === dragCardPSId) {
            let dropCardId = event.currentTarget.dataset.id;
            this.showSpinner = true;
            this.runDragAndDrop(dragId, dropCardId, dropCardPSId);
        }
    }

    handleRecordEdit(event) {
        let recordId = event.currentTarget.dataset.id;
        let obj = {};
        obj.id = recordId;
        obj.isEdit = true;
        this.dispatchEvent(
            new CustomEvent("editrecord", {
                detail: obj
            })
        );
    }

    handleShowEdit({ target }) {
        this.toggleEditVisibility(target, true);
    }

    handleHideEdit({ target }) {
        this.toggleEditVisibility(target, false);
    }

    toggleEditVisibility(target, vis) {
        // find the related row and set appropriate visibility value
        const row = this.personas.find((x) => x.Id === target.dataset.id);
        row.visible = vis;
    }
    /**
     * Set delete record Id.
     * @param event
     */
    // handleRecordDelete(event){
    //     this.isDelete = true;
    //     let recordId = event.target && event.target.dataset.id ? event.target.dataset.id : '';
    //     if(this.isDeleteRecordId){
    //         this.isDeleteRecordId = null;
    //     }
    //     this.isDeleteRecordId = recordId;
    // }

    // handleClose(event){
    //     if(event.detail){
    //         this.isDelete = false;
    //     }
    // }

    // /**
    //  * handle deletion of card record.
    //  * @param event
    //  */
    // deleteRecord(event){
    //   if(event.detail && event.detail.isDelete && event.detail.deleteId){
    //       deleteCardRecord({deleteId:event.detail.deleteId}).then(response=>{
    //           if(response){
    //               this.isDelete = false;
    //               this.dispatchEvent(new CustomEvent('refreshdragdrop',{
    //                   detail: true
    //               }))
    //           }
    //       }).catch(error=>{
    //           console.log('error',error);
    //       })
    //   }
    // }
}
