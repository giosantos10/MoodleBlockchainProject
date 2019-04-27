let nem = require("nem-sdk").default;
let checker_xems = false;
let checker_namespace = false;
let checker_mosaics = false;

var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);
var common = nem.model.objects.get("common");

function generate() {
    var rBytes = nem.crypto.nacl.randomBytes(32);
    var rHex = nem.utils.convert.ua2hex(rBytes);
    var keyPair = nem.crypto.keyPair.create(rHex);
    var address = nem.model.address.toAddress(keyPair.publicKey.toString(),  nem.model.network.data.testnet.id)
    let account = {ADDRESS: address, PUBLIC_KEY: keyPair.publicKey.toString(), PRIVATE_KEY: rHex};
    
    return account;
}

function hex_to_ascii(str1)
 {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }

//-------------------Check if Account received XEMs

function connect(connector){
    return connector.connect().then(function() {
        
        // If we are here, we are connected
        alert("Waiting for XEMs.");

        nem.com.websockets.subscribe.account.transactions.confirmed(connector, function(res) {        
            if(checker_xems == false && checker_namespace == false && checker_mosaics == false) {
                var feeConfirmation = JSON.stringify(res.transaction.amount).replace(/['"]+/g, '');
                
                if(feeConfirmation == "500000000" ) {
                    alert("You have received 500 XEMs in your account");
                    checker_xems = true;
                    alert("Click button: Setup Account")

                }
            }
            else if(checker_xems == true && checker_namespace == false && checker_mosaics == false) {
                var namespaceConfirmation = JSON.stringify(res.transaction.parent).replace(/['"]+/g, '');
                
                if(namespaceConfirmation == "null" ) {
                    alert("Your namespace has been generated");
                    checker_namespace = true;
                    alert("Setting up account...50%");
                    createMosaic($('#privatekey').val(), $('#userName').val(), "A");
                    createMosaic($('#privatekey').val(), $('#userName').val(), "B");
                    createMosaic($('#privatekey').val(), $('#userName').val(), "C");
                    createMosaic($('#privatekey').val(), $('#userName').val(), "D");
                    createMosaic($('#privatekey').val(), $('#userName').val(), "F");
                    createMosaic($('#privatekey').val(), $('#userName').val(), "Submitted");
                }
            }

            else if(checker_xems == true && checker_namespace == true && checker_mosaics == false) {
                var mosaicConfirmation = JSON.stringify(res.transaction.mosaicDefinition.id.name).replace(/['"]+/g, '');
                mosaicConfirmation = mosaicConfirmation.replace("place", "");
                mosaicConfirmation = mosaicConfirmation.toUpperCase();
                if(mosaicConfirmation == "F" || mosaicConfirmation == "SUBMITTED") {
                    alert("Mosaics have been generated");
                    checker_mosaics = true;
                    alert("Account has been setup successfully!");
                    document.getElementById("confirm").click();

                }
            }
        });
        

    }, function(err) {
        reconnect();
    });
}

function reconnect() {
    var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.testnet[1].uri, nem.model.nodes.websocketPort);
    connector = nem.com.websockets.connector.create(endpoint, address);
    connect(connector);
}

function start(address) {
    var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.websocketPort);
    var account_address = nem.model.address.clean(address);
    var connector = nem.com.websockets.connector.create(endpoint, account_address);
    connect(connector);
}

//-------------------Create root namespace
function initializeRootNamespace(privateKey, namespaceID) {
    var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet,
        nem.model.nodes.defaultPort);
    
        var tx = nem.model.objects.get("namespaceProvisionTransaction");
        
        var common = nem.model.objects.get("common");
    
        function prepare() {
            
            if(!privateKey) return alert('Missing parameter: Private Key'); 
    
            common.privateKey = privateKey;
    
            if (common.privateKey.length !== 64 && common.privateKey.length !== 66) return alert('Invalid private key, length must be 64 or 66 characters !');
            
            if (!nem.utils.helpers.isHexadecimal(common.privateKey)) return alert('Private key must be hexadecimal only !'); 
    
            tx.namespaceName = namespaceID;
    
            var transactionEntity = nem.model.transactions.prepare("namespaceProvisionTransaction")(common, tx, nem.model.network.data.testnet.id); // Prepare the transaction object
    
            console.log(transactionEntity)
    
            transactionEntity.parent = null;
                        
            return transactionEntity;
        }
    
        function rent() {
            var transactionEntity = prepare();
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
                    //alert(res.message); 
                    alert("Setting up your account...Please wait")
                }
                }, function(err) { console.log(err); });
            }, function (err) {console.error(err); });
        }

        rent();
}

function createMosaic(privatekey, namespaceID, mosaicname) {
    if(!privatekey) return alert('Missing parameter !');

    common.privateKey = privatekey;

    if (!nem.utils.helpers.isHexadecimal(common.privateKey)) return alert('Private key must be hexadecimal only !');
    
    var tx = nem.model.objects.get("mosaicDefinitionTransaction");

    tx.mosaicName = mosaicname.toLowerCase() + "place";
    tx.namespaceParent = {
        "fqn": namespaceID
    };
    
    tx.mosaicDescription = 'desc';

    tx.properties.initialSupply = 10;
    tx.properties.divisibility = 6;
    tx.properties.transferable = true;
    tx.properties.supplyMutable = true;

    var transactionEntity = nem.model.transactions.prepare("mosaicDefinitionTransaction")(common, tx, nem.model.network.data.testnet.id);
    
    nem.com.requests.chain.time(endpoint).then(function (timeStamp) {
        const ts = Math.floor(timeStamp.receiveTimeStamp / 1000);
        transactionEntity.timeStamp = ts;
        const due = 60;
        transactionEntity.deadline = ts + due * 60;
        
        nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res){
            if (res.code >= 2) {
                alert(res.message);
            } else {
                //alert(res.message);
            }
        }, function(err) {
            alert(err);
        });
        
    }, function (err) {
        console.error(err);
    });
}

alert("Please follow the instructions in the alert messages.")

$("#generate").click(function() {
    let account = generate();
    $('#privatekey').val(account.PRIVATE_KEY);
    $('#publickey').val(account.PUBLIC_KEY);
    $('#address').val(account.ADDRESS);
    console.log("new account generated")
    alert("Copy the address and paste it to \nhttp://testfaucet.nem.ph/ and get XEMs. \nWait for your XEMs before proceeding.")
    start(account.ADDRESS);
});

$("#setup").click(function() {
    if(checker_xems) {
        if($('#address').val()) {
            initializeRootNamespace($('#privatekey').val(), $('#userName').val());
        }
        else {
            return alert("Please sign up first!");
        }
    }
    else {
        return alert("Please sign up first!");
    }
});