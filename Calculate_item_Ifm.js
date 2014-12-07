/******************** Start ************************
 * function name: saleOrderWeb
 * Date: 31-10-2013.
 * Comment: This function is for the sale order, is a user event for divide the quantity of item in group, prioriced the biggest first and successively
 * function name: biggestNumber
 * Date: 3-11-2013.
 * Comment: this function return the biggest number
 * function name: isAssembly
 * Date: 7-11-2013.
 * Comment:this function return if the item assembly conteins stock or no
 * function name: createRecord
 * Date: 14-11-2013.
 * Comment:this function create a record with number of sale order and set fields in record
 * function name: completePreMadeItems.
 * Date: 21-08-2014.
 * Comment: so the rule is : not enough stock or out of stock if the item is premade , assign all the qty to the MB and complete with eaches
 * FabianDe Leon
 *****************************************************/
 
var availableQuantity = '';
var ItemCaseNumber = '';
var totalAmazonBox = 0;
var compareAmazonBox = 0;
var amazonflagForDiscount = false;
var globalStatus = true;

function saleOrderWeb(type,record) {
nlapiLogExecution('debug', 'type', type);
    try {

        var filter = [];

        var actualRecordId=nlapiGetRecordId();
        var actualRecord = nlapiLoadRecord('salesorder', actualRecordId, {recordmode: 'dynamic'});
      
       
        var itemqty = actualRecord.getLineItemCount('item');
        var department = actualRecord.getFieldText('department');
        var amazonBox = 0;
        var stockTotal = 0;
        var counterSet = 0;
        var setingEa = false;
        var myQty2 = 0;
        var numberBigger = 0;
        var stockTotalForInhouse = 0;
        var walmartField = actualRecord.getFieldValue('shipaddress');
        var containsWalmart = (walmartField.indexOf('Walmart') != -1);
        var setingItem = false;
        var arrayItemsIndividuales = [];
        var aux = 0;
        var valueInAmazon = 0;        
        actualRecord.setFieldValue('custbody10','F');
     

         if(department.indexOf(':')!=-1){
           
           department = department.split(':');
           if(department[1].indexOf('Amazon')!=-1){
                department = 'Amazon';
           }else{
            department = department[0].trim();
           }
        }
        
         

        
        if (containsWalmart == true) {
            actualRecord.setFieldValue('custbody_tt_walmarts2loc', 1);

        } else {
            actualRecord.setFieldValue('custbody_tt_walmarts2loc', 2);
        }
        var containsWholesale = (department.indexOf('Wholesale') != -1);
        var soIsAmazon = (department.indexOf('Amazon') != -1);
        var soIsEcommerce = (department.indexOf('Ecommerce') != -1);
       


        var allowGeneralItem = true;


        try {
            for (var j = 0; j <= itemqty; j++) {
              
                var typeItem = actualRecord.getLineItemValue('item', 'itemtype', j + 1);
                var setingInEa = false;

                if (typeItem == 'Group') {
                    allowGeneralItem = false;
                } else {
                    if (typeItem == 'EndGroup') {
                        allowGeneralItem = true;
                    }
                }
               // nlapiLogExecution('debug', 'Details', 'current typeItem#:' + typeItem + ', allowGeneralItem :' + allowGeneralItem);

                if (typeItem == 'Group') {
                    groupitemFlag = 'Started';
                    allowGeneralItem = false;
                   
                    var myQty = parseInt(actualRecord.getLineItemValue('item', 'quantity', j + 1));
                    
                
                    myQty2 += myQty;

                    var parentId = actualRecord.getLineItemValue('item', 'item', j + 1);
                    var miId = parentId;
                    var myRecordParent = nlapiLoadRecord('itemgroup', parentId);
                    var parentName = myRecordParent.getFieldValue('itemid');

                   
                }
                
                if (typeItem != 'EndGroup' && typeItem != 'EndGroup'){// for set individual items.
                var objectIndividual = {};
                objectIndividual.qty = parseFloat(actualRecord.getLineItemValue('item', 'quantity', j + 1));
                objectIndividual.internalid = actualRecord.getLineItemValue('item', 'item', j + 1);
                arrayItemsIndividuales.push(objectIndividual);

                }


                if (actualRecord.getLineItemValue('item', 'units_display', j + 1)) {
                    try {
                        var num = parseFloat(actualRecord.getLineItemValue('item', 'units_display', j + 1).split('CS')[1]);
                    } catch (e) {
                    }
                    if (num) {
                        
                        numberBigger = num;
                        var myQtyCsrView = parseFloat(actualRecord.getLineItemValue('item', 'quantity', j + 1));
                        availableQuantity = parseFloat(actualRecord.getLineItemValue('item', 'quantityavailable', j + 1));
                        

                        var itemId = actualRecord.getLineItemValue('item', 'item', j + 1);
                        filter[0] = new nlobjSearchFilter('internalid', null, 'is', itemId);
                        var searchResult = new nlapiSearchRecord(null, 109, filter, null);
                    
                        var name = searchResult[0].getValue('name');
                        var internalid = searchResult[0].getValue('internalid');
                        var quantity = searchResult[0].getValue('custitem_total_available');
                        var ecommerce = searchResult[0].getValue('custitem_tt_ecombox');
                        var ecommerceShippable = searchResult[0].getValue('custitem_tt_ecomship');
                        var amazonship = searchResult[0].getValue('custitem_tt_amazonship');
                        var upcprint = searchResult[0].getValue('custitem_tt_upcprint');
                        var stockstatus = searchResult[0].getValue('custitem_tt_stockstatus');
                        var stockstatusmain = searchResult[0].getValue('custitem_tt_mainstatus');
                        var amazoncartoncount = searchResult[0].getValue('custitem_tt_amazoncartoncount');
                        var purchaiseCost = searchResult[0].getText('purchaseunit');
                        var purchaiseType = searchResult[0].getValue('cost');
                        //var itemDepartment = searchResult[0].getText('custitem2');
                        var myItemRecordDepartment = nlapiLoadRecord(searchResult[0].getRecordType(), internalid);
                        var itemDepartment =  myItemRecordDepartment.getFieldTexts('custitem2');
                        var myUpcprint = searchResult[0].getValue('custitem_tt_upcprint');
                        var width = searchResult[0].getValue('custitem_tt_width');
                       
                          
                        var weight = '';
                        var Item_weight = searchResult[0].getValue('weight');
                        var Item_saleunit = searchResult[0].getText('saleunit');
                        //nlapiLogExecution('debug', 'ItemSalesUnit:'+Item_saleunit, Item_saleunit.indexOf('C'));
                        if (Item_saleunit.indexOf('C') != -1) {

                            var caseNumber = parseInt(Item_saleunit.match(/[0-9]+/));
                            ItemCaseNumber = caseNumber;
                            //nlapiLogExecution('debug', 'CaseNumber From Match:'+caseNumber, (parseFloat(validate(Item_weight))*caseNumber).toFixed(0));
                            weight = (parseFloat(validate(Item_weight)) * caseNumber).toFixed(0);
                        } else {
                            weight = Item_weight;
                        }

                        var length = searchResult[0].getValue('custitem_tt_length');
                        var Height = searchResult[0].getValue('custitem_tt_height');


                        
                        myQty = parseFloat(myQty);
                        
                        if(isNaN(myQty))myQty = parseFloat(myQtyCsrView);

                        
                        var box = actualRecord.getLineItemValue('item', 'units_display', j + 1);
                        //nlapiLogExecution('debug', 'box', box);
                        var myPackage = 0;
                        
                     

                        var stockAvailavle = parseInt(quantity);
                        
                        //stockAvailavle = reviewQtyMcwos(quantity,actualRecordId);

                        var _myDepartment = itemDepartment;//defino el departamento del item
                        var isDepartment = (_myDepartment.indexOf(department) != -1);//pregunto si el item es del mismo departamento  que la so
                        var isAmazon = (department.indexOf('Amazon') != -1);
                        var itemIsAmazon = (_myDepartment.indexOf('Ecommerce : Amazon') != -1);
                        var isWhosale = (_myDepartment.indexOf('Wholesale') != -1);
                        var soIsAmazon = (department.indexOf('Amazon') != -1);
                        var soIsEcommerce = (department.indexOf('Ecommerce') != -1);
                        var soIsWholsale = (department.indexOf('Wholesale') != -1);
                        var ecommerce = (_myDepartment.indexOf('Ecommerce') != -1 );//pregunto si el item es wholesale o ecommerce

                        actualRecord.selectLineItem('item', j + 1);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_weight', weight);
                        actualRecord.commitLineItem('item');
                        actualRecord.selectLineItem('item', j + 1);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_width', width);
                        actualRecord.commitLineItem('item');
                        actualRecord.selectLineItem('item', j + 1);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_length', length);
                        actualRecord.commitLineItem('item');
                        actualRecord.selectLineItem('item', j + 1);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_height', Height);
                        actualRecord.commitLineItem('item');
                        actualRecord.selectLineItem('item', j + 1);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_soitem', parentName);
                        actualRecord.commitLineItem('item');
                        //nlapiLogExecution('ERROR','parentName',parentName);



                        try {
                            var myItemRecord = nlapiLoadRecord('assemblyitem', internalid);
                            var inHouse = myItemRecord.getFieldValue('custitem_itemtype');

                        } catch (e) {
                            var inHouse = 0;
                        }
                        if (inHouse == 1) {
                            stockTotalForInhouse += stockAvailavle;

                        }

                    

                        if (isNaN(stockAvailavle)) {
                            var stockAvailavle = 0;
                            stockTotal += stockAvailavle;
                        } else {
                            stockTotal += stockAvailavle;
                        }
                        actualRecord.selectLineItem('item', j + 1);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_solinenum', j + 1);
                        actualRecord.setCurrentLineItemValue('item', 'custcol2', '');//clean Amazon box before run the logic

                        var itemIndividual = loadItem(actualRecord.getLineItemValue('item', 'item', j + 1));        
                        var myItemElegible = itemIndividual.getFieldTexts('custitem2').indexOf(actualRecord.getFieldText('department'))!=-1;

                        if (!itemIsAmazon && soIsAmazon)//evalua si el item coincide con la so que ademas sea Amazon si no no se populan los campos.
                        {
                            if(!myItemElegible){
                                if(itemIndividual.getFieldTexts('custitem2').indexOf(department)==-1){
                                    stockAvailavle = 0;
                                }
                                
                            }
                            

                        }
                        if (!ecommerce && soIsEcommerce)//evalua si el item coincide con la so que ademas sea Amazon si no no se populan los campos.
                        {
                            if(!myItemElegible){
                                if(itemIndividual.getFieldTexts('custitem2').indexOf(department)==-1){
                                    stockAvailavle = 0;
                                }
                               
                            }

                        }


                        /*************************************/
                       // nlapiLogExecution('debug', 'case #1 :', 'isWhosale :' + isWhosale + ', soIsWholsale:' + soIsWholsale + ', inHouse :' + inHouse);
                        if (!isWhosale && soIsWholsale && inHouse != 1) {//caso que no hay stock de EB ni MB, pregunto por el length por que ya se setearon todos los valores, entonces no tengo stock de nada y veo si meto un ib en el stock, detecte el problema de que si la orden no es wholsale no entra preguntar en este caso.
                            //nlapiLogExecution('debug', 'enter to ', 'case 1');

                         
                            actualRecord.setCurrentLineItemValue('item', 'quantity', 0);
                              
                            actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Eligible");
                            actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                            actualRecord.setCurrentLineItemValue('item', 'custcol2', '');
                            actualRecord.commitLineItem('item');
                            setingInEa = true;

                            if (stockAvailavle != 0) {
                                if (myQty < stockAvailavle) {
                                    if(myQty != 0) {
                                        myQty--;
                                        myPackage++;
                                    }
                                }


                                stockAvailavle = 0;
                            }
                        }
                      //  nlapiLogExecution('debug', 'case #2 :', 'isWhosale :' + isWhosale + ', soIsWholsale:' + soIsWholsale + ', inHouse :' + inHouse);
                        if (!isWhosale && soIsWholsale && inHouse == 1) {
                            nlapiLogExecution('debug', 'enter to case2', '');
                            stockAvailavle = 0;
                        }
                        nlapiLogExecution('debug', 'case #3 ', 'stockAvailavle :' + stockAvailavle + ',numberBigger :' + numberBigger);


                        ///****** Code to evalulate item is Amazon or Not**********//
                        var amazonFlag = false;
                       // nlapiLogExecution('debug', 'itemIsAmazon :' + itemIsAmazon + ',soIsAmazon :' + soIsAmazon, 'allowGeneralItem :' + allowGeneralItem);
                        if (!itemIsAmazon && soIsAmazon && allowGeneralItem == false) {
                            if (thisParntItem.MBID == internalid || thisParntItem.IBID == internalid) {
                                stockAvailavle = 0;
                                amazonFlag = true;
                                nlapiLogExecution('debug', 'stock value changed by Zero');
                            }

                        }
                       // nlapiLogExecution('debug', 'amazonFlag :' + amazonFlag, 'stockAvailavle :' + stockAvailavle);
                        //*********End code *******************/////

                        if (stockAvailavle >= numberBigger) {
                            nlapiLogExecution('debug', 'enter to case 3', '');

                            nlapiLogExecution('debug', 'case #3.1 ', 'myQty :' + myQty + ',numberBigger :' + numberBigger + ',stockAvailavle :' + stockAvailavle);
                            if (myQty >= numberBigger && stockAvailavle >= myQty) {//aca esta todo ok se puede descontar de las cantidades y mostrar el resultado
                                nlapiLogExecution('debug', 'enter to case 3.1', '');
                                if (myQty >= numberBigger && stockAvailavle >= numberBigger) {
                                        myPackage = Math.floor(myQty / numberBigger);
                                        myQty = myQty - Math.floor(myPackage * numberBigger);
                                }
                                actualRecord.setCurrentLineItemValue('item','quantity',myPackage);
                               
                                nlapiLogExecution('debug', 'InStock Here 3', 'mypackage :' + myPackage + ',myQty :' + myQty);
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "In Stock");
                                actualRecord.setCurrentLineItemValue('item', 'custcolupcrinting', myUpcprint);
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                actualRecord.setCurrentLineItemValue('item', 'custcol2', '');

                                if (soIsAmazon && amazonflagForDiscount) {
                                    
                                    amazonBox = amazonBox + myPackage;
                                    actualRecord.setFieldValue('custbody_so_amazontotalcarton', amazonBox);
                                    if (valueInAmazon == 0) {
                                        valueInAmazon = 1;
                                        aux = amazonBox;
                                        actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                        nlapiLogExecution('debug', 'ama1.1 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                    } else if (valueInAmazon > 0) {
                                        valueInAmazon = aux + 1;
                                        aux = amazonBox;
                                        actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                        nlapiLogExecution('debug', 'ama1.2 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                    }
                                } else {
                                    actualRecord.setFieldValue('custbody_so_amazontotalcarton', '');
                                }
                                actualRecord.commitLineItem('item');

                            } else if (myQty >= numberBigger && stockAvailavle < myQty && inHouse != 1) {
                               // nlapiLogExecution('debug', 'enter to case 3.2', '');
                                if(myQty >= numberBigger && stockAvailavle >= numberBigger) {
                        
                                    myPackage = Math.floor(stockAvailavle / numberBigger);
                                    myQty = myQty - (myPackage * numberBigger)
                                }
                                // actualRecord.setCurrentLineItemValue('item','quantity',myPackage);
                               
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Enough Stock");
                                actualRecord.setCurrentLineItemValue('item', 'custcolupcrinting', myUpcprint);
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                actualRecord.setCurrentLineItemValue('item', 'custcol2', '');

                                if (soIsAmazon && amazonflagForDiscount) {
                                    //nlapiLogExecution('debug', 'ama2- soIsAmazon :' + soIsAmazon);
                                    amazonBox = amazonBox + myPackage;
                                    actualRecord.setFieldValue('custbody_so_amazontotalcarton', amazonBox);
                                    if (valueInAmazon == 0) {
                                        valueInAmazon = 1;
                                        aux = amazonBox;
                                        actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                       // nlapiLogExecution('debug', 'ama2.1 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                    } else if (valueInAmazon > 0) {
                                        valueInAmazon = aux + 1;
                                        aux = amazonBox;
                                        actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                       // nlapiLogExecution('debug', 'ama2.2 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                    }
                                } else {
                                    actualRecord.setFieldValue('custbody_so_amazontotalcarton', '');
                                }
                                actualRecord.commitLineItem('item');

                            } else if (myQty >= numberBigger && stockAvailavle < myQty && inHouse == 1) {
                               // nlapiLogExecution('debug', 'enter to case 3.3', '');


                                while (myQty >= numberBigger && stockAvailavle >= numberBigger) {
                                    stockAvailavle = stockAvailavle - numberBigger;
                                    myQty = myQty - numberBigger;
                                    myPackage++
                                }//aca cambiar

                                if (myPackage > 0 && myQty != 0) {
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Enough Stock");
                                } else if (myPackage > 0 && myQty == 0) {
                                  //  nlapiLogExecution('debug', 'InStock Here 4', 'mypackage :' + myPackage + ',myQty :' + myQty);
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "In Stock");
                                } else if (myPackage == 0) {
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Out of Stock");
                                }

                                if (soIsAmazon && amazonflagForDiscount) {
                                    amazonBox = amazonBox + myPackage;
                                    actualRecord.setFieldValue('custbody_so_amazontotalcarton', amazonBox);
                                    if (valueInAmazon == 0) {
                                        valueInAmazon = 1;
                                        aux = amazonBox;
                                        actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                        //nlapiLogExecution('debug', 'ama3.1 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                    } else if (valueInAmazon > 0) {
                                        valueInAmazon = aux + 1;
                                        aux = amazonBox;
                                        actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                       // nlapiLogExecution('debug', 'ama3.2 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                    }
                                } else {
                                    actualRecord.setFieldValue('custbody_so_amazontotalcarton', '');
                                }

                                setingItem = true;
                                // actualRecord.setCurrentLineItemValue('item','quantity',myPackage);
                                if (allowGeneralItem == false) {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', myPackage.toFixed());
                                } else {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCsrView);
                                }
                                actualRecord.setCurrentLineItemValue('item', 'custcolupcrinting', myUpcprint);
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                actualRecord.commitLineItem('item');


                            } else if (myQty < numberBigger && stockAvailavle > myQty) {
                               // nlapiLogExecution('debug', 'Came to @2', 'myQty :' + myQty + ',numberBigger :' + numberBigger + ',stockAvailavle:' + stockAvailavle + ',Internal Id Item:' + internalid);
                                if (allowGeneralItem == false) {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', 0);
                                } else {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCsrView);
                                }
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                //nlapiLogExecution('debug', 'InStock Here 5', 'mypackage :' + myPackage + ',myQty :' + myQty);
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "In Stock");
                                actualRecord.setCurrentLineItemValue('item', 'custcol2', '');
                                actualRecord.commitLineItem('item');
                                counterSet++;
                            } else if (myQty < numberBigger && stockAvailavle < myQty) {
                               // nlapiLogExecution('debug', 'Came to @3', 'myQty :' + myQty + ',numberBigger :' + numberBigger + ',stockAvailavle:' + stockAvailavle + ',Internal Id Item:' + internalid);
                                if (allowGeneralItem == false) {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', 0);
                                } else {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCsrView);
                                }
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Out of Stock");
                                actualRecord.setCurrentLineItemValue('item', 'custcol2', '');
                                actualRecord.commitLineItem('item');
                                counterSet++;
                            }
                        } else if (stockAvailavle != 0 && stockAvailavle < numberBigger)//el stock es diferente de cero pero no me da para competar la orden muestro el mensaje y completo el pedido con el stock que tenga
                        {
                            //nlapiLogExecution('debug', 'case #4 :', 'stockAvailavle :' + stockAvailavle + ',numberBigger:' + numberBigger);

                            while (myQty >= numberBigger && stockAvailavle != 0) {
                                stockAvailavle--;
                                myQty = myQty - numberBigger;
                                myPackage++;
                               
                            }
                            // actualRecord.setCurrentLineItemValue('item','quantity',myPackage);
                            if (allowGeneralItem == false) {
                                actualRecord.setCurrentLineItemValue('item', 'quantity', myPackage.toFixed());
                            } else {
                                actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCsrView);
                            }
                            actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                            actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Enough Stock");
                            actualRecord.setCurrentLineItemValue('item', 'custcol2', '');
                            actualRecord.setCurrentLineItemValue('item', 'custcolupcrinting', myUpcprint);
                            if (soIsAmazon && amazonflagForDiscount) {
                                amazonBox = amazonBox + myPackage;
                                actualRecord.setFieldValue('custbody_so_amazontotalcarton', amazonBox);
                                if (valueInAmazon == 0) {
                                    valueInAmazon = 1;
                                    aux = amazonBox;
                                    actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                    nlapiLogExecution('debug', 'ama4.0 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                } else if (valueInAmazon > 0) {
                                    valueInAmazon = aux + 1;
                                    aux = amazonBox;
                                    actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                  //  nlapiLogExecution('debug', 'ama4.1 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                }
                            } else {
                                actualRecord.setFieldValue('custbody_so_amazontotalcarton', '');
                            }
                            actualRecord.commitLineItem('item');
                        } else if (amazonFlag == true) {

                           // nlapiLogExecution('debug', 'values are committed here');
                            actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Eligible");
                            actualRecord.setCurrentLineItemValue('item', 'quantity', '0');
                            actualRecord.setFieldValue('custbody_so_amazontotalcarton', '');
                            actualRecord.commitLineItem('item');

                            ////////////////End of Code ////////////////////////
                        } else if (stockAvailavle === 0 && setingInEa == false) {//me fijo si no hay stock si puedo armar un miembro
                            nlapiLogExecution('debug', 'Case #5', 'stockAvailavle :' + stockAvailavle + ',setingInEa : ' + setingInEa);
                            try {
                                //var itemComponent = nlapiLoadRecord('assemblyitem',internalid);


                                ///****** Code to evalulate item is Amazon or Not**********//
                                if (!itemIsAmazon && soIsAmazon && allowGeneralItem == false) {
                                    if (thisParntItem.MBID == internalid || thisParntItem.IBID == internalid) {
                                        stockAvailavle = 0;
                                        nlapiLogExecution('debug', 'stock value changed by Zero');
                                    }

                                }


                                if (isNaN(stockAvailavle)) {
                                    stockAvailavle = 0;
                                }
                                
                               
                            } catch (e) {
                                nlapiLogExecution('ERROR','TYPE',e);
                            }
                            if (stockAvailavle >= myQty) {//aca esta todo ok se puede descontar de las cantidades y mostrar el resultado
                               // nlapiLogExecution('debug', 'case #6', 'stockAvailavle :' + stockAvailavle + ', myQty:' + myQty);
                                while (myQty >= numberBigger && stockAvailavle >= numberBigger) {
                                    stockAvailavle = stockAvailavle - numberBigger;
                                    myQty = myQty - numberBigger;
                                    myPackage++
                                }
                                if (myPackage > 0) {
                                  //  nlapiLogExecution('debug', 'InStock Here 6', 'mypackage :' + myPackage + ',myQty :' + myQty);
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "In Stock");

                                    actualRecord.setCurrentLineItemValue('item', 'custcol2', '');
                                } 
                                //  actualRecord.setCurrentLineItemValue('item','quantity',myPackage);
                                if (allowGeneralItem == false) {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', myPackage.toFixed());
                                } else {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCsrView);
                                }
                                actualRecord.setCurrentLineItemValue('item', 'custcolupcrinting', myUpcprint);
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                if (soIsAmazon && amazonflagForDiscount) {
                                    amazonBox = amazonBox + myPackage;
                                    actualRecord.setFieldValue('custbody_so_amazontotalcarton', amazonBox);
                                    if (valueInAmazon == 0) {
                                        valueInAmazon = 1;
                                        aux = amazonBox;
                                        actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                     //   nlapiLogExecution('debug', 'ama5.0 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                    } else if (valueInAmazon > 0) {
                                        valueInAmazon = aux + 1;
                                        aux = amazonBox;
                                        actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                     //   nlapiLogExecution('debug', 'ama5.1 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                    }
                                } else {
                                    actualRecord.setFieldValue('custbody_so_amazontotalcarton', '');
                                }
                                actualRecord.commitLineItem('item');
                            } else if (stockAvailavle < myQty && !soIsWholsale) {
                               // nlapiLogExecution('debug', 'case #7', 'stockAvailavle :' + stockAvailavle + ', myQty:' + myQty + ',soIsWholsale :' + soIsWholsale);


                                /**********end************/

                              
                                if (stockAvailavle == 0) {
                                   // nlapiLogExecution('debug', 'Came to  @4', 'stockAvailavle :' + stockAvailavle);
                                    //if (allowGeneralItem ==false) {
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', 0);
                                    /*}else{
                                     actualRecord.setCurrentLineItemValue('item','quantity',myQtyCsrView);
                                     }*/

                                    actualRecord.setCurrentLineItemValue('item', 'custcol2', '');

            

                                    actualRecord.setCurrentLineItemValue('item', 'custcolupcrinting', myUpcprint);
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                    actualRecord.commitLineItem('item');
                                } else if (stockAvailavle > 0) {
                                    while (myQty >= numberBigger && stockAvailavle >= numberBigger) {
                                           
                                         myPackage = Math.floor(myQty / numberBigger); 
                                         myQty = myQty - Math.floor(myPackage * numberBigger);   

                                         stockAvailavle = Math.floor(myPackage * numberBigger);
                                        
                                        //myQty = myQty - numberBigger;
                                        //myPackage++
                                    }
                                    if (soIsAmazon && amazonflagForDiscount) {
                                        amazonBox = amazonBox + myPackage;
                                        actualRecord.setFieldValue('custbody_so_amazontotalcarton', amazonBox);
                                        if (valueInAmazon == 0) {
                                            valueInAmazon = 1;
                                            aux = amazonBox;
                                            actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                            nlapiLogExecution('debug', 'ama8.1 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                        } else if (valueInAmazon > 0) {
                                            valueInAmazon = aux + 1;
                                            aux = amazonBox;
                                            actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                            nlapiLogExecution('debug', 'ama8.2 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                        }
                                    } else {
                                        actualRecord.setFieldValue('custbody_so_amazontotalcarton', '');
                                    }
                                    if (soIsAmazon && amazonflagForDiscount) {
                                        amazonBox = amazonBox + myPackage;
                                        actualRecord.setFieldValue('custbody_so_amazontotalcarton', amazonBox);
                                        if (valueInAmazon == 0) {
                                            valueInAmazon = 1;
                                            aux = amazonBox;
                                            actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                            nlapiLogExecution('debug', 'ama9.0 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                        } else if (valueInAmazon > 0) {
                                            valueInAmazon = aux + 1;
                                            aux = amazonBox;
                                            actualRecord.setCurrentLineItemValue('item', 'custcol2', valueInAmazon + '-' + amazonBox);
                                            nlapiLogExecution('debug', 'ama9.1 - values :', 'valueInAmazon :' + valueInAmazon + ',amazonBox :' + amazonBox);
                                        }
                                    }

                                    //actualRecord.setCurrentLineItemValue('item','quantity',myPackage);
                                    
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                    actualRecord.commitLineItem('item');
                                }
                            } else if (stockAvailavle < myQty) {
                                if (stockAvailavle == 0 && setingInEa == false) {
                                   // nlapiLogExecution('debug', 'Came to @5', 'stockAvailavle :' + stockAvailavle);
                                    if (allowGeneralItem == false) {
                                        actualRecord.setCurrentLineItemValue('item', 'quantity', 0);
                                    } else {
                                        actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCsrView);
                                    }                      

                                    actualRecord.setCurrentLineItemValue('item', 'custcol2', '');
                                    actualRecord.setCurrentLineItemValue('item', 'custcolupcrinting', myUpcprint);
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                    actualRecord.commitLineItem('item');
                                } else if (stockAvailavle != 0 && setingInEa == false) {
                                    while (myQty >= numberBigger && stockAvailavle >= numberBigger) {
                                        stockAvailavle = stockAvailavle - numberBigger;
                                        myQty = myQty - numberBigger;
                                        myPackage++
                                    }
                                    if (myQty == 0) {
                                      //  nlapiLogExecution('debug', 'InStock Here 7', 'mypackage :' + myPackage + ',myQty :' + myQty);
                                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "In Stock");
                                    }
                                    if (myQty > 0) {
                                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Enough Stock");

                                    }
                                    actualRecord.setCurrentLineItemValue('item', 'custcol2', '');

                                    //actualRecord.setCurrentLineItemValue('item','quantity',myPackage);
                                    if (allowGeneralItem == false) {
                                        actualRecord.setCurrentLineItemValue('item', 'quantity', myPackage.toFixed());
                                    } else {
                                        actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCsrView);
                                    }
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_qtyperbox', numberBigger);
                                    actualRecord.commitLineItem('item');
                                }
                            }
                        }
                    }
            
                }

            }
        } catch (e) {
            nlapiLogExecution('debug', 'error here', e);
        }

        /****this section is for main status and substatus*********/
        var qtyCompare = 0;
        for (var i = 1; i <= itemqty; i++) {
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', i);
            if (typeItem != 'Group') {
                try {
                    var num = parseFloat(actualRecord.getLineItemValue('item', 'units_display', i).split('CS')[1]);
                } catch (e) {
                }
                var ea = actualRecord.getLineItemValue('item', 'units_display', i);
                if (ea == 'EA' || setingEa == true) {
                    num = 1;
                }
                if (!isNaN(num)) {
                    var qtyInItem = parseFloat(actualRecord.getLineItemValue('item', 'quantity', i));
                    if (!isNaN(qtyInItem)) {
                        qtyInItem = qtyInItem * num;
                        qtyCompare += qtyInItem;

                    }
                }
            }
        }
        

        /**************end**************/
        /**************start****************/
        if (actualRecord.getFieldText('department') != 'Wholesale') {
            nlapiLogExecution('error', 'SO Closed2', 'done');
            for (var y = 0; y <= actualRecord.getLineItemCount('item'); y++) {//this section is for remove EA in sales order is not is whosale
                var units = actualRecord.getLineItemValue('item', 'units_display', y + 1);
                if (units) {
                    if (units.toUpperCase() == 'EA') {
                        nlapiLogExecution('error', 'close', 'yes');
                        actualRecord.setLineItemValue('item', 'isclosed', y + 1, 'T');

                    }
                }

            }

        }


        /*************************end***********************************/
        /***********start************/

        for (var i = 1; i <= itemqty; i++) {
            var numberLineInParen = i;
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', i);
            if (typeItem == 'Group') {
                var qtyGroup = parseInt(actualRecord.getLineItemValue('item', 'quantity', i));
                
    

                var internalidItem = actualRecord.getLineItemValue('item', 'item', i);
                var myItemRecordParent = nlapiLoadRecord('itemgroup', internalidItem);
               

                var myQtyCompare = parseInt(myItemRecordParent.getFieldValue("custitem_total_available"));
                 
                 

 

                nlapiLogExecution('DEBUG', 'myQtyCompare: --------------- ', myQtyCompare);
                nlapiLogExecution('DEBUG', 'qtyGroup: --------------- ', qtyGroup);

                if (isNaN(myQtyCompare)) myQtyCompare = 0;

                  var preMade = actualRecord.getLineItemText('item', 'custcol_item_type',i);
                   

                if (qtyGroup <= myQtyCompare) {
                    var message = "In Stock";
                    closeItems(internalidItem,itemqty,actualRecord,message);
                    
                    if(preMade == 'Pre-Made' && soIsWholsale){completePreMadeItems(internalidItem,itemqty,actualRecord,qtyGroup,message)}
                    if(soIsWholsale && preMade != 'Pre-Made' ){completeinHouse(internalidItem,itemqty,actualRecord,qtyGroup,message)};
                    if(!soIsWholsale){completeStatusOnColumns(internalidItem,itemqty,actualRecord,qtyGroup,message)}
                    
                    actualRecord.selectLineItem('item', i);
                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "In Stock");
                    actualRecord.setCurrentLineItemValue('item', 'custcol5', "T");                    
                    actualRecord.commitLineItem('item');
                    //consumptionOnTaGroup(internalidItem,qtyGroup,itemqty,actualRecord);

                    
                } else if (qtyGroup > myQtyCompare && myQtyCompare > 0) {
                        var message = "Not Enough Stock";
                        closeItems(internalidItem,itemqty,actualRecord,message);
                        //completePreMadeItems(internalidItem,itemqty,actualRecord,qtyGroup,message);                        
                        //if(soIsWholsale) {completePreMadeItems(internalidItem,itemqty,actualRecord,qtyGroup,message)};
                        itemWithOutStock(internalidItem,itemqty,actualRecord,qtyGroup,message);
                        
                        actualRecord.selectLineItem('item', i);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Enough Stock");
                        actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                        actualRecord.commitLineItem('item');
                        //consumptionOnTaGroup(internalidItem,qtyGroup,itemqty,actualRecord);
                        globalStatus = false;
                        

                } else if (myQtyCompare <= 0) {
                        var message = "Out Stock";
                         closeItems(internalidItem,itemqty,actualRecord,message);
                        //if(soIsWholsale) {completePreMadeItems(internalidItem,itemqty,actualRecord,qtyGroup,message)};
                        itemWithOutStock(internalidItem,itemqty,actualRecord,qtyGroup,message);

                        actualRecord.selectLineItem('item', i);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Out Stock");
                        actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                        actualRecord.commitLineItem('item');
                        globalStatus = false;
                        //consumptionOnTaGroup(internalidItem,qtyGroup,itemqty,actualRecord);

                       

                }

            }
            if (typeItem != 'Group' && typeItem != 'EndGroup') {
                var myIdIndividual = actualRecord.getLineItemValue('item', 'item', i);
                var itemIndividual = loadItem(actualRecord.getLineItemValue('item', 'item', i));  
                var myItemElegible = checkIsElegible(actualRecord.getFieldText('department'),itemIndividual.getFieldTexts('custitem2'))     
                var quantityavailableInItem = parseFloat(itemIndividual.getFieldValue('custitem_total_available'));  

                  

 

                //quantityavailableInItem = reviewQtyMcwos(quantityavailableInItem,actualRecordId);        
                var qtyInMyItem = parseFloat(actualRecord.getLineItemValue('item', 'quantity', i));

                 


                var isclosedItem = actualRecord.getLineItemValue('item', 'custcol5', i); 

            

                if(!myItemElegible && qtyGroup <= myQtyCompare && isclosedItem == 'T' ){
                    actualRecord.selectLineItem('item', i);
                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Eligible");
                    actualRecord.commitLineItem('item');

                }else if(quantityavailableInItem >= qtyInMyItem && quantityavailableInItem != 0 && isclosedItem != 'T') {
                    if(myItemElegible){
                        actualRecord.selectLineItem('item', i);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "In Stock");
                        actualRecord.commitLineItem('item');
                    }else{
                        actualRecord.selectLineItem('item', i);
                        actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Elegible");
                        actualRecord.commitLineItem('item');
                    }
                   
                } else if (quantityavailableInItem < qtyInMyItem && quantityavailableInItem > 0 && isclosedItem != 'T') {
                    actualRecord.selectLineItem('item', i);
                    var cantidad = individualItemStock(arrayItemsIndividuales,myIdIndividual);
                    actualRecord.setCurrentLineItemValue('item', 'quantity', cantidad.toFixed());
                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Not Enough Stock");
                    actualRecord.commitLineItem('item');

                } else if (quantityavailableInItem <= 0 && isclosedItem != 'T') {
                    actualRecord.selectLineItem('item', i);
                    var cantidad = individualItemStock(arrayItemsIndividuales,myIdIndividual);
                    actualRecord.setCurrentLineItemValue('item', 'quantity', cantidad.toFixed());
                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', "Out Stock");
                    actualRecord.commitLineItem('item');

                }

                

           
            }

        }
      
        

        //****** Status Fields ***********///
        var instock = true;

        try {
            if(soIsAmazon && totalAmazonBox > 0){actualRecord.setFieldValue('custbody_so_amazontotalcarton', totalAmazonBox)} 
            if(globalStatus){actualRecord.setFieldValue('custbody_orderstatus',1)} 
            if(!globalStatus){actualRecord.setFieldValue('custbody_orderstatus',2)}            
            
            nlapiSubmitRecord(actualRecord, true, true);

            
        } catch (e) {
            nlapiLogExecution('error', 'function', e);

        }
    } catch (e) {
        nlapiSubmitField('salesorder', actualRecordId, 'custbody10', 'T');
        nlapiLogExecution('error', 'error------', e);
    }

}

