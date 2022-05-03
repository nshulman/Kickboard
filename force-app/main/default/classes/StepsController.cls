public class StepsController {

    public List<Blueprint_Step__c> stepsList {get;set;}
    
    public StepsController(){
        this.stepsList = new List<Blueprint_Step__c>();
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Blueprint_Step__c> getSteps(String blueprintId){
        List<Blueprint_Step__c> stepsList = new List<Blueprint_Step__c>([SELECT Id, Name, Order__c FROM Blueprint_Step__c WHERE Blueprint__c = :blueprintId ORDER BY Order__c ASC]);
        return stepsList;
    }
    
    //batch class?
    @AuraEnabled
    public static void updateDisplayOrdersOfSteps(List<Id> stepsToUpdate){
        List<Blueprint_Step__c> updatedList = new List<Blueprint_Step__c>();
        List<Blueprint_Step__c> stepsList = new List<Blueprint_Step__c>([Select Id, Name, Order__c FROM Blueprint_Step__c WHERE Id IN :stepsToUpdate]);
        for(Blueprint_Step__c step : stepsList){
            step.Order__c += 1;
            updatedList.add(step);
        }
        if(updatedList.size() > 0){
            update updatedList;
        }
    }
    
    @AuraEnabled
    public static void updateOnDragDrop(List<Blueprint_Step__c> stepsToUpdate){
        //system.debug('inside method');
        //system.debug('steps ->' + stepsToUpdate);
        update stepsToUpdate;
    }
}