function removeEa(){

jQuery("[id*='item_row_']").each(function(e) {
var line = jQuery(this).attr('id').split('item_row_')[1];
var unit = jQuery(this).children().text().indexOf('EA') != -1;
if(unit){
nlapiRemoveLineItem('item', line);
}

})

}