function biggestNumber(numeros) {
    for (var i = 0; i < numeros.length; i++) {
        var numeroa = numeros[0];
        var numerob = numeros[i];
        if (numeroa > numerob) {
            aux = numeroa;
        } else {
            aux = numerob;
        }
    }

// this section remove the number higher from array
    for (var i = numeros.length - 1; i >= 0; i--) {
        if (numeros[i] === aux) {
            numeros.splice(i, 1);
            break;
        }
    }
    return aux;
}


function validate(num) {
    var value = num;
    if (!value) {
        value = 0;
    }
    return value;
}


function itemWithOutStock(internalidItem,itemqty,actualRecord,myQtyCompare,message){
        nlapiLogExecution('ERROR','TESTTT',myQtyCompare);
        var flagSet = true;
        var parentFind = false;
        for (var j = 1; j <= itemqty; j++) {             
            
            var myPackage = 0;    
            var itemIdCompare = actualRecord.getLineItemValue('item', 'item', j);
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', j);
            
            if(internalidItem == itemIdCompare ){

               var parentRecord = nlapiLoadRecord('itemgroup', actualRecord.getLineItemValue('item', 'item', j));
               parentFind = true;
               var lineNumParent = j;
               actualRecord.selectLineItem('item', lineNumParent); 
               actualRecord.setCurrentLineItemValue('item','custcol_ifm_error',''); 
               actualRecord.commitLineItem('item'); 
                  
             }   
            if (actualRecord.getLineItemValue('item', 'units_display', j) && parentFind) {
                  
                var numberBigger = parseFloat(actualRecord.getLineItemValue('item', 'units_display', j).split('CS')[1]);
                if(parentFind && !flagSet){
                                actualRecord.selectLineItem('item', j); 
                                actualRecord.setCurrentLineItemValue('item', 'custcol2', '');
                                actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCompare.toFixed());
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', message);
                                actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                                actualRecord.commitLineItem('item');


                }
                 if(numberBigger){
                                flagSet = false;   
                                if(myQtyCompare >= numberBigger) {                                   
                                    myPackage = Math.floor(myQtyCompare / numberBigger); 
                                    myQtyCompare = myQtyCompare - Math.floor(myPackage * numberBigger);
                                }

                                
                                actualRecord.selectLineItem('item', j); 
                                actualRecord.setCurrentLineItemValue('item', 'quantity', myPackage.toFixed());
                                actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', message);
                                actualRecord.commitLineItem('item');

                                if(myQtyCompare > 0){
                                    actualRecord.selectNewLineItem('item');
                                    actualRecord.setCurrentLineItemValue('item', 'item', actualRecord.getLineItemValue('item', 'item', j));
                                    actualRecord.setCurrentLineItemValue('item', 'quantity', myQtyCompare.toFixed());
                                    actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', message);
                                    actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                                    actualRecord.setCurrentLineItemValue('item', 'units', 1);                                    
                                    actualRecord.commitLineItem('item');                            
                                    myQtyCompare = 0;
                                }
                         

                        }
                
                              
  
                }else if(typeItem == 'EndGroup' && !flagSet){//return the for not set any item more
                          return;
                }


                    
    }
}

