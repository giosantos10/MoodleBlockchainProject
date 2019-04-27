var nem = require("nem-sdk").default;
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);
var transferTransaction = nem.model.objects.get("transferTransaction");
var common = nem.model.objects.get("common");
var mosaicDefinitionMetaDataPair = nem.model.objects.get("mosaicDefinitionMetaDataPair");

function attachMosaic() {
    nem.com.requests.namespace.mosaicDefinitions(endpoint, $("h3").text()).then(function(res) {
        var neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(res.data, [$("#grade").val().toLowerCase() + "place"]);

        var mosaicName =  $("#grade").val().toLowerCase() + "place";     
        // Get full name of mosaic to use as object key
        var fullMosaicName  = $("h3").text() + ':' + mosaicName;

        // Check if the mosaic was found
        if(undefined === neededDefinition[fullMosaicName]) return alert("Mosaic not found !");
        
        // Set mosaic definition into mosaicDefinitionMetaDataPair
        mosaicDefinitionMetaDataPair[fullMosaicName] = {};
        mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName];

        var quantity = 1 * Math.pow(10, neededDefinition[fullMosaicName].properties[0].value);

        var mosaicAttachment = nem.model.objects.create("mosaicAttachment")($("h3").text(), mosaicName, quantity);

        transferTransaction.mosaics.push(mosaicAttachment);
        
        alert("Details Confirmed!");
    }, 
    function(err) {
        alert(err);
    }); 
}


function send() {
    // Check form for errors
    if(!transferTransaction.mosaics.length) return alert('You must attach at least one mosaic !');
    if(!$("#privatekey").val() || !$("#student_address").val()) return alert('missing parameter' + ("#privateKey").val());
    if (!nem.model.address.isValid(nem.model.address.clean($("#student_address").val()))) return alert('Invalid recipent address !');

    common.privateKey = $("#privatekey").val();

    // Check private key for errors
    if (common.privateKey.length !== 64 && common.privateKey.length !== 66) return alert('Invalid private key, length must be 64 or 66 characters !');
    if (!nem.utils.helpers.isHexadecimal(common.privateKey)) return alert('Private key must be hexadecimal only !');

    transferTransaction.amount = 1;

   transferTransaction.recipient = nem.model.address.clean($("#student_address").val());

    // Class and Assignment
    transferTransaction.message = $("#submission_name").val();

    var transactionEntity = nem.model.transactions.prepare("mosaicTransferTransaction")(common, transferTransaction, mosaicDefinitionMetaDataPair, nem.model.network.data.testnet.id);

    nem.com.requests.chain.time(endpoint).then(function (timeStamp) {
        const ts = Math.floor(timeStamp.receiveTimeStamp / 1000);
        transactionEntity.timeStamp = ts;
        const due = 60;
        transactionEntity.deadline = ts + due * 60;
        transactionEntity.fee = 1000001;
        nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res){
            if (res.code >= 2) { alert(res.message); } 
            else { alert("Sent!"); }
        }, function(err) { alert(err); });
    }, function (err) { console.error(err); });
}

$("#confirm").click(function() {
    attachMosaic();
});
$("#send").click(function() {
    send();
});
