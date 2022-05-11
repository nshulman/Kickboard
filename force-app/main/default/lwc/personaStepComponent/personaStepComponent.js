import { LightningElement, api,track,wire } from 'lwc';
import handleDragAndDrop from '@salesforce/apex/personaStep.handleDragAndDrop';
export default class PersonaStepComponent extends LightningElement {

    @api personaStepData;
    @track showSpinner = false;

    /**
     * Call apex method for drag and drop.
     * returns true if drag and drop successfully happen,
     * then call event for component refresh.
     * @param dragId
     * @param dropCardId
     * @param dropCardPSId
     */
    runDragAndDrop(dragId,dropCardId,dropCardPSId){
        handleDragAndDrop({dragCardId:dragId,dropCardId:dropCardId,dragDropPSId:dropCardPSId})
            .then((data)=>{
            console.log('data',data);
            if(data){
                setTimeout(()=>{
                    this.showSpinner = false;
                    this.dispatchEvent(new CustomEvent('refreshdragdrop',{
                        detail: true
                    }))
                },1000)
            }
        }).catch(err=>{
            console.log('err',err);
        })
    }

    /**
     * Set persona-step-id and card-id when we start dragging
      * @param event
     */
    dragCard(event){
        event.dataTransfer.setData('dragPersonaStepId', event.target.dataset.name);
        event.dataTransfer.setData('dragCardId', event.target.dataset.id);
    }

    /**
     *
     * @param event
     */
    allowDrop(event){
        event.preventDefault();
    }
    /**
     * check wether drag and drop is happen under same persona-step.
     * @param event
     */
    dropCard(event){
        event.preventDefault();
        let dropCardPSId = event.currentTarget.dataset.name;
        let dragCardPSId = event.dataTransfer.getData("dragPersonaStepId");
        let dragId = event.dataTransfer.getData("dragCardId");
        if(dropCardPSId===dragCardPSId){
            console.log('i ma in ')
            let dropCardId = event.currentTarget.dataset.id;
            this.showSpinner = true;
            this.runDragAndDrop(dragId,dropCardId,dropCardPSId);
        }
    }


}