function completePreMadeItems(internalidItem,itemqty,actualRecord,qtyGroup,message){

 var flagSet = true;
 var parentFind = false;
 var totalToCompare = 0;
 var finish = true;
 var retornoFor = false;
 var myPackage = 0;
 var arrayItemsToCompare = [];
 var allNotElegible = true;

        for (var j = 1; j <= itemqty  && !retornoFor; j++) {             
            
            var myPackage = 0;    
            var itemIdCompare = actualRecord.getLineItemValue('item', 'item', j);
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', j);
            
            if(internalidItem == itemIdCompare ){

               var parentRecord = nlapiLoadRecord('itemgroup', actualRecord.getLineItemValue('item', 'item', j));
               parentFind = true;
               var lineNumParent = j;
               actualRecord.selectLineItem('item', lineNumParent); 
               actualRecord.setCurrentLineItemValue('item','custcol_ifm_error',''); 
               actualRecord.commitLineItem('item'); 
                  
             }   
              if (actualRecord.getLineItemValue('item', 'units_display', j) && parentFind) {

                  var multiPlo = parseFloat(actualRecord.getLineItemValue('item', 'units_display', j).split('CS')[1]);

                

                  var qty = parseInt(actualRecord.getLineItemValue('item', 'quantity', j));
                  
                 
                   


                  var myMessage = actualRecord.getLineItemValue('item', 'custcol_tt_igstatus', j);
                  var itemRecord = loadItem(actualRecord.getLineItemValue('item', 'item', j));
                  var stockAvailableOnItem = parseFloat(itemRecord.getFieldValue('custitem_total_available'));
                  var myItemObject = {};
                  myItemObject.stock = stockAvailableOnItem;
                  myItemObject.lineNum = j;
                  myItemObject.internalid = actualRecord.getLineItemValue('item', 'item', j);
                  myItemObject.name = actualRecord.getLineItemText('item', 'item', j);


                  if(myMessage == 'Not Eligible'){
                     

                     var remaindertoNeed = parseFloat(qtyGroup - totalToCompare);
                         if(arrayItemsToCompare.length >=1 ){

                            if(parseFloat(arrayItemsToCompare[0].available) > 0  &&  parseFloat(arrayItemsToCompare[0].available) < parseFloat(remaindertoNeed)){
                                var needItems = (parseFloat(remaindertoNeed) - parseFloat(arrayItemsToCompare[0].available));
                            
                                 if(needItems > 0 && myItemObject.stock >= needItems){

                                      myPackage = Math.floor(needItems / multiPlo);                                    
                                      remaindertoNeed = remaindertoNeed - myPackage;                                      

                                  }else if(myItemObject.stock < needItems && myItemObject.stock > 0 && needItems > 0){
                                           myPackage = Math.floor(myItemObject.stock / multiPlo);                                    
                                           remaindertoNeed = remaindertoNeed - myPackage;          
                                  }
    
    
                                   
                                     actualRecord.selectLineItem('item', j);  
                                     actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                                     actualRecord.setCurrentLineItemValue('item', 'quantity', myPackage.toFixed());
                                     actualRecord.commitLineItem('item'); 
                                     qty = myPackage;
                              
                              }else if(parseFloat(arrayItemsToCompare[0].available) >= parseFloat(remaindertoNeed)){
                                      qty = 0;


                              }else if(parseFloat(myItemObject.stock) > 0 ){
                                       
                                      if(parseFloat(myItemObject.stock) >= parseFloat(remaindertoNeed)){
                                          myPackage = Math.floor(remaindertoNeed / multiPlo);                                    
                                          remaindertoNeed = remaindertoNeed - myPackage;   

                                      }else if(parseFloat(myItemObject.stock) < parseFloat(remaindertoNeed) && parseFloat(myItemObject.stock) >= multiPlo){
                                             
                                               myPackage = Math.floor(myItemObject.stock / multiPlo);                                    
                                               remaindertoNeed = remaindertoNeed - myPackage;   
                                      }

                                     actualRecord.selectLineItem('item', j);  
                                     actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                                     actualRecord.setCurrentLineItemValue('item', 'quantity', myPackage.toFixed());
                                     actualRecord.commitLineItem('item'); 
                                     qty = myPackage;

                                     
                              }
    
                              
                            }

                         }else{

                            allNotElegible = false;
                         }

                  
                  myItemObject.unit = multiPlo;
                  myItemObject.available = stockAvailableOnItem - (qty * multiPlo);
                  arrayItemsToCompare.push(myItemObject);  
                  totalToCompare += (qty*multiPlo);
                  finish = false;
              }else if(typeItem == 'EndGroup' && !finish){
                       if(allNotElegible){
                          setColumnStatusAllNotElegible(actualRecord,lineNumParent);
                       }
                       retornoFor = true;

              }

           


                    
    }

           if(totalToCompare < qtyGroup){

              var remainder = qtyGroup - totalToCompare;

              if(parseFloat(arrayItemsToCompare[0].available) < parseFloat(remainder) && parseFloat(arrayItemsToCompare[0].available)!= 0){
                 
                  var lost = parseFloat(remainder) - parseFloat(arrayItemsToCompare[0].available);
                  if(lost > 0){
                     for (var i = 1; i < arrayItemsToCompare.length; i++) {
                         if(arrayItemsToCompare[i].available > 0){
                            addingNewItems(actualRecord,arrayItemsToCompare[i].internalid,arrayItemsToCompare[i].available)
                            lost = lost - arrayItemsToCompare[i].available;
                         }
                         
                     };
                  }
                  setColumnStatus(actualRecord,lineNumParent,lost);
                  
                  completePremadideRemainder(internalidItem,itemqty,actualRecord,qtyGroup,message,arrayItemsToCompare[0].available);

              }else if(parseFloat(arrayItemsToCompare[0].available) < parseFloat(remainder) && parseFloat(arrayItemsToCompare[0].available) == 0){
                      
                  var lost = parseFloat(remainder) - parseFloat(arrayItemsToCompare[0].available);
                   if(lost > 0){
                     for (var i = 1; i < arrayItemsToCompare.length; i++) {
                         if(arrayItemsToCompare[i].available > 0){
                            
                            addingNewItems(actualRecord,arrayItemsToCompare[i].internalid,arrayItemsToCompare[i].available)
                            lost = lost - arrayItemsToCompare[i].available;
                         }
                         
                     };
                  }
                  setColumnStatus(actualRecord,lineNumParent,lost);
                  
              }else if(parseFloat(arrayItemsToCompare[0].available) >= parseFloat(remainder)){
                      
                       //actualRecord.setFieldValue('custbody10','F');
                       
                       completePremadideRemainder(internalidItem,itemqty,actualRecord,qtyGroup,message,remainder);
              
              }else if(parseFloat(arrayItemsToCompare[0].available) == 0){

                       actualRecord.setFieldValue('custbody10','T');
              }
              

            }else if(totalToCompare > qtyGroup){
                var addingitems = totalToCompare - qtyGroup;
                setColumnStatusAdding(actualRecord,lineNumParent,addingitems);
            }
     
      

}




