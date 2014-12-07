//var searchResult = new nlapiSearchRecord(null, 230, filters, null);

 var jsonArray=[];  
 var jsonGroup = [];
      var procItems=[];

     var allResults = new nlapiSearchRecord(null, 233, null, null);

  for(var i = 0; i < allResults.length; i++) {

      var columnsSearch = allResults[i].getAllColumns();
      var name=allResults[i].getValue(columnsSearch[0]);          
    jsonGroup.push(name)

}

 var allResults = new nlapiSearchRecord(null, 230, null, null);
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

    jsonArray.push(json)

}

var timeNow = new Date();
timeNow = timeNow.toString();

function start(){

try{

  var allResults = [];
  var columns = [];
  var filters = [];
  var actualRecordId=nlapiGetRecordId();

  var actualRecord = nlapiLoadRecord('salesorder', actualRecordId);
  var counterItems = actualRecord.getLineItemCount('item');
  nlapiLogExecution('ERROR', 'actualRecordId','actualRecordId Script');

    
for (var x = 1; x <= counterItems; x++) {

      var typeItem = actualRecord.getLineItemValue('item', 'itemtype', x);  
      
    
      if(typeItem != 'EndGroup' && typeItem != 'Group'){
        var itemName = actualRecord.getLineItemText('item', 'item', x );
      } 


      if(itemName != '' && itemName){

      for (var xi = jsonArray.length-1; xi >=0; xi--) {
    
      if(jsonArray[xi].itemid==itemName || jsonArray[xi].memberitem==itemName || jsonArray[xi].memberitem2==itemName ){

      var componentName = jsonArray[xi].componentName;

      if(jsonArray[xi].sort==4){
        componentName = jsonArray[xi].itemid;
      }
          if(procItems.indexOf(componentName)==-1){
                      reviewSavedSearch(componentName);
                      procItems.push(componentName);
          } 
          
      }

      };
    }
     
  };



nlapiLogExecution('ERROR', 'Finish','Finish Script');

  }catch(e){
    nlapiLogExecution('ERROR', 'error',e);
  }

}


function reviewItems(itemname,typeItem){

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
      
      var mtype = allResults[i].getValue(columnsSearch[6]);
      var typeItem =returnTypeItem(mtype);

      if(typeItem == 'inventoryitem'){

          ta = parseInt(allResults[i].getValue(columnsSearch[4]).replace(",",""),10);
          if(ta<0)ta=0;
      }
     
      if(isNaN(atm))atm = 0;
      if(isNaN(atu))atu = 0;
      if(isNaN(ta))ta = 0;
      if(ta<0)ta=0;
      if(atu<0)atu=0;
      if(atm<0)atm=0;
  
        
        //nlapiLogExecution('ERROR', 'available on item search: ',totalAvailable); 

        nlapiSubmitField(typeItem,internalId,'custitem4',timeNow,true); 
        nlapiSubmitField(typeItem,internalId,'custitem_total_available',ta,true);
        nlapiSubmitField(typeItem,internalId,'custitem_available_to_make',atm,true); 
        nlapiSubmitField(typeItem,internalId,'custitem_available_to_use',atu,true); 


    };


}

}

function setTaInGroupitems(internalId2){

nlapiLogExecution('ERROR', 'start: ','setTaInGroupitems function');
try{


var filter = [];
filter.push(new nlobjSearchFilter('name', null, 'is', internalId2));

var searchResult = new nlapiSearchRecord(null, 223,filter,null);

if(searchResult && searchResult.length > 0){
       
      var columnsSearch = searchResult[0].getAllColumns();
     
      var atu = parseInt(searchResult[0].getValue(columnsSearch[4]).replace(",",""),10);      
      var ta = atu;
      if(ta<0)ta=0; 
      if(atu<0)atu=0; 
      //var atu = searchResult[0].getValue(columnsSearch[3]); 
    
     var internalId22 = searchResult[0].getValue(columnsSearch[1]);

        nlapiSubmitField('itemgroup',internalId22,'custitem_total_available',ta,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem_available_to_use',atu,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem_available_to_make',0,true); 
        nlapiSubmitField('itemgroup',internalId22,'custitem4',timeNow,true); 
   

}else {


var filter = [];
filter.push(new nlobjSearchFilter('name', null, 'is', internalId2));


var searchResult = new nlapiSearchRecord(null, 231,filter,null);

 if(searchResult && searchResult.length>0){

  var columnsSearch = searchResult[0].getAllColumns();
  var internalId22 = searchResult[0].getValue(columnsSearch[1]);
  var atm = searchResult[0].getValue(columnsSearch[2]);      
  var ta = searchResult[0].getValue(columnsSearch[5]);
  var atu = searchResult[0].getValue(columnsSearch[4]); 
   if(ta<0)ta=0; 
   if(atu<0)atu=0; 
    if(atm<0)atm=0; 
 
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

function returnTypeItem(type){
var retorno = '';

if(type == 'Assembly'){

  retorno = 'assemblyitem';
}else if(type == 'InvtPart'){

retorno = 'inventoryitem'
}
return retorno;
}


function reviewSavedSearch(itemName){


           for(var i = jsonArray.length-1; jsonArray && i >=0; i--) {

 
      if(jsonArray[i].itemid==itemName || jsonArray[i].memberitem==itemName || jsonArray[i].memberitem2==itemName ){
     
               var itemInternalId = jsonArray[i].internalid           
               var typeItem = jsonArray[i].itemtype
              
              if(jsonGroup.indexOf(itemName)>=0 || jsonArray[i].sort==4){

              if(procItems.indexOf(itemName)==-1){

               setTaInGroupitems(itemName);
               procItems.push(itemName);

                            }
                  if(jsonArray[i].memberitemName && procItems.indexOf(jsonArray[i].memberitemName)==-1){

                       setTaInGroupitems(jsonArray[i].memberitemName);
                       procItems.push(jsonArray[i].memberitem);
                      }

                     if(jsonArray[i].itemid && procItems.indexOf(jsonArray[i].itemid)==-1){
                     setTaInGroupitems(jsonArray[i].itemid);
                     procItems.push(jsonArray[i].itemid);
                     }

             }else{
              
                if(procItems.indexOf(itemName)==-1){

               reviewItems(itemName,typeItem);
               procItems.push(itemName);

                            }
                  if(jsonArray[i].memberitemName && procItems.indexOf(jsonArray[i].memberitemName)==-1){

                       reviewItems(jsonArray[i].memberitemName,typeItem);
                       procItems.push(jsonArray[i].memberitem);
                      }

                     if(jsonArray[i].itemid && procItems.indexOf(jsonArray[i].itemid)==-1){
                     reviewItems(jsonArray[i].itemid,typeItem);
                     procItems.push(jsonArray[i].itemid);
                     }

              }

         
            
       }


      }
}