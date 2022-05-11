public class personaStep {

    public class myException extends Exception {
    }
    /**
     * @return List of primary persona
     */
    @AuraEnabled(cacheable=true)
    public static List<Blueprint_Persona_Step__c> getPrimaryPersonaRecords() {
        List<Blueprint_Persona_Step__c> primaryPersonaRecord = new List<Blueprint_Persona_Step__c>();
        List<Blueprint_Persona_Step__c> primaryPersonaData = [select id, Name, Blueprint_Persona__r.Name, Blueprint_Step__r.Name, (select id, description__c, cardCss__C, Type__c, Order__c from Blueprint_Cards__r ORDER BY Order__c) from Blueprint_Persona_Step__c where Blueprint_Persona__r.Blueprint_Primary_Persona__c = true];
        if (primaryPersonaData.size() > 0) {
            primaryPersonaRecord = primaryPersonaData;
        }
        return primaryPersonaRecord;
    }

    /**
     * @param stepIds
     * @return List of all persona steps
     */
    @AuraEnabled(cacheable=true)
    public static List<Blueprint_Persona_Step__c> getAllPersonaSteps(List<string> stepIds) {
        List<Blueprint_Persona_Step__c> personaStepsData = [select Id, Name, Blueprint_Persona__r.Name, Blueprint_Step__r.Name, (select id, description__c, cardCss__c, Type__c, Order__c from Blueprint_Cards__r ORDER BY Order__c) from Blueprint_Persona_Step__c where Blueprint_step__r.Id IN :stepIds AND Blueprint_Persona__r.Blueprint_Primary_Persona__c = :false ORDER BY Order__c];
        return personaStepsData.size() > 0 ? personaStepsData : new List<Blueprint_Persona_Step__c>();
    }


//    @AuraEnabled(cacheable=true)
//    public static  List<Blueprint_Step__c> getStepTemp(){
//        return [select id from Blueprint_Step__c];
//    }
    /**
     * This method is called by trigger which check if primary persona already exists or not.
    * @param persona
    */
    public static void checkForFirstPersona(List<Blueprint_Persona__c> persona) {
        Boolean isPersonaChecked = false;
        for (Blueprint_Persona__c per : [select id, Blueprint_Primary_Persona__c from Blueprint_Persona__c]) {
            if (!isPersonaChecked && per.Blueprint_Primary_Persona__c) {
                isPersonaChecked = true;
                break;
            }
        }

        for (Blueprint_Persona__c perRecord : persona) {
            if (isPersonaChecked && perRecord.Blueprint_Primary_Persona__c) {
                perRecord.addError(new myException('Primary Persona already exists'));
            } else if (perRecord.Blueprint_Primary_Persona__c) {
                isPersonaChecked = true;
            }
        }
    }


    /**
     * perform drag and drop on blueprint card.
     * @param dragCardId
     * @param dropCardId
     * @param dragDropPSId
     *
     * @return
     */
    @AuraEnabled
    public static Boolean handleDragAndDrop(String dragCardId, String dropCardId, String dragDropPSId) {
        Boolean isSuccess = false;
        List<Blueprint_Card__c> updateDragDropCard = new List<Blueprint_Card__c>();
        Map<Id, Blueprint_Card__c> cardList = new Map<Id, Blueprint_Card__c>([select id, Order__c from Blueprint_Card__c where Blueprint_Persona_Step__c = :dragDropPSId ORDER BY Order__c]);
        if (cardList.get(dragCardId) != null && cardList.get(dragCardId).Order__c != null && cardList.get(dropCardId) != null && cardList.get(dropCardId).Order__c != null) {
            Blueprint_Card__c changedragDropOrder = cardList.get(dragCardId);
            Integer preOrderDragCard = Integer.valueOf(changedragDropOrder.Order__c);
            Integer preOrderDropCard = Integer.valueOf(cardList.get(dropCardId).Order__c);
            changedragDropOrder.Order__c =cardList.get(dropCardId).Order__c;
            cardList.remove(dragCardId);

            updateDragDropCard.add(changedragDropOrder);


            for (Blueprint_Card__c bpc : cardList.values()) {
                if (preOrderDragCard > preOrderDropCard) {
                    if (bpc.Order__c >= preOrderDropCard && bpc.Order__c < preOrderDragCard) {
                        bpc.Order__c = bpc.Order__c + 1;
                    }
                } else if (preOrderDragCard < preOrderDropCard) {
                    if (bpc.Order__c <= preOrderDropCard && bpc.Order__c > preOrderDragCard) {
                        bpc.Order__c = bpc.Order__c - 1;
                    }
                }

                updateDragDropCard.add(bpc);
            }
        }
        if (updateDragDropCard.size() > 0) {
            upsert updateDragDropCard;
            isSuccess = true;
        }
        return isSuccess;
    }
    /**
     * create new card.
     * @param fields
     *
     * @return
     */
    @AuraEnabled
    public static boolean addNewCard(String fields) {
        Boolean isRecordInsert = false;
        Blueprint_card__c newCardFields = (Blueprint_card__c) Json.deserialize(fields, Blueprint_card__c.class);
        List<Blueprint_card__c> maxOrderRecord = [select  order__c from  Blueprint_Card__c where Blueprint_Persona_Step__c = :newCardFields.Blueprint_Persona_Step__c order by order__c desc limit 1];
        List<Blueprint_card__c> updatedCards = new List<Blueprint_card__c>();
        if (newCardFields != null) {
            newCardFields.Order__c = maxOrderRecord.size()>0 ? maxOrderRecord[0].Order__c+1 : 1;
            updatedCards.add(newCardFields);
         if (updatedCards.size() > 0) {
                upsert updatedCards;
                isRecordInsert = true;
            }

        }
        return isRecordInsert;
    }
    /**
     * perform drag and drop on blueprint persona step.
     * @param dragId
     * @param dropId
     * @param relatedStepToDrag
     *
     * @return
     */
    @AuraEnabled
    public static Boolean handleDragAndDropForPS(String dragId,String dropId,String relatedStepToDrag){
       Boolean isSuccess = false;
        List<Blueprint_Persona_Step__c> updatedRecord = new List<Blueprint_Persona_Step__c>();
        Map<Id,Blueprint_Persona_Step__c> psRecord = new Map<Id,Blueprint_Persona_Step__c>([SELECT id,Order__c from Blueprint_Persona_Step__c WHERE Blueprint_Step__c=:relatedStepToDrag AND Order__c>0 ORDER BY Order__c]);
        if(psRecord.get(dragId) != null && psRecord.get(dragId).Order__c != null && psRecord.get(dropId) != null && psRecord.get(dropId).Order__c != null ){
            Blueprint_Persona_Step__c persona_step=  psRecord.get(dragId);
            Integer prevOrderDrag = Integer.valueOf(persona_step.Order__c);
            Integer prevOrderDrop =  Integer.valueOf(psRecord.get(dropId).Order__c);
            persona_step.Order__c =psRecord.get(dropId).Order__c;
            psRecord.remove(dragId);
            updatedRecord.add(persona_step);
            for(Blueprint_Persona_Step__c bps:psRecord.values()){
                if (prevOrderDrag > prevOrderDrop) {
                    if (bps.Order__c >= prevOrderDrop && bps.Order__c < prevOrderDrag) {
                        bps.Order__c = bps.Order__c + 1;
                    }
                } else if (prevOrderDrag < prevOrderDrop) {
                    if (bps.Order__c <= prevOrderDrop && bps.Order__c > prevOrderDrag) {
                        bps.Order__c = bps.Order__c - 1;
                    }
                }
                updatedRecord.add(bps);
            }
        }
        if (updatedRecord.size() > 0) {
            upsert updatedRecord;
            isSuccess = true;
        }
        return isSuccess;
    }
}