function completePremadideRemainder(internalidItem,itemqty,actualRecord,qtyGroup,message,remainder){


        var parentFind = false;
        for (var j = 1; j <= itemqty; j++) {             
            
            var myPackage = 0;    
            var itemIdCompare = actualRecord.getLineItemValue('item', 'item', j);
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', j);
            
            if(internalidItem == itemIdCompare ){

               var parentRecord = nlapiLoadRecord('itemgroup', actualRecord.getLineItemValue('item', 'item', j));
               parentFind = true;
                  
             }   
            if (actualRecord.getLineItemValue('item', 'units_display', j) && parentFind) {
                    
                var numberBigger = parseFloat(actualRecord.getLineItemValue('item', 'units_display', j).split('CS')[1]);
                 if(numberBigger){
                                var idMb = itemIdCompare;
                                flagSet = false;
                                actualRecord.selectNewLineItem('item');
                                actualRecord.setCurrentLineItemValue('item', 'item', idMb);
                                actualRecord.setCurrentLineItemValue('item', 'quantity', remainder.toFixed());
                                actualRecord.setCurrentLineItemValue('item', 'units', 1);
                                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', message);
                                actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                                actualRecord.commitLineItem('item');                            
                                return true;

                        }
  
                }

                    
    }

}

/**New Rule for in huse items when have stock but don't complete the remainder items.**/
function completeinHouse(internalidItem,itemqty,actualRecord,qtyGroup,message){

 var flagSet = true;
 var parentFind = false;
 var totalToCompare = 0;
 var finish = true;
 var retornoFor = false;
 var myPackage = 0;
        for (var j = 1; j <= itemqty  && !retornoFor; j++) {             
            
            var myPackage = 0;    
            var itemIdCompare = actualRecord.getLineItemValue('item', 'item', j);
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', j);
            
            if(internalidItem == itemIdCompare ){

               var parentRecord = nlapiLoadRecord('itemgroup', actualRecord.getLineItemValue('item', 'item', j));
               parentFind = true;
               var lineNumParent = j;
               actualRecord.selectLineItem('item', lineNumParent); 
               actualRecord.setCurrentLineItemValue('item','custcol_ifm_error',''); 
               actualRecord.commitLineItem('item'); 
                  
             }   
              if (actualRecord.getLineItemValue('item', 'units_display', j) && parentFind) {
                  var multiPlo = parseFloat(actualRecord.getLineItemValue('item', 'units_display', j).split('CS')[1]);
                  var qty = parseFloat(actualRecord.getLineItemValue('item', 'quantity', j));
                  if(qty == 0){
                     
                         var message = actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus',j);
                           var item = loadItem(actualRecord.getLineItemValue('item', 'item', j))
                            var totalAvailableOnItem = item.getFieldValue('custitem_total_available');
                            var remaindertoNeed = qtyGroup - totalToCompare;
                            if(remaindertoNeed > 0){
                                if(totalAvailableOnItem >= 0){

                                   while (remaindertoNeed >= multiPlo || totalAvailableOnItem == 0) {
                                            remaindertoNeed = remaindertoNeed - multiPlo;
                                            totalAvailableOnItem = totalAvailableOnItem - multiPlo;
                                            myPackage++
                                        }
                                     actualRecord.selectLineItem('item', j);  
                                     actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                                     actualRecord.setCurrentLineItemValue('item', 'quantity', myPackage.toFixed());
                                     actualRecord.commitLineItem('item'); 
                                     qty = myPackage;
                                }
                            }

                  

                  }
                  totalToCompare += (qty*multiPlo);
                  finish = false;
              }else if(typeItem == 'EndGroup' && !finish){
                       retornoFor = true;

              }

                    
    }
           if(totalToCompare<qtyGroup){

              var remainder = qtyGroup - totalToCompare;
              setColumnStatus(actualRecord,lineNumParent,remainder);

            }
     
     

}


