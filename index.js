var express = require('express');
var Web3 = require('web3');
var http = require("http");
var request = require("request");
var Tx = require('ethereumjs-tx');
var bodyParser = require('body-parser');

var web3 = new Web3();

const port = 3000;

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	console.log('Capped');
	signed_tx = handle_request(req, true);
	res.send(signed_tx);
});

app.get('/uncapped', function(req, res) {
	console.log('Uncapped');
	signed_tx = handle_request(req, false);
	res.send(signed_tx);
});


app.listen(port, function() {
	console.log('Start Server'); 
});


function handle_request(req, is_capped) {
	var nonce = req.body.nonce;
	var new_adds = req.body.new_adds;
	if (!Array.isArray(new_adds)) {
		new_adds = [new_adds];
	}
	var command_address = '<signer_address>';
	var contract_address = '<contract_address>';
	var private_key = '<signer_private_key>';
	var amount = 0;
	var gas_price = 21 * Math.pow(10,9);
	var gas_limit_min = 45000;
	var gas_limit_jumps = 25000;
	var gas_limit = gas_limit_min + gas_limit_jumps * (new_adds.length - 1);
	var new_adds_command = '';
	if (is_capped) {
		new_adds_command = generate_multi_address(new_adds);
	} else {
		new_adds_command = generate_multi_address_uncapped(new_adds);
	}
	var rawTx = create_tx_command(nonce, gas_price, gas_limit, contract_address, amount, new_adds_command);
	return sign_tx(rawTx, private_key);
}


function create_tx_command(nonce, gas_price, gas_limit, to_address, amount, data) {	
	var rawTx = {
	  nonce: nonce, //web3.utils.toHex(nonce),
	  gasPrice: web3.utils.toHex(gas_price), 
	  gasLimit: web3.utils.toHex(gas_limit), 
	  to: to_address, 
	  value: web3.utils.toHex(web3.utils.toWei(amount)), 
	  data: data
	}
	return rawTx;
}


function generate_single_address(new_address) {
	var res = web3.eth.abi.encodeFunctionCall({
	    name: 'addAddressToCappedAddresses',
	    type: 'function',
	    inputs: [{
	        name: 'addr',
	        type: 'address'
		}]
	}, [new_address]);
	return res;
}

function generate_multi_address(new_adds) {
	console.log(new_adds);
	var res = web3.eth.abi.encodeFunctionCall({
    name: 'addMultipleAddressesToCappedAddresses',
    type: 'function',
    inputs: [{
        name: 'addrList',
        type: 'address[]'
    	}]
	}, [new_adds]);
	return res;
}


function generate_multi_address_uncapped(new_adds) {
	console.log(new_adds);
	var res = web3.eth.abi.encodeFunctionCall({
    name: 'addMultipleAddressesToUncappedAddresses',
    type: 'function',
    inputs: [{
        name: 'addrList',
        type: 'address[]'
    	}]
	}, [new_adds]);
	return res;
}



function sign_tx(rawTx, private_key) {
  try {
    var tx = new Tx(rawTx);
    var private_key_hex = new Buffer(private_key, 'hex'); 
    tx.sign(private_key_hex);
  } catch(err) {
    console.log(err);
    return;
  }
  var serializedTx = tx.serialize().toString('hex');
  return serializedTx
}



