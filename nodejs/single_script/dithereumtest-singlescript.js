#!/usr/bin/nodejs
/*
CREATE TABLE
    contract_orders (
        chainid BIGINT,
        orderid BIGINT,        
);
*/

var mysql = require('mysql');
const util = require('util');
require('dotenv').config();
const Web3 = require("web3");
var Tx = require('ethereumjs-tx').Transaction;
var Contract = require('web3-eth-contract');
var CronJob = require('cron').CronJob;
var CHAIN = {'chain':'rinkeby'};

var PROVIDER = 'https://node-testnet.dithereum.io';
var CONTRACT_ADDR = '0xA577f051Ab5e5Bc30fFB9D981841a0e4691dDcDB';
var DITHEREUM_CONTRACT_ADDR = '0x4ADAc95aFD1391B796411FAe609968ccAd6CA4a5';
var CONTRACT_ADDR_ABI = JSON.parse(JSON.stringify(
[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderID","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"CoinIn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderID","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"CoinOut","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderID","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"CoinOutFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"signer","type":"address"},{"indexed":true,"internalType":"bool","name":"status","type":"bool"}],"name":"SignerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderID","type":"uint256"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"chainID","type":"uint256"}],"name":"TokenIn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderID","type":"uint256"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"chainID","type":"uint256"}],"name":"TokenOut","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderID","type":"uint256"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"chainID","type":"uint256"}],"name":"TokenOutFailed","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_signer","type":"address"},{"internalType":"bool","name":"_status","type":"bool"}],"name":"changeSigner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"coinIn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"_orderID","type":"uint256"}],"name":"coinOut","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"orderID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"signer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"uint256","name":"chainID","type":"uint256"}],"name":"tokenIn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"uint256","name":"_orderID","type":"uint256"},{"internalType":"uint256","name":"chainID","type":"uint256"}],"name":"tokenOut","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
));
  

var CONTRACTS_ARY=[];
CONTRACTS_ARY[34] = '0xA577f051Ab5e5Bc30fFB9D981841a0e4691dDcDB';
CONTRACTS_ARY[4] = '0xB6495879f4f88D3563B52c097Cb009E286586137';
CONTRACTS_ARY[97]="0xaF5Cb6806e883F0E06837073aCA57b98d7571ad2";
CONTRACTS_ARY[137] = '0x07F25AcFf1F0e725Df3997b3092DC594B1d7a496';
CONTRACTS_ARY[256] = "0x4a46F7EB468fC98e4c3c7D99f61c5F5E719C0b78";
// FOR Dithereum Testnet
var chainid = 34; // Dithereum TESTNET
var BRIDGE_CHAIN = 4; // TESTNET Rinkeby
// ORDERS
var myorderID = [...Array(90000).keys()].toString().split(',');

if(myorderID[0] === '0'){
	myorderID.shift();
 	//console.log(myorderID);	
} 

/// DB Connection Config Obj
var DB_CONFIG = {
  		host: process.env.DB_HOST.toString(),
  		user: process.env.DB_USER.toString(),
  		password: process.env.DB_PASSWORD.toString(),
  		database: process.env.DB_DATABASE.toString(),
  		connectTimeout: 100000,
  		port: process.env.DB_PORT
};

// TOKEN ADDRESSES - 
var ETH_TOKEN_ADDRESS = "0xaeF855F175D50D38714a366b7362ef344bA88bD0";
var BNB_TOKEN_ADDRESS = "0xF4905930BB56F9Aeb520de0897c9283d0B3624eE";

var MATIC_TOKEN_ADDRESS = "0xf2A16551D5ab32acf690548DcFaB1302224B9926";
//var HT_TOKEN_ADDRESS = "0xdF310a187Bb35A0B0090DC7Cb2C2F784Ccf72036";
var HT_TOKEN_ADDRESS = "0xF24BAecb78A87bBaa3040bAE4893163405c2EAB3"; // NEW CREATED
var DUSD_TOKEN_ADDRESS = "0xE82E083195012A69deBce378fFA014b9721D780A";
var USDT_TOKEN_ADDRESS = "0xd4160737D90d6cC756f12E603e47e0E4FDADC870";								  
var USDC_TOKEN_ADDRESS = "0xd4160737D90d6cC756f12E603e47e0E4FDADC870";
var PAX_TOKEN_ADDRESS = "0xd4160737D90d6cC756f12E603e47e0E4FDADC870";
var DAI_TOKEN_ADDRESS = "0xd4160737D90d6cC756f12E603e47e0E4FDADC870";
var RINKEYBY_ETH_ADDRESS = "0xd4160737d90d6cc756f12e603e47e0e4fdadc870";
	 