function closeItems(internalidItem,itemqty,actualRecord,message){
        var parentFind = false;
        var firstMessage = message;

        for (var j = 1; j <= itemqty; j++) {             
            
            var myPackage = 0;    
            var itemIdCompare = actualRecord.getLineItemValue('item', 'item', j);
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', j);
            
            if(internalidItem == itemIdCompare ){

               var parentRecord = nlapiLoadRecord('itemgroup', actualRecord.getLineItemValue('item', 'item', j));
               parentFind = true;
                  
             }   
            if (actualRecord.getLineItemValue('item', 'units_display', j) && parentFind) {

                var numberBigger = parseFloat(actualRecord.getLineItemValue('item', 'units_display', j).split('CS')[1]);
                if(parentFind && numberBigger){
                var myMessage = actualRecord.getLineItemValue('item', 'custcol_tt_igstatus', j);
                var itemIndividual = loadItem(actualRecord.getLineItemValue('item', 'item', j));
                var myItemElegible = checkIsElegible(actualRecord.getFieldText('department'),itemIndividual.getFieldTexts('custitem2'))     
                /***********/
                var amazonBoxActual = actualRecord.getLineItemValue('item', 'custcol2', j);
                if(amazonBoxActual.split('-')[1] && firstMessage == 'In Stock'){
                   
                   if(parseFloat(amazonBoxActual.split('-')[1]) > compareAmazonBox){
                      totalAmazonBox = parseFloat(amazonBoxActual.split('-')[1]);
                      compareAmazonBox = totalAmazonBox;
                   }
                }

                /************/
                if(!myItemElegible && firstMessage == 'In Stock'){
                    message = 'Not Eligible';
                }else{
                    message = 'In Stock';
                }

                actualRecord.selectLineItem('item', j);                                
                actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', message);
                actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
                actualRecord.commitLineItem('item');
                }
            
                
                              
  
                }else if(typeItem == 'EndGroup' && parentFind){//return the for not set any item more
                          return;
                }


                    
    } 


}


