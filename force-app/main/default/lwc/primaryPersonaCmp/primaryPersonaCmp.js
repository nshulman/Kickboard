/* eslint-disable lines-between-class-members */
import { LightningElement, wire, api, track } from "lwc";
import getPrimaryInfo from "@salesforce/apex/personaStep.getPrimaryInfo";
import { refreshApex } from "@salesforce/apex";

export default class PrimaryPersonaCmp extends LightningElement {
    @api recordId;
    persona = { Name: "" };
    steps = [];
    cardMap = {};
    @track refreshPrimaryPersonaData;
    @track isRefresh = false;
    hasPrimaryPersona = false;

    /**
     * Get primary persona records and process the records.
     * @param result
     */
    @wire(getPrimaryInfo, { recordId: "$recordId" })
    getpersona(result) {
        let info = result?.data;
        if (info) {
            // deproxy
            info = JSON.parse(JSON.stringify(info));
            this.hasPrimaryPersona = true;
            // console.log("info", JSON.stringify(info));

            // Create map by Id
            this.personaStepMap = {};
            info.steps.forEach((x) => {
                this.cardMap[x.Blueprint_Step__c] =
                    x.Blueprint_Persona_Cards__r;
            });
            console.log("map", JSON.stringify(this.cardMap));
            this.refreshPrimaryPersonaData = result;
            this.persona = info.persona;
            this.steps = info.allSteps.map((s) => ({
                ...s,
                cards: this.cardMap[s.Id]
            }));
            console.log("steps", JSON.stringify(this.steps));
            // if (rows.length > 0) {
            //     const [primary] = rows; // Grab first row as primary
            //     this.processedPrimaryPersona =
            //         this.processPrimaryPersonaData(rows);
            //     console.log("primary", JSON.stringify(primary));
            //     this.primaryPersonaName =
            //         primary.Blueprint_Persona__r?.Name || "";
            //     this.hasPrimaryPersona = true;
            // }
        } else if (result.error) {
            console.log("Error", result.error);
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
     * Send personaStepId and order coming method to parent component.
     * @param event
     */
    sendBlueprintCardDetails(event) {
        console.log("bpcd");
        let obj = {};
        if (event.detail.isEdit) {
            obj = event.detail;
        } else {
            obj.id = event.target.dataset.id;
        }

        this.dispatchEvent(
            new CustomEvent("sendbpcarddetail", {
                detail: obj
            })
        );
    }
}
