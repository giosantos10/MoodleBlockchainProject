
//import the nem-sdk
// This is not needed if you use the repl.js script available in the container
var nem = require("nem-sdk").default;
console.log("GENERATE.JS is running...")

function generate() {

    // generate 32 random bytes. 
    // You could write the 32 bytes of your choice if you prefer, but that might be dangerous as
    // it would be less random.
    // 
    var rBytes = nem.crypto.nacl.randomBytes(32);
    // convert the random bytes to an hex string
    // the result, rHex, can be printed out to the console for taking a backup with console.log(rBytes).
    // Take a backup copy of that value as it lets you recreate the keypair to give
    // you access to your account.
    // This value is also usable with the NEM NanoWallet.
    var rHex = nem.utils.convert.ua2hex(rBytes);

    // generate the keypair
    var keyPair = nem.crypto.keyPair.create(rHex);

    var address = nem.model.address.toAddress(keyPair.publicKey.toString(),  nem.model.network.data.testnet.id)

    var account = {NAME: "Stephen", ADDRESS: address, PUBLIC_KEY: keyPair.publicKey.toString(), PRIVATE_KEY: rHex};

    return account;
}

$("#generate").click(function() {
    console.log("CLICK");
    account = generate();
    $('#name').val(account.NAME);
    $('#privatekey').val(account.PRIVATE_KEY);
    $('#publickey').val(account.PUBLIC_KEY);
    $('#address').val(account.ADDRESS);
});