function completeStatusOnColumns(internalidItem,itemqty,actualRecord,qtyGroup,message){

 var flagSet = true;
 var parentFind = false;
 var totalToCompare = 0;
 var finish = true;
 var retornoFor = false;
 var myPackage = 0;
 var arrayItemsToCompare = [];
 var allNotElegible = true;

        for (var j = 1; j <= itemqty  && !retornoFor; j++) {             
            
            var myPackage = 0;    
            var itemIdCompare = actualRecord.getLineItemValue('item', 'item', j);
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', j);
            
            if(internalidItem == itemIdCompare ){

               var parentRecord = nlapiLoadRecord('itemgroup', actualRecord.getLineItemValue('item', 'item', j));
               parentFind = true;
               var lineNumParent = j;
               actualRecord.selectLineItem('item', lineNumParent); 
               actualRecord.setCurrentLineItemValue('item','custcol_ifm_error',''); 
               actualRecord.commitLineItem('item'); 
                  
             }   
              if (actualRecord.getLineItemValue('item', 'units_display', j) && parentFind) {
                  
                  var itemIndividual = loadItem(actualRecord.getLineItemValue('item', 'item', j));
                  var myItemElegible = checkIsElegible(actualRecord.getFieldText('department'),itemIndividual.getFieldTexts('custitem2'))     
                  if(myItemElegible){allNotElegible=false;}

                  var multiPlo = parseFloat(actualRecord.getLineItemValue('item', 'units_display', j).split('CS')[1]);
                  var qty = parseFloat(actualRecord.getLineItemValue('item', 'quantity', j));
                  totalToCompare += (qty*multiPlo);
                  finish = false;

              }else if(typeItem == 'EndGroup' && !finish){
                       retornoFor = true;
                        if(allNotElegible){
                          setColumnStatusAllNotElegible(actualRecord,lineNumParent);
                       }
                       

              }
                    
    }

           if(totalToCompare < qtyGroup && !allNotElegible){

              var remainder = qtyGroup - totalToCompare;
              setColumnStatus(actualRecord,lineNumParent,remainder);
              

            }else if(totalToCompare > qtyGroup && !allNotElegible){
                var addingitems = totalToCompare - qtyGroup;
                setColumnStatusAdding(actualRecord,lineNumParent,addingitems);
            }    
     

}