// for web3 contract object creation  
var CHAINID_URL=[];
//Rinkby, HECO, Ethereum TestNet
CHAINID_URL[4] = 'https://rinkeby.infura.io/v3/8102c6c81e12418588c89d69ac7a3f04';
//Binance Smart chain TESTNET
CHAINID_URL[97] = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
//HECO TEST NET 
CHAINID_URL[256] = 'https://http-testnet.hecochain.com';
//DITHEREUM TESTNET
CHAINID_URL[34] = 'https://node-testnet.dithereum.io';
// UNCOMMENT BELOW LINE
//MATIC_MAIN NET 
//CHAINID_URL[137] = 'https://polygon-rpc.com';


// CHANGES DONE
async function	getAvailableAdminWallet(){	
	var con5 = mysql.createConnection(DB_CONFIG);
	const query5 = util.promisify(con5.query).bind(con5);	
	try{
			var _mywherecondition = " isFrozen=0 AND chainid="+chainid+" AND freezetime<(UNIX_TIMESTAMP()-600) limit 1";
			var select_wallet_query = "SELECT * FROM "+process.env.NONCE_ADMIN_TABLE+" WHERE "+_mywherecondition;
			console.log(">>>> Query <<<<#", select_wallet_query);			
			var _adminwallet = await query5(select_wallet_query).catch(console.log);			
			console.log("<<<< Available Wallet >>>> ", _adminwallet[0]);			
			if(_adminwallet[0]){
				process.env.ADMIN_WALLET=_adminwallet[0].walletid;
				process.env.ADMIN_WALLET_PK=_adminwallet[0].walletpk;
				process.env.CHAIN_ID=_adminwallet[0].chainid;
			}else{							
				console.log(">>>>> NOTE:::::::: No Admin wallet available >>>>");																	
			}		
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con5.end();			
	}			
}


////// Unfreeze Wallets 
function tryToUnfreezeWallets(){
	/// This will remove/unfreeze maximum two wallets if present in noncetable and freezed/locked 
	db_select_frozenWallets().then((frozenWallets)=>{		
			   console.log(">>>>Frozen Wallet Length >>>>",frozenWallets.length);
				if(frozenWallets.length > 0){					
					//console.log(">>>> frozenWallets >>>>",frozenWallets[0]);								
					frozenWallets.forEach((walet)=>{							
						(async()=>{					
							console.log("#>> Walet ##>>",walet);
							await gTransactionCount(walet).then((transcount)=>{
								console.log("#> Waletid, TransactionCount, walet.nonce, walet.chainid >>>>>",walet.walletid, transcount, walet.nonce, walet.chainid);								
								if((parseInt(walet.nonce) <= parseInt(transcount)) || (walet.nonce === undefined) || (walet.nonce === null) ){									
									console.log(">>>>> Removing from noncetable and unfreezing for >>> walet.walletid, walet.chainid >>>", walet.walletid, walet.chainid);
									unfreezeWallet(walet.chainid, walet.walletid);									
								}
							}).catch(console.log);
						})();						
					})												
				}
	}).catch(console.log);
}

async function gTransactionCount(mywallet){		
		console.log(">>>>>> mywallet.walletid, mywallet.chainid  >>>>", mywallet.walletid, mywallet.chainid);		
		let myweb3 = new Web3(new Web3.providers.HttpProvider(PROVIDER));			
		return await myweb3.eth.getTransactionCount(mywallet.walletid).catch(console.log);		
}

process.env.lastnonce = 0;

