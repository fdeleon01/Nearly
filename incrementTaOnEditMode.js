function loadItem(itemId) {
    try {   
        itemRecord = nlapiLoadRecord('inventoryitem', itemId);
    } catch(SSS_RECORD_TYPE_MISMATCH) {     
        try {   
            itemRecord = nlapiLoadRecord('noninventoryitem', itemId);
        } catch(SSS_RECORD_TYPE_MISMATCH) {     
            try {
                itemRecord = nlapiLoadRecord('kititem', itemId);
            } catch(SSS_RECORD_TYPE_MISMATCH) {
                try {
                    itemRecord = nlapiLoadRecord('assemblyitem', itemId);
                } catch(SSS_RECORD_TYPE_MISMATCH) {
                    try {
                        itemRecord = nlapiLoadRecord('serviceitem', itemId);
                    } catch(SSS_RECORD_TYPE_MISMATCH) {
                       try{
                        itemRecord = nlapiLoadRecord('itemgroup', itemId);
                       }catch(e){
                            return "";
                       }
                    }
                    nlapiXMLToPDF     }
                }
            }
        }

        return itemRecord;
    }



function start(){

try{

  var allResults = [];
  var columns = [];
  var filters = [];
  var parentsIds = [];
  var parent = 0;
  var arrayInventoryGroup = [];
  var timeNow = new Date();
  timeNow = timeNow.toString();
  var actualRecordId=nlapiGetRecordId();

  var actualRecord = nlapiGetOldRecord();
  var counterItems = actualRecord.getLineItemCount('item');

  nlapiLogExecution('ERROR', 'error','start');

var ultimaQty=0;
for (var i = 1; i <= counterItems; i++) {

var typeItemReview = actualRecord.getLineItemValue('item', 'itemtype', i);
nlapiLogExecution('ERROR', 'typeItemReview',typeItemReview);
            
if(typeItemReview != 'EndGroup'){

            var typeItem = returnTypeItem(typeItemReview); 
            var id = actualRecord.getLineItemValue('item', 'item', i);

           
            
            if(actualRecord.getLineItemValue('item', 'units_display', i)){   
          

            if(actualRecord.getLineItemValue('item', 'units_display', i).split('CS')[1]){
              var num = parseFloat(actualRecord.getLineItemValue('item', 'units_display', i).split('CS')[1]); 
            }else{
              var num = 1
            }           

            }else{

              var num = 1;
            }        

            var item = nlapiLoadRecord(typeItem,id);

            var qtyOnOrder = parseFloat(actualRecord.getLineItemValue('item', 'quantity', i));

            nlapiLogExecution('ERROR', 'qtyOnOrder',actualRecord.getLineItemValue('item', 'quantity', i));

            qtyOnOrder = parseFloat(qtyOnOrder*num);
            if(isNaN(qtyOnOrder))qtyOnOrder=0;

            
             

              var currentTA = parseInt(nlapiLookupField(item.getRecordType(),item.getId(),"custitem_total_available"));
              
              if(isNaN(currentTA))currentTA=0;
              
               
              var newQtyUpdate = (currentTA + qtyOnOrder);
              newQtyUpdate = newQtyUpdate.toFixed();
              nlapiLogExecution('ERROR', 'newQtyUpdate',newQtyUpdate);


             if(newQtyUpdate>0) ultimaQty=newQtyUpdate;
             nlapiSubmitField(item.getRecordType(),id,'custitem_total_available',ultimaQty,true); 

              }
     

     }

  

  }catch(e){
    nlapiLogExecution('ERROR', 'error',e);
    
  }

}

function returnTypeItem(type){
var retorno = '';

if(type == 'Assembly'){

  retorno = 'assemblyitem';

}else if(type == 'InvtPart'){

retorno = 'inventoryitem';

}else if(type=="Group"){

  retorno = 'itemgroup';
}
return retorno;
}
