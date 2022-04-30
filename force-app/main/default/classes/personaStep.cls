public class personaStep {
     public class myException extends Exception {}

    @AuraEnabled(cacheable=true)
    public static  List<Blueprint_Persona_Step__c> getAllPersonaSteps(List<string> stepIds){
        return [select id,Name,Blueprint_Persona__r.Name,  Blueprint_Step__r.Name,(select id,description__c,Type__c,Order__c from Blueprint_Cards__r) from Blueprint_Persona_Step__c where Blueprint_step__r.Id IN: stepIds AND Blueprint_Persona__r.Blueprint_Primary_Persona__c=:false];

    }
    
    @AuraEnabled(cacheable=true)
    public static  List<Blueprint_Step__c> getStepTemp(){
        return [select id from Blueprint_Step__c];
    }
    
   public static void checkForFirstPersona(List<Blueprint_Persona__c> persona){
        Boolean isPersonaChecked=false;
        for(Blueprint_Persona__c per :[select id,	Blueprint_Primary_Persona__c from Blueprint_Persona__c]){
            if(!isPersonaChecked && per.Blueprint_Primary_Persona__c){
                isPersonaChecked = true;
                break;
            }
        }
       
        for(Blueprint_Persona__c perRecord:persona){
            if(isPersonaChecked && perRecord.Blueprint_Primary_Persona__c ){
                perRecord.addError(new myException('Primary Persona already exists'));
            }
            else if(perRecord.Blueprint_Primary_Persona__c){
                isPersonaChecked = true;
            }
        }
   } 
    @AuraEnabled(cacheable=true)
    public static List<Blueprint_Persona_Step__c> getPrimaryPersona(){
        return [select id,Name,Blueprint_Persona__r.Name,  Blueprint_Step__r.Name,(select id,description__c,Type__c,Order__c from Blueprint_Cards__r) from Blueprint_Persona_Step__c where Blueprint_Persona__r.Blueprint_Primary_Persona__c=true];
        }
   
}