/// FOR BRIDGE - 
async function	getAvailableAdminWallet_bridge(bridgeweb3, _chainid){	
	var con5 = mysql.createConnection(DB_CONFIG);
	const query5 = util.promisify(con5.query).bind(con5);
	try{
			var _mywherecondition = " isFrozen=0 AND chainid="+_chainid+" AND freezetime<(UNIX_TIMESTAMP()-600) limit 1";
			var select_wallet_query = "SELECT * FROM "+process.env.NONCE_ADMIN_TABLE+" WHERE "+_mywherecondition;
			console.log(">>>> Bridge Query >>>>", select_wallet_query);			
			var _adminwallet = await query5(select_wallet_query).catch(console.log);			
			console.log("<<<< Bridge Available Wallet >>>> ", _adminwallet[0]);			
			if(_adminwallet[0]){
				process.env.ADMIN_WALLET_BRIDGE=_adminwallet[0].walletid;
				process.env.ADMIN_WALLET_PK_BRIDGE=_adminwallet[0].walletpk;
				process.env.CHAIN_ID_BRIDGE=_adminwallet[0].chainid;	
				process.env.LAST_DB_NONCE_BRIDGE=_adminwallet[0].nonce;
				console.log(">>>>>~~~~~process.env.LAST_DB_NONCE_BRIDGE>>>>>",process.env.LAST_DB_NONCE_BRIDGE);			
				///
				await bridgeweb3.eth.getTransactionCount(process.env.ADMIN_WALLET_BRIDGE).then((z)=>{	
					process.env.lastnonce_bridge = (parseInt(process.env.LAST_DB_NONCE_BRIDGE) > parseInt(z)) ? parseInt(process.env.LAST_DB_NONCE_BRIDGE) : parseInt(z);
					console.log(">>~~~<< process.env.LAST_DB_NONCE_BRIDGE >>~~~<<",process.env.LAST_DB_NONCE_BRIDGE);			    			
					//process.env.lastnonce_bridge = parseInt(z);
					var _wherestr = " walletid='"+process.env.ADMIN_WALLET_BRIDGE+"' AND chainid="+process.env.CHAIN_ID_BRIDGE; 			
					var update_query = "UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET isFrozen=1, freezetime=UNIX_TIMESTAMP() WHERE "+_wherestr;
					console.log(">>>> Bridge Query >>>> Update Query >>>>", update_query);		
					query5(update_query).catch(console.log);	
				}).catch(console.log);	
				///					
			}else{							
				console.log(">>>>> NOTE:::::::: No Admin wallet available >>>>");													
			}		
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con5.end();			
	}			
}

var filter = {'to': CONTRACT_ADDR.toString()}

const options = {
    timeout: 90000,
    reconnect: {
      auto: true,
      delay: 5000,
      maxAttempts: 20,
      onTimeout: true,
    },
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 120000,
      maxReceivedFrameSize: 100000000,
      maxReceivedMessageSize: 100000000,
    },
};


