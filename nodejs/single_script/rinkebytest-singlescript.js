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
var CHAIN = {'chain':'rinkeby'};

var INFURA_PROVIDER = "https://rinkeby.infura.io/v3/8102c6c81e12418588c89d69ac7a3f04";
var CONTRACT_ADDR = '0xB6495879f4f88D3563B52c097Cb009E286586137';
var DITHEREUM_CONTRACT_ADDR = '0x4ADAc95aFD1391B796411FAe609968ccAd6CA4a5';
var CONTRACT_ADDR_ABI = JSON.parse(process.env.BRIDGE_ABI);
var TOKEN_ADDRESS = "0x232A1fD8742a606238B53B7babA5fEe5835f3c97";  

var CONTRACTS_ARY=[];
CONTRACTS_ARY[34] = '0xA577f051Ab5e5Bc30fFB9D981841a0e4691dDcDB';
CONTRACTS_ARY[4] = '0xd3a6358920aAE3DA2aDD4B9dBA4059799f89fa48';
CONTRACTS_ARY[97] = '0xF4905930BB56F9Aeb520de0897c9283d0B3624eE';
CONTRACTS_ARY[137] = '0x07F25AcFf1F0e725Df3997b3092DC594B1d7a496';
CONTRACTS_ARY[256] = '0xdF310a187Bb35A0B0090DC7Cb2C2F784Ccf72036';

// FOR RINKEBY 
var chainid = 4; // rinkeby
var BRIDGE_CHAIN = 34; // TESTNET
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
var ETH_TOKEN_ADDRESS = "0x232A1fD8742a606238B53B7babA5fEe5835f3c97";
var BNB_TOKEN_ADDRESS = "0x57012f5fE63a47a668b1fF9f6eF3D234A22e8C19";
var MATIC_TOKEN_ADDRESS = "0xf2A16551D5ab32acf690548DcFaB1302224B9926";
var HT_TOKEN_ADDRESS = "0x5277346c4534028C535A7e8660c491DEB63A2155";
var DUSD_TOKEN_ADDRESS = "0xE82E083195012A69deBce378fFA014b9721D780A";

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
//MATIC_MAIN NET 
CHAINID_URL[137] = 'https://polygon-rpc.com';


// CHANGES DONE
async function	getAvailableAdminWallet(){	
	var con5 = mysql.createConnection(DB_CONFIG);
	const query5 = util.promisify(con5.query).bind(con5);	
	try{
			var _mywherecondition = " isFrozen=0 AND chainid="+chainid+" AND freezetime<(UNIX_TIMESTAMP()-600) limit 1";
			var select_wallet_query = "SELECT * FROM "+process.env.NONCE_ADMIN_TABLE+" WHERE "+_mywherecondition;
			console.log(">>>> Query >>>>", select_wallet_query);			
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
			console.log("ERROR SQL>>Catch",e);
	}finally{
			con5.end();			
	}			
}


////// Unfreeze Wallets 
function tryToUnfreezeWallets(){
	/// This will remove/unfreeze maximum two wallets if present in noncetable and freezed/locked 
	db_select_frozenWallets().then((frozenWallets)=>{		
			   console.log("Frozen Wallet Length >>>>",frozenWallets.length);
				if(frozenWallets.length > 0){					
					//console.log(">>>> frozenWallets >>>>",frozenWallets[0]);								
					frozenWallets.forEach((walet)=>{							
						(async()=>{					
							console.log("##>> Walet ##>>",walet);
							await gTransactionCount(walet).then((transcount)=>{
								console.log("#> Waletid, TransactionCount, walet.nonce, walet.chainid >>>>>",walet.walletid, transcount, walet.nonce, walet.chainid);								
								if((parseInt(walet.nonce) <= parseInt(transcount)) || (walet.nonce === undefined) || (walet.nonce === null) ){
									console.log(">>>>>>>>>########<<<<<<<<<<");
									console.log(">>>>> Removing from noncetable and unfreezing for >>> walet.walletid, walet.chainid >>>", walet.walletid, walet.chainid);
									unfreezeWallet(walet.chainid, walet.walletid);
									console.log(">>>>>>>>>########<<<<<<<<<<");									
								}
							}).catch(console.log);
						})();						
					})												
				}
	}).catch(console.log);
}

