function reviewItems(){

  try{
   var actualRecord = nlapiGetNewRecord();
      
   var itemqty = actualRecord.getLineItemCount('item');

    for(var i = 1; i <= itemqty; i++) {

        var typeItem = actualRecord.getLineItemValue('item', 'itemtype',i);
        var internalId = actualRecord.getLineItemValue('item', 'item', i);
        var type = returnTypeItem(typeItem);
       


        if(type != 'notype'){


          var recordItem = nlapiLoadRecord(type,internalId);
          var taOld = recordItem.getFieldValue("custitem_total_available");
          var atuOld = recordItem.getFieldValue("custitem_available_to_use");
          var atmOld = recordItem.getFieldValue("custitem_available_to_make");


          nlapiLogExecution('Emergency','atmOld',taOld)
          nlapiLogExecution('Emergency','atmOld',atuOld)
          nlapiLogExecution('Emergency','atmOld',atmOld)
       
          if(isNaN(taOld))taOld = 0;
          if(isNaN(atuOld))atuOld = 0;
          if(isNaN(atmOld))atmOld = 0;
          

          actualRecord.selectLineItem('item', i);
          actualRecord.setCurrentLineItemValue('item', 'custcol_before_atm', atmOld);
          actualRecord.setCurrentLineItemValue('item', 'custcol_before_atu', atuOld);
          actualRecord.setCurrentLineItemValue('item', 'custcol_before_ta', taOld);
          actualRecord.commitLineItem('item');

        }
        


    };



}catch(e){
nlapiLogExecution('ERROR','TYPE',e)
}



}

function returnTypeItem(type){
  var retorno = 'notype';

  if(type == 'Assembly'){

    retorno = 'assemblyitem';

  }else if(type == 'InvtPart'){

    retorno = 'inventoryitem';

  }else if (type == 'Group') {

    retorno = 'itemgroup';

  };

  return retorno;
}