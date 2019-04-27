$(document).ready(function(){
    var nem = require("nem-sdk").default; // load library
    
    var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet,
    nem.model.nodes.defaultPort); //create NIS endpoint object

    var tx = nem.model.objects.get("namespaceProvisionTransaction"); // Get empty un-prepared transaction object
    
    var common = nem.model.objects.get("common"); // Get an empty common object

    function prepare() {
        // Alert if private key is not specified
        if(!$("#privatekey").val()) return alert('Missing parameter: Private Key'); 

        // Get private key from HTML text field
        common.privateKey = $("#privatekey").val();

        // Check length of private key
        if (common.privateKey.length !== 64 && common.privateKey.length !== 66) return alert('Invalid private key, length must be 64 or 66 characters !');
        
        // Check if private key is in correct format
        if (!nem.utils.helpers.isHexadecimal(common.privateKey)) return alert('Private key must be hexadecimal only !'); 

        tx.namespaceName = $("#namespacename").val();

        var transactionEntity = nem.model.transactions.prepare("namespaceProvisionTransaction")(common, tx, nem.model.network.data.testnet.id); // Prepare the transaction object

        console.log(transactionEntity)

        transactionEntity.parent = null;
        if($("#parentname").val().length >= 1) {
             transactionEntity.parent = $("#parentname").val(); 
        } // Update the parent value in prepared transaction
        
        return transactionEntity;
    }

    function updatefee() {
        transactionEntity = prepare();

        var transactionfee = nem.utils.format.nemValue(transactionEntity.fee)[0] + "." + nem.utils.format.nemValue(transactionEntity.fee)[1];
        var rentalfee = nem.utils.format.nemValue(transactionEntity.rentalFee)[0] + "." + nem.utils.format.nemValue(transactionEntity.rentalFee)[1];

        $("#transactfee").val(transactionfee);
        $("#rentalfee").val(rentalfee);
    }

    function rent() {
        transactionEntity = prepare();
        nem.com.requests.chain.time(endpoint).then(function (timeStamp) {
            const ts = Math.floor(timeStamp.receiveTimeStamp / 1000);
            transactionEntity.timeStamp = ts;
            const due = 60;
            transactionEntity.deadline = ts + due * 60;
            nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res){
            if (res.code >= 2) { 
                alert(res.message);
            } 
            else { 
                alert(res.message); 
            }
            }, function(err) { console.log(err); });
        }, function (err) {console.error(err); });
    }



    // Event handler
    $("#rent").click(function() {
        rent();
        //updatefee();
    })
    
    $("#parentname").on('change keyup paste', function() {
        updatefee();
    })

    $("#parentname").on('change keyup paste', function() {
        updatefee();
    })

})