// Try loading different types of items




function individualItemStock(arrayItemsIndividuales,myIdIndividual){
var qty = 0;
var retorno = true;

for (var i = 0; i < arrayItemsIndividuales.length && retorno; i++) {
  
    if(arrayItemsIndividuales[i].internalid == myIdIndividual){
       retorno = false;
       qty = arrayItemsIndividuales[i].qty;
    }
};

return qty;

}

function setColumnStatus(actualRecord,lineNumParent,lost){
actualRecord.setFieldValue('custbody10','T');
actualRecord.selectLineItem('item', lineNumParent); 
actualRecord.setCurrentLineItemValue('item','custcol_ifm_error','Error lost: '+lost+' pcs') 
actualRecord.commitLineItem('item'); 

}

function setColumnStatusAdding(actualRecord,lineNumParent,add){
actualRecord.setFieldValue('custbody10','T');
actualRecord.selectLineItem('item', lineNumParent); 
actualRecord.setCurrentLineItemValue('item','custcol_ifm_error','Error adding: '+add+' pcs') 
actualRecord.commitLineItem('item'); 

}

function setColumnStatusAllNotElegible(actualRecord,lineNumParent){
actualRecord.setFieldValue('custbody10','T');
actualRecord.selectLineItem('item', lineNumParent); 
actualRecord.setCurrentLineItemValue('item','custcol_ifm_error','All Items Are Setting Not Elegible');
actualRecord.commitLineItem('item'); 

}