async function gTransactionCount(mywallet){		
		console.log(">>>>>> mywallet.walletid, mywallet.chainid  >>>>", mywallet.walletid, mywallet.chainid);		
		let myweb3 = new Web3(new Web3.providers.HttpProvider(INFURA_PROVIDER));			
		return await myweb3.eth.getTransactionCount(mywallet.walletid).catch(console.log);		
}

process.env.lastnonce = 0;

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


/// FOR BRIDGE - 
async function	getAvailableAdminWallet_bridge(){	
	var con5 = mysql.createConnection(DB_CONFIG);
	const query5 = util.promisify(con5.query).bind(con5);
	try{
			var _mywherecondition = " isFrozen=0 AND chainid="+BRIDGE_CHAIN+" AND freezetime<(UNIX_TIMESTAMP()-600) limit 1";
			var select_wallet_query = "SELECT * FROM "+process.env.NONCE_ADMIN_TABLE+" WHERE "+_mywherecondition;
			console.log(">>>> Bridge Query >>>>", select_wallet_query);			
			var _adminwallet = await query5(select_wallet_query).catch(console.log);			
			console.log("<<<< Bridge Available Wallet >>>> ", _adminwallet[0]);			
			if(_adminwallet[0]){
				process.env.ADMIN_WALLET_BRIDGE=_adminwallet[0].walletid;
				process.env.ADMIN_WALLET_PK_BRIDGE=_adminwallet[0].walletpk;
				process.env.CHAIN_ID_BRIDGE=_adminwallet[0].chainid;				
				///
				await web3.eth.getTransactionCount(process.env.ADMIN_WALLET_BRIDGE).then((z)=>{				
					process.env.lastnonce_bridge = parseInt(z);
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
			console.log("ERROR SQL>>Catch",e);
	}finally{
			con5.end();			
	}			
}



var filter = {'to': CONTRACT_ADDR.toString()}

const options = {
    timeout: 30000,
    reconnect: {
      auto: true,
      delay: 5000,
      maxAttempts: 20,
      onTimeout: true,
    },
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 60000,
      maxReceivedFrameSize: 100000000,
      maxReceivedMessageSize: 100000000,
    },
};

// When coinIn -> tokenOut
async function bridge_sendmethod(_toWallet, _amt, orderid, _chainid){
    //_amt = Math.floor(_amt / 1000000000); /// JUST TO TEST SOME RANDOM AMT TO MAKE SMALL	 
	 let bridgeweb3 = new Web3(new Web3.providers.HttpProvider(CHAINID_URL[BRIDGE_CHAIN].toString()));	 
	 console.log("<<>>CHAINID_URL[BRIDGE_CHAIN]<<>>",CHAINID_URL[BRIDGE_CHAIN].toString());		    
    web3.eth.handleRevert = true;  		    

	 try{
    		var company_bridgeinstance = new bridgeweb3.eth.Contract(CONTRACT_ADDR_ABI, DITHEREUM_CONTRACT_ADDR.toString());		    	
    }catch(e){
			console.log(" >>>>> EEEEE >>>>",e);		    
    }
    
    await getAvailableAdminWallet_bridge();
          
    var mydata = await company_bridgeinstance.methods.tokenOut(TOKEN_ADDRESS.toString(), _toWallet.toString(), _amt.toString(), orderid.toString(), _chainid.toString()).encodeABI();
    console.log(">>>>myData >>>>",mydata);
    console.log(">>>With admin wallet >>>",process.env.ADMIN_WALLET_BRIDGE.toString());
    console.log('>> with deails TOKEN_ADDRESS, _toWallet, _amt, orderid, _chainid >>>', TOKEN_ADDRESS, _toWallet, _amt, orderid, _chainid);    
    var requiredGas = await company_bridgeinstance.methods.tokenOut(TOKEN_ADDRESS, _toWallet, _amt, orderid, _chainid).estimateGas({from: process.env.ADMIN_WALLET_BRIDGE.toString()});    
    console.log(">>>>> REQUIRED GAS, >>> bridge_admin_wallet <<<<<",requiredGas, process.env.ADMIN_WALLET_BRIDGE.toString());     		
 
  	 (async()=>{
		  await bridgeweb3.eth.getGasPrice().then(gasPrice=>{
 	 	  		 console.log(">>>>> @@@@@ <<<<< NEW NONCE >>>>",process.env.lastnonce_bridge);                    			                    				                    			                                                                  
		       const raw_tx = {   
		           nonce: web3.utils.toHex(parseInt(process.env.lastnonce_bridge)),                    
		           gasPrice: web3.utils.toHex(gasPrice),
		           gasLimit: requiredGas,
		           from: process.env.ADMIN_WALLET_BRIDGE.toString(),
		           to: CONTRACT_ADDR.toString(),                        
		           value: '0x0',
		           data: mydata 
		       }; 
		       process.env.lastnonce_bridge = parseInt(process.env.lastnonce_bridge)+1;
		       
		       console.log("raw_tx >>>>",raw_tx);                                                                   		 									 
		       var tx = new Tx(raw_tx, CHAIN);                            		                            		                            
		       var privateKey = Buffer.from(process.env.ADMIN_WALLET_PK_BRIDGE.toString(), 'hex');		                            
				 console.log(">>>> PrivateKey, Bridge Admin Walletpk >>>>>", privateKey, process.env.ADMIN_WALLET_PK_BRIDGE.toString());									 											 														 																						                            
		       tx.sign(privateKey);                        
		       var serializedTx = tx.serialize();
		       (async()=>{
		       	 console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
		       	 console.log(">>>> Sending Signed Transaction >>>>> In Async Function >>>>>");
		       	 console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
					 try{
					  update_nonce_admin_table(process.env.lastnonce_bridge, 1);					  					 
					  await bridgeweb3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
					 	 if (err) { 
					   	 console.log(err);
					       return; 
					  	 }else{
					   	 console.log("Transaction Hash >>>",hash);
					 	}
					 })
					}catch(e){
						console.log(">>>>catch >>>",e);		
					}					 				 	 		       	
		       })();		    		                                                                                                                   
		  }) 
	 })();	
}