async function company_bridge_send_method( _tokenaddr, _toWallet, _amt, orderid, _chainid){	  
	 // not valid token addr
	 var _ary = [ETH_TOKEN_ADDRESS.toString(), BNB_TOKEN_ADDRESS.toString(), MATIC_TOKEN_ADDRESS.toString(), HT_TOKEN_ADDRESS.toString(), USDT_TOKEN_ADDRESS.toString()];
	 if(_ary.includes(_tokenaddr)){}else{
	 	 return 1;
	 }
    // If chainid not coming proper from UI overwrite it!!	 
    if(_tokenaddr === BNB_TOKEN_ADDRESS.toString()){    	
    	 _chainid = 97;    	  
    } 
    console.log(">>>>> Working on chain id >>>> ",_chainid);
	 if(! CHAINID_URL[_chainid]){
     	console.log(">>> not valid chainid >>>", _chainid);
      return;
    }    

    let bridgeweb3 = new Web3(new Web3.providers.HttpProvider(CHAINID_URL[_chainid]));
    console.log(">>>>>@@@@ CHAINID_URL[_chainid] >>> ", CHAINID_URL[_chainid]);		    
    web3.eth.handleRevert = true; 		    
     
	 try{	 		
    		var company_bridgeinstance = new bridgeweb3.eth.Contract(CONTRACT_ADDR_ABI, CONTRACTS_ARY[_chainid].toString());    				    	
    }catch(e){
			console.log(" >>>>> EEEEE >>>>",e);		    
    }
	 
	 await getAvailableAdminWallet_bridge(bridgeweb3, _chainid).then(()=>{
	 		 console.log(">>!!<< process.env.ADMIN_WALLET_BRIDGE, _chainid  >>!!<<", process.env.ADMIN_WALLET_BRIDGE, _chainid );	 		 
		    if(typeof process.env.ADMIN_WALLET_BRIDGE === 'undefined'){
		    	console.log("<<@@@>><<@@@>>No admin wallet bridge available,Removing orderid from orders_table<<@@@>><<@@@>>");
		    	remove_orderid_from_orders_table(orderid, _chainid).then(()=>{
		    		setTimeout(()=>{
						process.exit(1);		    		
		    		},120000);
		    	})    	    	
		    }else{		    	        
		  	 	  console.log("<<@!@!@>>With admin wallet<<@!@!@>>",process.env.ADMIN_WALLET_BRIDGE);		        
		        if((typeof process.env.lastnonce_bridge === 'undefined') || (typeof process.env.ADMIN_WALLET_BRIDGE === 'undefined')){				     
						process.exit(1);     
				  }     
		    } 
    }); 

	 var mydata = await company_bridgeinstance.methods.coinOut(_toWallet.toString(), _amt.toString(), orderid.toString()).encodeABI();    
	 var requiredGas = await company_bridgeinstance.methods.coinOut(_toWallet.toString(), _amt.toString(), orderid.toString()).estimateGas({from: process.env.ADMIN_WALLET_BRIDGE }).catch(console.log);
    requiredGas = (requiredGas > 0) ? requiredGas : 70000;    
    console.log("<<@@@>><<@@@>>REQUIRED GAS,bridge_admin_wallet<<@@@>><<@@@>>",requiredGas, process.env.ADMIN_WALLET_BRIDGE.toString());     		   
    
  	 (async()=>{
		  await bridgeweb3.eth.getGasPrice().then(gasPrice=>{
		  	    var nonc = (parseInt(process.env.lastnonce_bridge) == 0) ? 1 : parseInt(process.env.lastnonce_bridge);                      			                    				                    			                                                                  
		       const raw_tx = {   
		           nonce: nonc,                    
		           gasPrice: web3.utils.toHex(gasPrice),
		           gasLimit: requiredGas,
		           from: process.env.ADMIN_WALLET_BRIDGE.toString(),
		           to: CONTRACTS_ARY[_chainid],                     
		           data: mydata,
		           chainId: parseInt(_chainid)		            
		       };
		       		       
		      console.log(">>>> RAW TX [raw_tx] >>>>",raw_tx);
		      try{
		      	   set_ordersTable(parseInt(_chainid), orderid.toString());		       		
						bridgeweb3.eth.accounts.signTransaction(raw_tx, process.env.ADMIN_WALLET_PK_BRIDGE.toString(), function(error,result){
							if(! error){
								try{
									console.log(">> Signed Transaction >>");
									var serializedTx=result.rawTransaction;
									console.log("Serialized Tx ::", serializedTx);
								   bridgeweb3.eth.sendSignedTransaction(serializedTx.toString('hex')).on('receipt', console.log);
								}catch(e){
									console.log(e);
								}
							}
						});
						console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
						console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
						var nextnonce = parseInt(process.env.lastnonce_bridge)+1;
						console.log(">>> Updating nonce >>>", _chainid, process.env.ADMIN_WALLET_BRIDGE.toString(), nextnonce);
						//update_nonce(34, process.env.ADMIN_WALLET_BRIDGE.toString(), nextnonce);
						console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
						console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
						update_nonce(_chainid, process.env.ADMIN_WALLET_BRIDGE.toString(), nextnonce);								
					}catch(e){
						console.log("##### :::: ERR0R :::: ######",e);
					}                                                                                                        
		  }) 
	 })();		 
}


