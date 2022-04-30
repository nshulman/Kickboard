trigger blueprintPersonaTrigger on Blueprint_Persona__c (before insert,before update) {
    if(Trigger.isBefore){
        if(Trigger.isInsert || Trigger.isUpdate){
            personaStep.checkForFirstPersona(Trigger.new);
        }
    }
}