function checkIsElegible(departmentSo,departmentItem){


 if(departmentSo.indexOf(':')!=-1){
           
           departmentSo = departmentSo.split(':');
           if(departmentSo[1].indexOf('Amazon')!=-1){
                departmentSo = 'Ecommerce : Amazon';
           }else{
            departmentSo = departmentSo[0].trim();
           }
        }
var retorno = departmentItem.indexOf(departmentSo)!=-1;

return retorno;
        


}

function addingNewItems(actualRecord,internalidItem,remainder){


 actualRecord.selectNewLineItem('item');
 actualRecord.setCurrentLineItemValue('item', 'item', internalidItem);
 actualRecord.setCurrentLineItemValue('item', 'quantity', remainder);
 actualRecord.setCurrentLineItemValue('item', 'units', 1);
 actualRecord.setCurrentLineItemValue('item', 'custcol_tt_igstatus', 'In Stock');
 actualRecord.setCurrentLineItemValue('item', 'custcol5', "T"); 
 actualRecord.commitLineItem('item');     

}

function consumptionOnTaGroup(internalidItem,qtyGroup,itemqty,actualRecord){


 var flagSet = true;
 var parentFind = false;
 var totalToCompare = 0;
 var finish = true;
 var retornoFor = false;
 var myPackage = 0;
 var arrayItemsToCompare = [];
 var allNotElegible = true;

        for (var j = 1; j <= itemqty  && !retornoFor; j++) {             
            
            var myPackage = 0;    
            var itemIdCompare = actualRecord.getLineItemValue('item', 'item', j);
            var typeItem = actualRecord.getLineItemValue('item', 'itemtype', j);
            
            if(internalidItem == itemIdCompare ){

               var parentRecord = nlapiLoadRecord('itemgroup', actualRecord.getLineItemValue('item', 'item', j));
               parentFind = true;
               var lineNumParent = j; 
               var total = parseFloat(parentRecord.getFieldValue('custitem_total_available'));
               var totalConsuption = total - qtyGroup;
               nlapiSubmitField(parentRecord.getRecordType(),actualRecord.getLineItemValue('item', 'item', j),'custitem_total_available',totalConsuption,true);
               
                  
             }   
              if (actualRecord.getLineItemValue('item', 'units_display', j) && parentFind) {
                  
                  var itemIndividual = loadItem(actualRecord.getLineItemValue('item', 'item', j));

                  var total = parseFloat(itemIndividual.getFieldValue('custitem_total_available'));
                  var totalConsuption = total - qtyGroup;
                
                if(totalConsuption>0){
                   nlapiSubmitField(itemIndividual.getRecordType(),actualRecord.getLineItemValue('item', 'item', j),'custitem_total_available',totalConsuption,true);
               
                }else{
                      nlapiSubmitField(itemIndividual.getRecordType(),actualRecord.getLineItemValue('item', 'item', j),'custitem_total_available',0,true);
               
                }
                 
              }else if(typeItem == 'EndGroup' && !finish){
                       retornoFor = true;


              }
                    
    }
               

}

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







function reviewQtyMcwos(quantity,actualRecordId){
      var retorno = parseFloat(quantity);
      var filter2 = [];
      filter2[0] = new nlobjSearchFilter('internalid', null, 'is', actualRecordId);

      var newSearchResult = new nlapiSearchRecord(null, 144, filter2, null);
      if(newSearchResult.length>0){
        var backOrder = 0;
        
        for (var x = 0; x < newSearchResult.length; x++) {
           var columnsSearch2 = newSearchResult[x].getAllColumns();
           var qty = parseFloat(newSearchResult[x].getValue(columnsSearch2[2]));
           backOrder+=qty;


         

        };
     retorno+=backOrder;
   }
return retorno;
}