// CHANGES DONE
async function update_nonce_admin_table(newnonce, isbridge=0){
	var con7 = mysql.createConnection(DB_CONFIG);
	const query7 = util.promisify(con7.query).bind(con7);	
	try{
			var _wherestring = '';
			if(isbridge > 0){
				_wherestring = " isFrozen=1 AND chainid="+process.env.CHAIN_ID_BRIDGE+" AND walletid='"+process.env.ADMIN_WALLET_BRIDGE+"'";
			}else{
				_wherestring = " isFrozen=1 AND chainid="+process.env.CHAIN_ID+" AND walletid='"+process.env.ADMIN_WALLET+"'";
			}
			var update_nonce_admin_query = "UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET nonce="+parseInt(newnonce)+", freezetime=UNIX_TIMESTAMP() WHERE "+_wherestring;   	
			console.log(">><< QUERY >><<", update_nonce_admin_query);	
			await query7(update_nonce_admin_query).catch(console.log);			
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con7.end();			
	}
}

async function checkLatestBlock(){
	 //######  UNCOMMENT BELOW LINE FOR 100 BLOCKS  ######//
 	 var toblock =  await web3.eth.getBlockNumber();
 	 var fromblock = toblock-1500;
	 
 	 console.log(">>TESTING FOR>>toblock>>,fromblock>>",toblock, fromblock);
	 getEventData_TokenIn(fromblock, toblock); 	
}

// cHANGES DONE
async function freeze_wallet(){
	var con8 = mysql.createConnection(DB_CONFIG);
	const query8 = util.promisify(con8.query).bind(con8);	
	try{
			var _wherestr = " walletid='"+process.env.ADMIN_WALLET+"' AND chainid="+process.env.CHAIN_ID; 			
			var update_query = "UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET isFrozen=1, freezetime=UNIX_TIMESTAMP() WHERE "+_wherestr;
			console.log(">>>> Query >>>> Update Query >>>>", update_query);		
			await query8(update_query).catch(console.log);			
			checkLatestBlock();		
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con8.end();			
	}
}

function set_ordersTable(chainid, orderid){
	var con9 = mysql.createConnection(DB_CONFIG);
	const query9 = util.promisify(con9.query).bind(con9);	
	try{
			var _wherestr = " orderid="+orderid+" AND chainid="+chainid; 			
			var update_query = "UPDATE contract_orders SET transactionSent=1 WHERE "+_wherestr;
			console.log(">>>> Query >>>> Update Query [SET ORDERS_TABLE] >>>>", update_query);		
			query9(update_query).catch(console.log);		
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con9.end();			
	}
}

/// SET THIS FOR EACH CHAIN 
var getwsprovider = () =>{  
	 var httpprovider = new Web3(new Web3.providers.HttpProvider(PROVIDER, options));     
    return httpprovider
}
let web3 = new Web3(getwsprovider());

