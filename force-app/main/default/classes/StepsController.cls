public class StepsController {
    /**
     * Return all the steps under given blueprint
     * @param blueprintId
     *
     * @return
     */
    @AuraEnabled(cacheable=true)
    public static List<Blueprint_Step__c> getSteps(String blueprintId) {
        List<Blueprint_Step__c> stepsList = new List<Blueprint_Step__c>(
            [
                SELECT Id, Name, Blueprint__c, Order__c
                FROM Blueprint_Step__c
                WHERE Blueprint__c = :blueprintId
                ORDER BY Order__c ASC
            ]
        );
        return stepsList.size() > 0 ? stepsList : new List<Blueprint_Step__c>();
    }

    /**
     * Add new step and handle the order of step accordingly.
     * @param fields
     * @param order
     *
     * @return
     */
    @AuraEnabled
    public static Boolean addNewStep(String fields, String order) {
        Boolean isRecordInsert = false;
        Integer orderValue = Integer.valueOf(order);
        List<Blueprint_Step__c> updatedSteps = new List<Blueprint_Step__c>();
        Blueprint_Step__c newStep = (Blueprint_Step__c) JSON.deserialize(
            fields,
            Blueprint_Step__c.class
        );
        System.debug(newStep);
        if (newStep != null) {
            newStep.Order__c = orderValue + 1;
            updatedSteps.add(newStep);
            for (Blueprint_Step__c step : [
                SELECT id, Order__c
                FROM Blueprint_Step__c
                WHERE
                    Blueprint__c = :newStep.Blueprint__c
                    AND Order__c >= :orderValue + 1
            ]) {
                // Step cannot be null
                step.Order__c = step.Order__c+1;
                updatedSteps.add(step);
            }
            if (updatedSteps.size() > 0) {
                upsert updatedSteps;
                isRecordInsert = true;
            }
        }
        return isRecordInsert;
    }

    /**
     * Handle drag and drop of steps.
     * @param dragId
     * @param dropId
     * @param relatedBlueprintToDrag
     *
     * @return
     */
    @AuraEnabled
    public static Boolean handleDragAndDropForBlueprintStep(
        String dragId,
        String dropId,
        String relatedBlueprintToDrag
    ) {
        Boolean isSuccess = false;
        List<Blueprint_Step__c> updatedRecord = new List<Blueprint_Step__c>();
        Map<Id, Blueprint_Step__c> stepRecord = new Map<Id, Blueprint_Step__c>(
            [
                SELECT id, Order__c, Blueprint__c
                FROM Blueprint_Step__c
                WHERE Blueprint__c = :relatedBlueprintToDrag AND Order__c > 0
                ORDER BY Order__c
            ]
        );

        if (
            stepRecord.get(dragId)?.Order__c != null &&
            stepRecord.get(dropId)?.Order__c != null
        ) {
            Blueprint_Step__c step = stepRecord.get(dragId);
            Integer prevOrderDrag = Integer.valueOf(step.Order__c);
            Integer prevOrderDrop = Integer.valueOf(
                stepRecord.get(dropId).Order__c
            );
            step.Order__c = stepRecord.get(dropId).Order__c;
            stepRecord.remove(dragId);
            updatedRecord.add(step);
            for (Blueprint_Step__c bps : stepRecord.values()) {
                if (prevOrderDrag > prevOrderDrop) {
                    if (
                        bps.Order__c >= prevOrderDrop &&
                        bps.Order__c < prevOrderDrag
                    ) {
                        bps.Order__c = bps.Order__c + 1;
                    }
                } else if (prevOrderDrag < prevOrderDrop) {
                    if (
                        bps.Order__c <= prevOrderDrop &&
                        bps.Order__c > prevOrderDrag
                    ) {
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
