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
    
var timeNow = new Date();
timeNow = timeNow.toString();

function start(){

try{

  var allResults = [];
  var columns = [];
  var filters = [];
  var actualRecordId=nlapiGetRecordId();

  var actualRecord = nlapiLoadRecord('itemreceipt', actualRecordId, {recordmode: 'dynamic'});
  nlapiLogExecution('ERROR', 'Record Item Receipt','Charge');

  var counterItems = actualRecord.getLineItemCount('item');

    
for (var x = 1; x <= counterItems; x++) {
      
      var filters = [];
       var typeItem = actualRecord.getLineItemValue('item', 'itemtype', x);      
      var internalId = actualRecord.getLineItemText('item', 'item', x);
       
      //filter[0] = new nlobjSearchFilter('member', null, 'is', internalId);
 
      filters[0] = new nlobjSearchFilter('formulatext', null, 'is', internalId).setOr(true);
      filters[0].setFormula('{memberitem.memberitem}');
       filters[1] = new nlobjSearchFilter('formulatext', null, 'is', internalId).setOr(true);
      filters[1].setFormula('{memberitem}');
       filters[2] = new nlobjSearchFilter('itemid', null, 'is', internalId).setOr(true);
       
      var searchResult = new nlapiSearchRecord(null, 230, filters, null);

      if(searchResult && searchResult.length > 0){

           for(var i = searchResult.length-1; searchResult && i >=0; i--) {
  
              var internalId2 = searchResult[i].getId()
              nlapiLogExecution('DEBUG', 'internalId2', internalId2);
              
              var typeItem = searchResult[i].getRecordType();
              reviewItems(internalId2,typeItem);

             if(typeItem == 'itemgroup'){
                setTaInGroupitems(internalId2)

             }
              
             
            

       }


      }


  };



nlapiLogExecution('ERROR', 'Finish','Finish Script');

  }catch(e){
    nlapiLogExecution('ERROR', 'error',e);
  }

}




function reviewItems(internalId2,typeItem){

     var arrayItems = [];
     var filter = [];


     filter.push(new nlobjSearchFilter('internalid', null, 'is', internalId2));
     
    
    var allResults = new nlapiSearchRecord(null, 117, filter, null);
  

    for(var i = 0; i < allResults.length; i++) {

       

      var columnsSearch = allResults[i].getAllColumns();
      var internalId = allResults[i].getValue(columnsSearch[1]);
      var nameParent = allResults[i].getValue(columnsSearch[0]);      
      var atu = parseInt(allResults[i].getValue(columnsSearch[4]).replace(",",""));
      var atm = parseInt(allResults[i].getValue(columnsSearch[3]).replace(",",""));

      var ta = parseInt(allResults[i].getValue(columnsSearch[2]).replace(",",""));
     
      
     

      if(typeItem == 'inventoryitem'){

          ta = parseInt(allResults[i].getValue(columnsSearch[4]).replace(",",""));
      }
     


     
      if(isNaN(atm))atm = 0;
      if(isNaN(atu))atu = 0;
      if(isNaN(ta))ta = 0;

      var filter = [];
      filter[0] = new nlobjSearchFilter('internalid', null, 'is', internalId);
      var searchResult = new nlapiSearchRecord(null, 109, filter, null);
       



        
        //atu = atu - backOrder;
        //atm = atm - backOrder;
        
         
       
        var totalAvailable = (atm + atu);
        
        //nlapiLogExecution('ERROR', 'available on item search: ',totalAvailable); 

        nlapiSubmitField(searchResult[0].getRecordType(),searchResult[0].getId(),'custitem4',timeNow,true); 
        nlapiSubmitField(searchResult[0].getRecordType(),searchResult[0].getId(),'custitem_total_available',ta,true); 
    
        nlapiSubmitField(searchResult[0].getRecordType(),searchResult[0].getId(),'custitem_available_to_make',atm,true); 
        nlapiSubmitField(searchResult[0].getRecordType(),searchResult[0].getId(),'custitem_available_to_use',atu,true); 


    }




}



function setTaInGroupitems(internalId2){

nlapiLogExecution('ERROR', 'start: ','setTaInGroupitems function');
try{


var filter = [];
filter.push(new nlobjSearchFilter('internalid', null, 'is', internalId2));

var searchResult = new nlapiSearchRecord(null, 223,filter,null);



if(searchResult.length > 0){
       
      var columnsSearch = searchResult[0].getAllColumns();
     
      var atm = parseInt(searchResult[0].getValue(columnsSearch[2]).replace(",",""));      
      var ta = atm;
    
 
        nlapiSubmitField('itemgroup',internalId,'custitem_total_available',ta,true); 
        nlapiSubmitField('itemgroup',internalId2,'custitem_available_to_use',0,true); 
        nlapiSubmitField('itemgroup',internalId2,'custitem_available_to_make',atm,true); 
        nlapiSubmitField('itemgroup',internalId2,'custitem4',timeNow,true); 
   
       
      
  

      

}else {


var filter = [];
filter.push(new nlobjSearchFilter('internalid', null, 'is', internalId2));


var searchResult = new nlapiSearchRecord(null, 231,filter,null);


  var columnsSearch = searchResult[0].getAllColumns();
  
  var atm = searchResult[0].getValue(columnsSearch[2]);      
  var ta = atm;
    
 
        nlapiSubmitField('itemgroup',internalId2,'custitem_total_available',ta,true); 
        nlapiSubmitField('itemgroup',internalId2,'custitem_available_to_use',0,true); 
        nlapiSubmitField('itemgroup',internalId2,'custitem_available_to_make',atm,true); 
        nlapiSubmitField('itemgroup',internalId2,'custitem4',timeNow,true); 


}

}catch(e){
  nlapiLogExecution('ERROR', 'error: ','description: ' + e);
}
nlapiLogExecution('ERROR', 'finishGroup: ','group');

}

function returnTypeItem(type){
var retorno = '';

if(type == 'Assembly'){

  retorno = 'assemblyitem';
}else if(type == 'InvtPart'){

retorno = 'inventoryitem'
}
return retorno;
}
