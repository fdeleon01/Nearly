 var jsonArray=[];  
var allResults = new nlapiSearchRecord(null, 235, null, null);
    
    for(var i = 0; i < allResults.length; i++) {
      var json = {};

      var columnsSearch = allResults[i].getAllColumns();
      json.internalid=allResults[i].getId();
      json.itemid = allResults[i].getValue(columnsSearch[0]); 
      json.memberitem = allResults[i].getText(columnsSearch[1]); 
      json.memberitem2= allResults[i].getText(columnsSearch[2]); 
      json.itemtype = allResults[i].getRecordType();      
      json.componentName = allResults[i].getValue(columnsSearch[5]);      
      json.sort = allResults[i].getValue(columnsSearch[3]);      
      json.atum = parseInt(allResults[i].getValue(columnsSearch[6]));      
      json.atu = allResults[i].getValue(columnsSearch[7]);      
      json.minternalid = allResults[i].getValue(columnsSearch[8]);      
      json.mtype = allResults[i].getValue(columnsSearch[9]);      

      jsonArray.push(json)

    }

function startingSeting(){

try{
       /*var actualRecordId = nlapiGetRecordId();

         nlapiLogExecution('ERROR', 'sales order','sales order');
         var actualRecord = nlapiLoadRecord('salesorder', actualRecordId,{recordmode: 'dynamic'});
         var counterItems = actualRecord.getLineItemCount('item');
        
       for (var i = 1; i <= counterItems; i++) {

         var typeItem = actualRecord.getLineItemValue('inventory', 'itemtype', i);  
      
        if(typeItem != 'EndGroup' && typeItem != 'Group'){
         
         var internalId = actualRecord.getLineItemValue('item', 'item', i);
         var name = actualRecord.getLineItemText('item', 'item', i);
         if(name != '' && name){*/
          calculatedMcWos('','');
        // }
         
       // }
        
     //}; 

}catch(e){}
    
     }


    function calculatedMcWos(internalId,itemName){   
try{
      var filter2 = [];
      //filter2[0] = new nlobjSearchFilter('item', null, 'is', internalId);

      var newSearchResult = new nlapiSearchRecord(null, 234, filter2, null);
    
      if(newSearchResult.length>0){
           var x=0;
           var columnsSearch2 = newSearchResult[x].getAllColumns();
           var qty = parseInt(newSearchResult[x].getValue(columnsSearch2[1]).replace(",",""));       
           var itemName=newSearchResult[x].getValue(columnsSearch2[0]);       
      }else{
          return;
      }
      

      qtyleft=qty;
      var idxMember=0;

      for (var i = jsonArray.length-1 ; i >=0 && qtyleft>0; i--) 
      {

        if(jsonArray[xi].itemid==itemName){

        for (var xi = jsonArray.length-1 ; xi >=0 && qtyleft>0; xi--) 
        {
      
        if(jsonArray[xi].itemid==itemName){
            idxMember=xi;
          if(jsonArray[xi].atum>0){

              var type=returnTypeItem(jsonArray[xi].mtype)

              var id=jsonArray[xi].minternalid;

              qtyleft=qty-jsonArray[xi].atum;

              if(qtyleft<=0){ 
                        var a=2
                   nlapiSubmitField(type,id,'custitem_pending_work_order',qty);
              }else{
                    var a=4

                   nlapiSubmitField(type,id,'custitem_pending_work_order',qtyleft);
              }
          }else{
             itemName=jsonArray[xi].memberitem;  

          }
        }
      }//end for
       if(qtyleft>0){
          itemName=jsonArray[idxMember].memberitem;  
        }


    }//end if
  }//endfor
      if(xi<0 && qtyleft>0){
        var a=1
         nlapiSubmitField(type,id,'custitem_pending_work_order',qtyleft);
      }

    }catch(e){}
      
    }


      /*





      var filter = [];
      filter[0] = new nlobjSearchFilter('internalid', null, 'is', internalId);
      var searchResult = new nlapiSearchRecord(null, 109, filter, null);
      
      var itemAssembly = nlapiLoadRecord(searchResult[0].getRecordType(),internalId);  

      try{
      var itemQty = itemAssembly.getLineItemCount('member');
      }catch(e){
        var itemQty=0;
      }
      
      

      for (var z = 1; z <= itemQty; z++) {          

        var internalidComponent = itemAssembly.getLineItemValue('member', 'item', z);
        var typeComponent = itemAssembly.getLineItemValue('member', 'type', z);
       
        var nameAssembly = itemAssembly.getLineItemText('member', 'item', z);
        var qtyNecesary = itemAssembly.getLineItemValue('member', 'quantity', z);
        var totaltoUpdate = qtyNecesary * backOrder;
        var typeComponentSearch = itemAssembly.getLineItemValue('member', 'sitemtype', z);
        var typeItemComponent = returnTypeItem(typeComponentSearch);

        var itemMember = nlapiLoadRecord(typeItemComponent,internalidComponent);         

        if(parseFloat(totaltoUpdate) > 0){

           nlapiSubmitField(itemMember.getRecordType(),itemMember.getId(),'custitem_pending_work_order',totaltoUpdate,true); 
        }
        */


function returnTypeItem(type){
var retorno = '';

if(type == 'Assembly'){

  retorno = 'assemblyitem';
}else if(type == 'InvtPart'){

retorno = 'inventoryitem'
}
return retorno;
}