async function company_bridge_send_method( _tokenaddr ,_toWallet, _amt, orderid, _chainid){	  
	  // not valid token addr	 
	  if(_tokenaddr !== (ETH_TOKEN_ADDRESS || BNB_TOKEN_ADDRESS || MATIC_TOKEN_ADDRESS || HT_TOKEN_ADDRESS || DUSD_TOKEN_ADDRESS)){	  	
	  	  	return 1;
	  }
	 if(! CHAINID_URL[_chainid]){
    	console.log(">>> not valid chainid >>>", _chainid);
    	return;
    }    
    //_amt = Math.floor(_amt / 1000000000); /// JUST TO TEST SOME RANDOM AMT TO MAKE SMALL    		           
    let bridgeweb3 = new Web3(new Web3.providers.HttpProvider(CHAINID_URL[_chainid]));
    console.log(">>>> ChainID >>>",CHAINID_URL[_chainid]);		    
    web3.eth.handleRevert = true; 		    
	
	 try{
	 		console.log(">>>>>Calling Contract>>>> CONTRACTS_ARY[_chainid]>>>>",CONTRACTS_ARY[_chainid]);
    		var company_bridgeinstance = new bridgeweb3.eth.Contract(CONTRACT_ADDR_ABI, CONTRACTS_ARY[_chainid].toString());		    	
    }catch(e){
			console.log(" >>>>> EEEEE >>>>",e);		    
    }

	 await getAvailableAdminWallet_bridge();
	         
    var mydata = await company_bridgeinstance.methods.tokenOut(_tokenaddr.toString(), _toWallet.toString(), _amt.toString(), orderid.toString(), _chainid.toString()).encodeABI();    
	 console.log("<><>## myData ##<><>",mydata);    
	 console.log(">>>With admin wallet >>>",process.env.ADMIN_WALLET_BRIDGE.toString());
	 console.log('>> with details TOKEN_ADDRESS, _toWallet, _amt, orderid, _chainid >>', TOKEN_ADDRESS, _toWallet, _amt, orderid, _chainid);
    var requiredGas = await company_bridgeinstance.methods.tokenOut(TOKEN_ADDRESS, _toWallet, _amt, orderid, _chainid).estimateGas({from: process.env.ADMIN_WALLET_BRIDGE.toString()});    
    console.log(">>>>> REQUIRED GAS, >>> bridge_admin_wallet <<<<<",requiredGas, process.env.ADMIN_WALLET_BRIDGE.toString());     		
 
  	 (async()=>{
		  await bridgeweb3.eth.getGasPrice().then(gasPrice=>{
 	 	  		 console.log(">>>>> @@@@@ <<<<< NEW NONCE >>>>",process.env.lastnonce_bridge);                    			                    				                    			                                                                  
		       const raw_tx = {   
		           nonce: web3.utils.toHex(parseInt(process.env.lastnonce_bridge)),                    
		           gasPrice: web3.utils.toHex(gasPrice),
		           gasLimit: requiredGas,
		           from: process.env.ADMIN_WALLET_BRIDGE.toString(),
		           to: CONTRACT_ADDR.toString(),                        
		           value: '0x0',
		           data: mydata 
		       }; 
		       process.env.lastnonce_bridge = parseInt(process.env.lastnonce.bridge)+1;		       
		       console.log("raw_tx >>>>",raw_tx);                                                                   		 									 
		       var tx = new Tx(raw_tx, CHAIN);                            		                            		                            
		       var privateKey = Buffer.from(process.env.ADMIN_WALLET_PK_BRIDGE.toString(), 'hex');		                            
				 console.log(">>>> PrivateKey, Bridge Admin Walletpk >>>>>", privateKey, process.env.ADMIN_WALLET_PK.toString());									 											 														 																						                            
		       tx.sign(privateKey);                        
		       var serializedTx = tx.serialize();
		       (async()=>{
		       	 console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
		       	 console.log(">>>> Sending Signed Transaction >>>>> In Async Function >>>>>");
		       	 console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
					 try{
					  update_nonce_admin_table(process.env.lastnonce_bridge, 1);					 
					  await bridgeweb3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
					 	 if (err) { 
					   	 console.log(err);
					       return; 
					  	 }else{
					   	 console.log("Transaction Hash >>>",hash);
					 	}
					 })
					}catch(e){
						console.log(">>>>catch >>>",e);		
					}					 				 	 		       	
		       })();		    		                                                                                                                   
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
			console.log("ERROR SQL>>Catch",e);
	}finally{
			con7.end();			
	}
}

async function checkLatestBlock(){
	 //######  UNCOMMENT BELOW LINE FOR 100 BLOCKS  ######//
 	 var toblock =  await web3.eth.getBlockNumber();
 	 var fromblock = toblock-5000;
 	 
 	 // For testing 	  	  
 	 //var toblock=9668500;
 	 //var fromblock=9668200;	
 	 console.log(">>TESTING FOR>>toblock>>,fromblock>>",toblock, fromblock); 
	 getEventData_CoinIn(fromblock, toblock);	 
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
			console.log("ERROR SQL>>Catch",e);
	}finally{
			con8.end();			
	}
}


