import { LightningElement, api, wire, track } from 'lwc';

export default class PersonaStepComponent extends LightningElement {

    @api personaStepData;
    @track processedPersonaData;
    connectedCallback() {


        if (this.personaStepData && this.personaStepData.length > 0) {

            this.processedPersonaData = this.personaStepData.map(e => ({ ...e }));
            this.processedPersonaData =  this.processedPersonaData.sort((a, b) => ((a.Order__c && b.Order__c) && (a.Order__c > b.Order__c)) ? 1 : -1);

            if (this.processedPersonaData) {
                this.processedPersonaData = this.addCssClass(this.processedPersonaData);
            }
        }
    }
    addCssClass(data) {
        data.forEach(r => {
            if (r.Type__c === 'Emotions') {
                r['color'] = 'slds-card emotions-color';
            } else if (r.Type__c === "Facts and Observations") {
                r['color'] = 'slds-card fact-and-observations-color';
            } else if (r.Type__c === "Goals") {
                r['color'] = 'slds-card goals-color';
            } else if (r.Type__c === "Metrics") {
                r['color'] = 'slds-card metrics-color';
            } else if (r.Type__c === "Pain Points") {
                r['color'] = 'slds-card pain-points-color';
            } else if (r.Type__c === "Systems and Key Information") {
                r['color'] = 'slds-card systems-and-key-information-color';
            } else if (r.Type__c === "Touchpoints") {
                r['color'] = 'slds-card touchpoints-color';
            }else if(r.Type__c==='Opportunities and Ideas'){
                r['color'] = 'slds-card opportunity-and-ideas-color';
            }
        })
        return data;
    }

    addPersonaStep(event) {
        let obj = {};
        obj.personaStepId = event.target.dataset.id;
       // obj.stepId = event.target.dataset.item;
        this.dispatchEvent(new CustomEvent('addnewpersonastep', {
            detail: obj
        }))
    }
}