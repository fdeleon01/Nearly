var arrayIds = [];
startingSeting()
function startingSeting(){
var actualRecordId=nlapiGetRecordId();
nlapiLogExecution('ERROR','BEFORE','BEFORE PAUSE');
 
  try{
    var actualRecord = nlapiLoadRecord('salesorder', actualRecordId, {recordmode: 'dynamic'});

    nlapiLogExecution('ERROR','AFTER','record charge');
    
    var counter = actualRecord.getLineItemCount('item');

    for (var i = 1; i <= counter; i++) {
        
        var typeItem = actualRecord.getLineItemValue('item', 'itemtype',i);
                if (typeItem != 'Group' && typeItem != 'EndGroup') {

                   
                   var internalId = actualRecord.getLineItemValue('item', 'item', i);
                   var itemName = actualRecord.getLineItemText('item', 'item', i);
                   
                   calculatedMcWos(internalId,typeItem);

                   }
    };  
  nlapiLogExecution('ERROR', 'start : ', 'update Fields ATU');
 

  }catch(e){

    nlapiLogExecution('ERROR', 'ERROR : ',e);
  }

}


function calculatedMcWos(internalId,typeItem){   
  try{
    var filter2 = [];
    filter2[0] = new nlobjSearchFilter('item', null, 'is', internalId);

      var newSearchResult = new nlapiSearchRecord(null, 234, filter2, null);
      
      if(newSearchResult.length>0){
       var x=0;
       var columnsSearch2 = newSearchResult[x].getAllColumns();
       var qty = parseInt(newSearchResult[x].getValue(columnsSearch2[1]).replace(",",""));       
       var itemName=newSearchResult[x].getValue(columnsSearch2[0]);       
     }
    
     var type = returnTypeItem(typeItem)
     var id = internalId;

     var record = nlapiLoadRecord(type,id);
     var counterMembers = record.getLineItemCount('member');
     var flag = false;
     var arrayItems = [];

     for (var i = 1; i <= counterMembers && !flag; i++) {
         
         var memberId = record.getLineItemValue('member', 'item', i);  
         var type = returnTypeItem(record.getLineItemValue('member', 'sitemtype', i));  
         var fieldAtu = parseInt(nlapiLookupField(type,memberId,"custitem_available_to_use"));
         var memberObject = {};
         memberObject.type = type;
         memberObject.atu = fieldAtu;
         memberObject.id = memberId;

         if(fieldAtu >= qty){
          nlapiSubmitField(type,memberId,'custitem_pending_work_order',qty);
          flag = true;
          arrayIds.push(memberId)
         }

         arrayItems.push(memberObject);
     
     };
     if(!flag){

        var secondFlag = reviewMembers(arrayItems,qty);
        if(!secondFlag){

          for (var i = 0; i < arrayItems.length; i++) {
             if(arrayIds.indexOf(arrayItems[i].id)== -1){
              nlapiSubmitField(arrayItems[i].type,arrayItems[i].id,'custitem_pending_work_order',qty);
              arrayIds.push(arrayItems[i].id)
            }else{
              
              var availability = parseInt(nlapiLookupField(arrayItems[i].type,arrayItems[i].id,"custitem_pending_work_order"));
             if(isNaN(availability))availability = 0;  
             qty+=availability;
              nlapiSubmitField(arrayItems[i].type,arrayItems[i].id,'custitem_pending_work_order',qty);
            }
             
          };
         
        }
     }



}catch(e){
  nlapiLogExecution('ERROR','type error',e)
}

}

function reviewMembers(arrayItems,qty){

var flag = false;

for (var i = 0; i < arrayItems.length && !flag; i++) {
         
         var record = nlapiLoadRecord(arrayItems[i].type,arrayItems[i].id);
         var counterMembers = record.getLineItemCount('member');

         if(counterMembers && counterMembers >= 1){

                  for (var i = 1; i <= counterMembers && !flag; i++) {
         
                       var memberId = record.getLineItemValue('member', 'item', i);  
                       var type = returnTypeItem(record.getLineItemValue('member', 'sitemtype', i));  
                       var fieldAtu = parseInt(nlapiLookupField(type,memberId,"custitem_available_to_use"));
                       var availableMsp = parseInt(nlapiLookupField(type,memberId,"custitem_pending_work_order")); 
                       if(isNaN(availableMsp))availableMsp = 0;

                       if(arrayIds.indexOf(memberId)!=-1){
                         nlapiSubmitField(type,memberId,'custitem_pending_work_order',(qty+availableMsp));
                         flag = true;
                       }else if(fieldAtu >= qty){
                        nlapiSubmitField(type,memberId,'custitem_pending_work_order',qty);
                        flag = true;
                       }
                   
                 };

         }


     
     };
   
   return flag;

}


function returnTypeItem(type){
  var retorno = '';

  if(type == 'Assembly'){

    retorno = 'assemblyitem';

  }else if(type == 'InvtPart'){

    retorno = 'inventoryitem';

  }else if (type == 'Group') {

    retorno = 'itemgroup';

  };

  return retorno;
}


function pausecomp(millis) 
{
var date = new Date();
var curDate = null;

do { curDate = new Date(); } 
while(curDate-date < millis);
} 