/// SET THIS FOR EACH CHAIN 
var getwsprovider = () =>{     
	 var httpprovider = new Web3(new Web3.providers.HttpProvider(INFURA_PROVIDER, options));     
    return httpprovider
}

let web3 = new Web3(getwsprovider());

async function getEventData_CoinIn(_fromBlock, _toBlock){
	 const myinstance = new web3.eth.Contract(CONTRACT_ADDR_ABI, CONTRACT_ADDR.toString());
	 try{				
		 		await myinstance.getPastEvents('CoinIn',  {
		 				'filter':{'orderID': myorderID},
		 				fromBlock: _fromBlock,       
						toBlock: _toBlock
		    	},function(error,events){	    	
		    		try{
		    			console.log(error);	
		    			if(events === undefined){
		    				return
		    			}	 				
		 				var eventlen = events.length;
		 				process.env.CoinInEventLen = events.length;
		 				//console.log("COIN IN >>> eventlen >>>>", eventlen);		 				
		 				
		 				for(var i=0;i<eventlen; i++){		
		 					var eve = events[i];		 					
 				         /////emit CoinIn(orderID, msg.sender, msg.value)
		 					var _blkNumber = eve.blockNumber;			 									
		 					var _orderid = eve.returnValues.orderID;							
							var _sendcoinsTo = eve.returnValues.user;
							var _amount = eve.returnValues.value;
							var _chainid = eve.returnValues.chainID ? eve.returnValues.chainID : BRIDGE_CHAIN.toString();
							//console.log(">>>>eve<<<<",eve.returnValues);  
							//console.log(">>>>> CHAIN id, Order Id >>>>",_chainid, _orderid);							
							if(_chainid && (parseInt(_amount))){							
								try{
									(async()=>{																																			 		
									   var cnt = await db_select_coinin(_chainid, _orderid, _sendcoinsTo, _amount).catch(console.log);											      											   
									})();									   										   
								}catch(e){
									console.log(">>>>>Catch >>>>",e);									
								}																
							}else{
								console.log(">>>> CoinIn >>>>In for loop, _orderid, _chainid,  _amount, i >>>>", _orderid, _chainid, _amount, i);						
							}														
						}
					}catch(e){
							console.log(e);
					}					
		 		});
		 		////
		 }catch(e){	console.log("<<<< Error >>>>",e); }	 	 	 
}