// TokenIn -> coinOut
async function getEventData_TokenIn(_fromBlock, _toBlock){	
	 const myinstance = new web3.eth.Contract(CONTRACT_ADDR_ABI, CONTRACT_ADDR.toString());	 	 
	 //try{ 		 
		 		  await myinstance.getPastEvents('TokenIn', { fromBlock: _fromBlock, toBlock: _toBlock },function(error,myevents){		  
		 				if(myevents === undefined){ 	return  }		 				
		 				var myeventlen = myevents.length;		
		 				process.env.TokenInEventLen = myevents.length;
		 				if((parseInt(process.env.CoinInEventLen) === 0) && (parseInt(process.env.TokenInEventLen) === 0)){
		 						// UNFREEZE ROW as no events found in specified block range 
								no_records_found_unfreeze_row()
						}	
						console.log("================================================="); 								 				
		 				console.log("TOKEN IN >>> myeventlen >>>>", myeventlen);		 						 				 		
		 				console.log("=================================================");
		 				var secretText = Math.random(23439, 5654624);	
		 				process.env.secretText = secretText.toString();	
		 				for(var k=0; k<myeventlen;k++){		 						 	
		 					var myeve = myevents[k];		 					
		 				   console.log("Event Dtaila ::: >>>",myeve);
		 				   //console.log("~~~~~~~~~~~~~~~~~~~>>> k, myeve >>>",k, myeve);							
		 					var _myblkNumber = myeve.blockNumber;					
		 					var _myorderid = myeve.returnValues.orderID;
							var _mytokenAddress = myeve.returnValues.tokenAddress.trim();
							var _mysendcoinsTo = myeve.returnValues.user;
							var _myamount = myeve.returnValues.value;
							var _mychainid = myeve.returnValues.chainID;
							//console.log(">>>>>### TokenIn eventlen, k, 	 id, Order Id >>>>",myeventlen, k, _mychainid, _myorderid);
							if(_mychainid && (parseInt(_myamount))){
								console.log("!!!!!! tokenAddress >>>>>", _mytokenAddress);
								var _ary = [ETH_TOKEN_ADDRESS.toString(), BNB_TOKEN_ADDRESS.toString(), MATIC_TOKEN_ADDRESS.toString(), HT_TOKEN_ADDRESS.toString(), DUSD_TOKEN_ADDRESS.toString(), USDT_TOKEN_ADDRESS.toString()];
								if(_ary.includes(_mytokenAddress)){									 
								//if(_mytokenAddress == (ETH_TOKEN_ADDRESS || BNB_TOKEN_ADDRESS || MATIC_TOKEN_ADDRESS || HT_TOKEN_ADDRESS || DUSD_TOKEN_ADDRESS || USDT_TOKEN_ADDRESS)){								
									console.log("<<<<@>>>> Looking for ---->>>>", _mytokenAddress);						
									try{
										console.log("~~~~~TokenIn EVENT >>>>_mytokenAddress ~~~~~",_mytokenAddress);
										(async()=>{																																			 		
										   var cnt = await db_select(_mychainid, _myorderid, _mysendcoinsTo, _myamount, _mytokenAddress, secretText).catch(console.log);											      											   
										})();									   										   
									}catch(e){
										console.log(">>>>>Catch >>>>",e);									
									}																
								}else{
									console.log(">>>> not matched !!");
								}
							}else{
								console.log(">>> TOKENIN >>>> In for loop, _orderid, _chainid,  _amount, i >>>>", _myorderid, _chainid, _amount, i);						
							}							
						}													 												
		 		});
		// }catch(e){	console.error("<<<< Error >>>>",e); }	 	 	 
}

// DONE changes
async function no_records_found_unfreeze_row(){
	var con6 = mysql.createConnection(DB_CONFIG);
	const query = util.promisify(con6.query).bind(con6);
	const insertquery = util.promisify(con6.query).bind(con6);	
	try{		  	
			var _mywhereclause=" walletid='"+process.env.ADMIN_WALLET+"' AND chainid="+parseInt(process.env.CHAIN_ID);
			var unfreeze_query="UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET isFrozen=0 AND freezetime=NULL WHERE "+_mywhereclause;
			console.log(">>>>> UNFREEZE QUERY >>>>>", unfreeze_query);			
			await query(unfreeze_query).catch(console.log);		
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con6.end();			
	}	
}

// Changes Done
async function	db_select(chainid, orderid, sendcoinsTo, amount, mytokenAddress, secretText){	
	var con6 = mysql.createConnection(DB_CONFIG);
	const query = util.promisify(con6.query).bind(con6);
	const insertquery = util.promisify(con6.query).bind(con6);	
	try{
			var _whereclause = " where chainid="+parseInt(chainid)+" AND orderid="+parseInt(orderid);
			var select_query = "SELECT count(orderid) as rec FROM "+process.env.CONTRACT_ORDERS_TABLE+" "+_whereclause;
			console.log(">>>>>> select_query >>>>>",select_query);			
			var records = await query(select_query).catch(console.log);
			console.log(">>>>>> records <<<<<<",records);			
			if(parseInt(records[0].rec) < 1){				
				var insert_query = "INSERT INTO "+process.env.CONTRACT_ORDERS_TABLE+" (`chainid`,`orderid`,`transactionSent`,`secretText`) VALUES ("+chainid+","+orderid+",0,"+secretText+")";		
				console.log(">>> Inserting record, orderid, chainid >>>",orderid, chainid);
				await insertquery(insert_query).catch(console.log);				
				var z = await company_bridge_send_method(mytokenAddress, sendcoinsTo, amount, orderid, chainid).catch(console.log);				
			}else{
				console.log(">>> Skipping already in database, orderid, chainid ",orderid, chainid);				
			}
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con6.end();			
	}			
}

