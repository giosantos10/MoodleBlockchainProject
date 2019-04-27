var nem = require("nem-sdk").default;

function hex_to_ascii(str1)
 {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }
 
function connect(connector){
    return connector.connect().then(function() {

        // If we are here, we are connected
        alert("Server listening for grades.");
        
        nem.com.websockets.subscribe.account.transactions.confirmed(connector, function(res) {
            var teacherPublicKey = JSON.stringify(res.transaction.signer).replace(/['"]+/g, '');
            var submissionName = JSON.stringify(res.transaction.message.payload).replace(/['"]+/g, '');
            submissionName = hex_to_ascii(submissionName);

            var grade = JSON.stringify(res.transaction.mosaics[0].mosaicId.name).replace(/['"]+/g, '');
            grade = grade.replace("place", "");
            grade = grade.toUpperCase();

            // Add row to table
            if(grade != "submittedplace") {
                $('#my-table').append('<tr><td>' + teacherPublicKey + '</td>' + '<td>' + submissionName + '</td>' + '<td>' + grade + '</td></tr>');
            }
        });
        
    }, function(err) {
        reconnect();
    });
}

function reconnect() {
    endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.testnet[1].uri, nem.model.nodes.websocketPort);
    connector = nem.com.websockets.connector.create(endpoint, address);
    connect(connector);
}

function start(address) {
    var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.websocketPort);
    var account_address = nem.model.address.clean(address);
    var connector = nem.com.websockets.connector.create(endpoint, account_address);
    connect(connector);
}

$(document).ready(function () {
    $("#start").click(function() {
        start($("#address").val());
    });
});