async function getEventData_TokenIn(_fromBlock, _toBlock){ 
	 const myinstance = new web3.eth.Contract(CONTRACT_ADDR_ABI, CONTRACT_ADDR.toString());	 	 
	 try{
		 		await myinstance.getPastEvents('TokenIn', {	'filter':{'orderID': myorderID},	fromBlock: _fromBlock, toBlock: _toBlock },function(error,myevents){		    			
		 				console.log(error);
		 				if(myevents === undefined){
		 					return
		 				}		 				
		 				var myeventlen = myevents.length;		
		 				process.env.TokenInEventLen = myevents.length;
		 				if((parseInt(process.env.CoinInEventLen) === 0) && (parseInt(process.env.TokenInEventLen) === 0)){
		 						// UNFREEZE ROW as no events found in specified block range 
								no_records_found_unfreeze_row()
						}	
						console.log("================================================="); 								 				
		 				console.log("TOKEN IN >>> myeventlen >>>>", myeventlen);		 		
		 				console.log("=================================================");		
		 				for(var k=0; k<myeventlen;k++){		 						 	
		 					var myeve = myevents[k];		 					
		 					//console.log("~~~~~~~~~~~~~~~~~~~>>> k, myeve >>>",k, myeve);							
		 					var _myblkNumber = myeve.blockNumber;					
		 					var _myorderid = myeve.returnValues.orderID;
							var _mytokenAddress = myeve.returnValues.tokenAddress;
							var _mysendcoinsTo = myeve.returnValues.user;
							var _myamount = myeve.returnValues.value;
							var _mychainid = myeve.returnValues.chainID;
							//console.log(">>>>>### TokenIn eventlen, k, 	 id, Order Id >>>>",myeventlen, k, _mychainid, _myorderid);
							if(_mychainid && (parseInt(_myamount))){	
								//console.log(">>>> Looking for >>>>", _mytokenAddress);
								if(_mytokenAddress == (ETH_TOKEN_ADDRESS || BNB_TOKEN_ADDRESS || MATIC_TOKEN_ADDRESS || HT_TOKEN_ADDRESS || DUSD_TOKEN_ADDRESS)){						
									try{
										console.log("~~~~~_mytokenAddress ~~~~~",_mytokenAddress);
										(async()=>{																																			 		
										   var cnt = await db_select(_mychainid, _myorderid, _mysendcoinsTo, _myamount, _mytokenAddress).catch(console.log);											      											   
										})();									   										   
									}catch(e){
										console.log(">>>>>Catch >>>>",e);									
									}																
								}
							}else{
								console.log(">>> TOKENIN >>>> In for loop, _orderid, _chainid,  _amount, i >>>>", _myorderid, _chainid, _amount, i);						
							}							
						}													 												
		 		});
		 }catch(e){	console.log("<<<< Error >>>>",e); }	 	 	 
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
			console.log("ERROR SQL>>Catch",e);
	}finally{
			con6.end();			
	}	
}