///Get frozenWallets and which freezetime > 10 mins
async function	db_select_frozenWallets(){
	var con = mysql.createConnection(DB_CONFIG);
	const query = util.promisify(con.query).bind(con);	
	try{	
			var _wherecond = " isFrozen=1 AND chainid="+chainid+" AND freezetime<(UNIX_TIMESTAMP()-600)";
			var select_query = "SELECT walletid, chainid, nonce from "+process.env.NONCE_ADMIN_TABLE+" WHERE "+_wherecond;						
			var wallets = await query(select_query);	
			
			//console.log(">>>>> wallets >>>>", wallets);
			return wallets;
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con.end();			
	}
}

async function unfreezeWallet(_chainid, _walletid){
	console.log("IN UnfreezeWallet function >>> _chainid, _walletid >>>>",_chainid, _walletid);
	var con8 = mysql.createConnection(DB_CONFIG);
	var con9 = mysql.createConnection(DB_CONFIG);
	const query8 = util.promisify(con8.query).bind(con8);	
	const query9 = util.promisify(con9.query).bind(con9);	
	try{	
			var _wherecond = " walletid='"+_walletid+"' AND chainid="+_chainid+" AND freezetime<(UNIX_TIMESTAMP()-600)";
			var update_query = "UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET isFrozen=0,freezetime=0,nonce=NULL WHERE "+_wherecond;						
			console.log("------------------------------------------");			
			console.log(">>UNFREEZING...., UPDATE QUERY<<", update_query)			
			var wallets = await query8(update_query);
			
			var _wherecond1 = " walletid='"+_walletid+"' AND chainid="+BRIDGE_CHAIN+" AND freezetime<(UNIX_TIMESTAMP()-600)";
			var update_query1 = "UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET isFrozen=0,freezetime=0,nonce=NULL WHERE "+_wherecond1;						
			console.log(">>UNFREEZING...., UPDATE QUERY<<", update_query1);
			console.log("------------------------------------------");						
			var wallets1 = await query9(update_query1);
			//console.log(">>>>> wallets >>>>", wallets);
			return wallets;
	}catch(e){
			console.error("ERROR SQL>>Catch",e);
	}finally{
			con8.end();			
	}
}

async function update_nonce(mychain, mywalletid, mynonce){
	var mycon = mysql.createConnection(DB_CONFIG);
	const myquery = util.promisify(mycon.query).bind(mycon);
	try{
		var _wherestr = " walletid='"+mywalletid+"' AND chainid="+mychain; 			
		var update_query = "UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET nonce="+mynonce+" WHERE "+_wherestr;
		myquery(update_query).catch(console.log);	
	}catch(e){
		console.error("ERROR IN SQL UPDATE NONCE >>",e);	
	}finally{
		mycon.end();	
	}
}

async function remove_orderid_from_orders_table(myorderid, mychain){
	var mycon = mysql.createConnection(DB_CONFIG);
	const myquery = util.promisify(mycon.query).bind(mycon);
	try{		
		//var delete_query = "delete from `contract_orders` where `orderid`="+myorderid+" AND `chainid`=34";
		var delete_query = "Delete from `contract_orders` where `transactionSent`=0 AND `secretText`='"+process.env.secretText+"' AND `chainid`="+mychain;
		console.log("<<< Query >>>",delete_query);
		return myquery(delete_query).catch(console.log);		
	}catch(e){
		console.log("ERROR IN SQL DELETE QUERY >>",e);	
	}finally{
		mycon.end();	
	}
}

tryToUnfreezeWallets();

//Every 2 mins
var job = new CronJob('0 */2 * * * *', function() {
	console.log("-------------------------------------");
   console.log('Cron running, every 2 mins');
   console.log("-------------------------------------");
   // DONE Changes
	getAvailableAdminWallet().then(()=>{
			console.log(" >>>> ADMIN_WALLET:, >>>> CHAIN_ID:",process.env.ADMIN_WALLET, process.env.CHAIN_ID);				
			if(process.env.ADMIN_WALLET){		
				(async()=>{
					await web3.eth.getTransactionCount(process.env.ADMIN_WALLET).then((z)=>{				
						process.env.lastnonce = parseInt(z);
						freeze_wallet();	
					}).catch(console.log);	
				})();	
			}else{
				console.log(">>> Admin Wallet not available >>>");									
			}	
	}).catch(console.log);  
}, null, true, 'America/Los_Angeles');
job.start()