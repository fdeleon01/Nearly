//var searchResult = new nlapiSearchRecord(null, 230, filters, null);

 

var timeNow = new Date();
timeNow = timeNow.toString();
var arrayGral = [];
function start(){

try{

  var allResults = [];
  var columns = [];
  var filters = [];
  var actualRecordId=nlapiGetRecordId();

  var actualRecord =nlapiLoadRecord('salesorder', actualRecordId, {recordmode: 'dynamic'});
  var counterItems = actualRecord.getLineItemCount('item');
  nlapiLogExecution('ERROR', 'Start','Start division qty');

    
for (var r = 1; r <= counterItems; r++) {

      var typeItem = actualRecord.getLineItemValue('item', 'itemtype', r);
      var itemid =   actualRecord.getLineItemValue('item', 'item', r);
      // typeItem != 'Group' 
      
 
      if(typeItem == 'Group'){
       
         var item = JSON.parse(nlapiLookupField(returnTypeItem(typeItem), itemid, 'custitem_json_related_items'));


     if(item.level == 3){
          var arrayToUpdated = [];

        for(var i = 0;i<item.members.length;i++){
            
            for(var x=0;x<item.members[i].members.length;x++){
                
                for(var z=0;z<item.members[i].members[x].members.length;z++){
                   
                  arrayToUpdated.push(item.members[i].members[x].members[z]);
                
               }
                  arrayToUpdated.push(item.members[i].members[x]);
             }
                  arrayToUpdated.push(item.members[i]);    
         

        }//end for 3 level items

  

      }else if(item.level == 2){
       var arrayToUpdated = [];
        for(var i = item.members.length -1;i >= 0;i--){
            
              if(item.members[i].members.length>=1){
            
                    for(var x = 0;x<item.members[i].members.length;x++){
                      
                        arrayToUpdated.push(item.members[i].members[x])
                    }
     
                    arrayToUpdated.push(item.members[i])
                }//end if

              }//end for
               
           }
              for (var i = 0; i < arrayToUpdated.length; i++) {        
                   reviewItems(arrayToUpdated[i].name,arrayToUpdated[i].type)
               };

               setTaInGroupitems(item.id);//setGroup
       }
       

     
  };//end for


     
  }catch(e){
    nlapiLogExecution('ERROR', 'error',e);
  }

}


function reviewItems(itemname,typeItem){
     
     if(arrayGral.indexOf(itemname)!=-1)return;
     arrayGral.push(itemname);
     var arrayItems = [];
     var filter = [];


     filter.push(new nlobjSearchFilter('itemid', null, 'is', itemname));
     
    
    var allResults = new nlapiSearchRecord(null, 117, filter, null);
  if(allResults && allResults.length>0){


  

    for(var i = 0; i < allResults.length; i++) {

       

      var columnsSearch = allResults[i].getAllColumns();
      var internalId = allResults[i].getValue(columnsSearch[1]);
      var nameParent = allResults[i].getValue(columnsSearch[0]);      
      var atu = parseInt(allResults[i].getValue(columnsSearch[4]).replace(",",""),10);
      var atm = parseInt(allResults[i].getValue(columnsSearch[3]).replace(",",""),10);

      var ta = parseInt(allResults[i].getValue(columnsSearch[2]).replace(",",""),10);
      //var mtype = allResults[i].getValue(columnsSearch[5]);      

      if(typeItem == 'inventoryitem'){

          ta = parseInt(allResults[i].getValue(columnsSearch[4]).replace(",",""),10);
          /*if(ta<0)ta=0;
          if(atu<0)atu=0;*/

      }
     
      if(isNaN(atm))atm = 0;
      if(isNaN(atu))atu = 0;
      if(isNaN(ta))ta = 0;
      
  
        
        //nlapiLogExecution('ERROR', 'available on item search: ',totalAvailable); 

        nlapiSubmitField(typeItem,internalId,'custitem4',timeNow,true); 
        if(ta != (atm+atu)){
          ta =( atm+atu);
        }
nlapiLogExecution('ERROR', 'ta---: ',ta);
        nlapiSubmitField(typeItem,internalId,'custitem_total_available',ta,true);
        nlapiSubmitField(typeItem,internalId,'custitem_available_to_make',atm,true); 
        nlapiSubmitField(typeItem,internalId,'custitem_available_to_use',atu,true); 


    };


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

  }else if(type == 'NonInvtPart'){
   retorno = 'noninventoryitem'

  }else if(type == 'Description'){
   retorno = 'descriptionitem'

  }else if(type == 'OthCharge'){
   retorno = 'otherchargeitem'

  }else if(type == 'Service'){
   retorno = 'serviceitem'

  }


  return retorno;
}

function setTaInGroupitems(internalId2){


try{


var filter = [];
filter.push(new nlobjSearchFilter('internalid', null, 'is', internalId2));

var searchResult = new nlapiSearchRecord(null, 223,filter,null);



if(searchResult.length > 0){
       
      var columnsSearch = searchResult[0].getAllColumns();
     
      var atu = parseInt(searchResult[0].getValue(columnsSearch[4]).replace(",",""));      
      var ta = atu;
      //var atu = searchResult[0].getValue(columnsSearch[3]); 
    nlapiLogExecution('ERROR', 'ta group---: ',ta);
        var internalId22 = searchResult[0].getValue(columnsSearch[1]);

        nlapiSubmitField('itemgroup',internalId22,'custitem_total_available',atu,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem_available_to_use',atu,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem_available_to_make',0,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem4',timeNow,true); 
   

}else {


var filter = [];
filter.push(new nlobjSearchFilter('internalid', null, 'is', internalId2));


var searchResult = new nlapiSearchRecord(null, 231,filter,null);
if(searchResult && searchResult.length > 0){



  var columnsSearch = searchResult[0].getAllColumns();
  var internalId22 = searchResult[0].getValue(columnsSearch[1]);
  var atm = searchResult[0].getValue(columnsSearch[2]);      
  var ta = searchResult[0].getValue(columnsSearch[5]);
  var atu = searchResult[0].getValue(columnsSearch[4]); 
    
 nlapiLogExecution('ERROR', 'ta group---: ',ta);
        nlapiSubmitField('itemgroup',internalId22,'custitem_total_available',ta,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem_available_to_use',atu,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem_available_to_make',atm,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem4',timeNow,true); 

    }
}

}catch(e){
  nlapiLogExecution('ERROR', 'error: ','description: ' + e);
}
nlapiLogExecution('ERROR', 'finishGroup: ','group');

}