// Changes Done
async function	db_select(chainid, orderid, sendcoinsTo, amount, mytokenAddress){	
	var con6 = mysql.createConnection(DB_CONFIG);
	const query = util.promisify(con6.query).bind(con6);
	const insertquery = util.promisify(con6.query).bind(con6);	
	try{
			var _whereclause = " where chainid="+parseInt(chainid)+" AND orderid="+parseInt(orderid);
			var select_query = "SELECT count(orderid) as rec FROM "+process.env.CONTRACT_ORDERS_TABLE+" "+_whereclause;
			console.log(">>>>>> select_query >>>>>",select_query);			
			var records = await query(select_query).catch(console.log);			
			if(parseInt(records[0].rec) < 1){
				var insert_query = "INSERT INTO "+process.env.CONTRACT_ORDERS_TABLE+" (`chainid`,`orderid`) VALUES ("+chainid+","+orderid+")";		
				console.log(">>> Inserting record, orderid, chainid >>>",orderid, chainid);
				await insertquery(insert_query).catch(console.log);				
				var z = await company_bridge_send_method(mytokenAddress, sendcoinsTo, amount, orderid, chainid).catch(console.log);				
			}else{
				console.log(">>> Skipping already in database, orderid, chainid ",orderid, chainid);
			}
	}catch(e){
			console.log("ERROR SQL>>Catch",e);
	}finally{
			con6.end();			
	}			
}

async function	db_select_coinin(chainid, orderid, sendcoinsTo, amount){	
	var con6 = mysql.createConnection(DB_CONFIG);
	const query = util.promisify(con6.query).bind(con6);
	const insertquery = util.promisify(con6.query).bind(con6);	
	try{
			var _whereclause = " where chainid="+parseInt(chainid)+" AND orderid="+parseInt(orderid);
			var select_query = "SELECT count(orderid) as rec FROM "+process.env.CONTRACT_ORDERS_TABLE+" "+_whereclause;
			console.log(">>>>>> select_query >>>>>",select_query);			
			var records = await query(select_query).catch(console.log);			
			if(parseInt(records[0].rec) < 1){
				var insert_query = "INSERT INTO "+process.env.CONTRACT_ORDERS_TABLE+" (`chainid`,`orderid`) VALUES ("+chainid+","+orderid+")";		
				console.log(">>> Inserting record, orderid, chainid >>>",orderid, chainid);
				await insertquery(insert_query).catch(console.log);				
				var z = await bridge_sendmethod(sendcoinsTo, amount, orderid, chainid).catch(console.log);				
			}else{
				console.log(">>> Skipping already in database, orderid, chainid ",orderid, chainid);
			}
	}catch(e){
			console.log("ERROR SQL>>Catch",e);
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
			console.log("ERROR SQL>>Catch",e);
	}finally{
			con.end();			
	}
}

async function unfreezeWallet(_chainid, _walletid){
	console.log("IN UnfreezeWallet >>> _chainid, _walletid >>>>",_chainid, _walletid);
	var con8 = mysql.createConnection(DB_CONFIG);
	var con9 = mysql.createConnection(DB_CONFIG);
	const query8 = util.promisify(con8.query).bind(con8);	
	const query9 = util.promisify(con9.query).bind(con9);	
	try{	
			var _wherecond = " walletid='"+_walletid+"' AND chainid="+_chainid+" AND freezetime<(UNIX_TIMESTAMP()-600)";
			var update_query = "UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET isFrozen=0,freezetime=0,nonce=NULL WHERE "+_wherecond;						
			console.log(">>UNFREEZING...., UPDATE QUERY<<", update_query)			
			var wallets = await query8(update_query);
			
			var _wherecond1 = " walletid='"+_walletid+"' AND chainid="+BRIDGE_CHAIN+" AND freezetime<(UNIX_TIMESTAMP()-600)";
			var update_query1 = "UPDATE "+process.env.NONCE_ADMIN_TABLE+" SET isFrozen=0,freezetime=0,nonce=NULL WHERE "+_wherecond1;						
			console.log(">>UNFREEZING...., UPDATE QUERY<<", update_query1)			
			var wallets1 = await query9(update_query1);
			//console.log(">>>>> wallets >>>>", wallets);
			return wallets;
	}catch(e){
			console.log("ERROR SQL>>Catch",e);
	}finally{
			con8.end();			
	}
}

tryToUnfreezeWallets();