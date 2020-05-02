const Logger = require("node-red-contrib-logger");
const logger = new Logger("array-permutations");
logger.sendInfo("Copyright 2019 Jaroslav Peter Prib");

function sendMessages(RED,node,msg,a,i,p,setSize){
	if(p.length<node.setSize){
		let j=(node.unique&&p>0?i+1:i);
		const l=a.length;
    	for(;j<l;j++) sendMessages(RED,node,msg,a,j,p.concat([a[j]]));
	} else {
   		const newMsg=RED.util.cloneMessage(msg);
   	 	newMsg.payload=p;
   	 	node.send(newMsg);
	}
}

function sendLoop(RED,node,msg){
	if(logger.active) logger.send({label:"sendLoop",setSize:node.setSize,arrayPerm:msg._arrayPerm});
	const base=msg._arrayPerm,
		j=base.index[base.level];
	if(base.level<0){
		delete msg._arrayPerm;
		msg.payload=null;
		node.send(msg);
		return;
	}
	if(base.level<node.setSize) {
		if(logger.active) logger.send({label:"sendLoop low level",j:j});
		if(j<base.arrayLength) {
			if(logger.active) logger.send({label:"sendLoop up level"});
			base.level++;
			sendLoop(RED,node,msg);
		} else {
			if(logger.active) logger.send({label:"sendLoop down level"});
			base.level--;
			base.index[base.level]++;
			base.index[base.level+1]=base.index[base.level]+(node.unique&&base.level>0?1:0);
			sendLoop(RED,node,msg);
		}
	} else {
		if(logger.active) logger.send({label:"sendLoop top level",j:j});
//		if(j<base.arrayLength) {
			msg.payload=[];
			for(var i=0;i<node.setSize;i++) msg.payload.push(base.index[i]);
			base.level--;
			base.index[base.level]++;
			if(logger.active) logger.send({label:"sendLoop loop",base:base});
   	 		node.send([null,msg]);
//		} else {
//			if(logger.active) logger.send({label:"sendLoop down level"});
//			base.level--;
//			base.index[base.level]++;
//			sendLoop(RED,node,msg);
//  	 	}
	}
}

module.exports = function (RED) {
    function arrayPermutationsNode(n) {
		if(logger.active) logger.send({label:"settings",node:n});
        RED.nodes.createNode(this, n);
        let node=Object.assign(this,n);
        node.unique=(node.unique=="true");
        node.sendDataMessages=function(msg,a) {
        	sendMessages(RED,node,msg,a,0,[]);
        	delete msg;
        };
        node.sendDataLoop=function(msg,a) {
       		if(logger.active) logger.send({label:"sendDataLoop",_arrayPermIndex:msg._arrayPermIndex});
       		if(msg._arrayPerm){
       			sendLoop(RED,node,msg);
       			return;
       		}
   			msg._arrayPerm={array:a,arrayLength:a.length+1,index:[],payload:[],level:0};
   			for(let i=0;i<node.setSize;i++) msg._arrayPerm.index.push(0);
   			sendLoop(RED,node,msg);
        };
        try{
        	node.getData=eval("((msg,node)=>"+(node.arrayProperty||"msg.payload")+")");
        	if("sendData"+node.action in node)
        		node.sendData=node["sendData"+node.action];
        	else 
        		throw Error("Method function "+node.action+" not found");
        } catch(e) {
    		node.error(e);
        	node.status({fill:"red",shape:"ring",text:"Invalid setup "+e.toString()});
        } 

        node.on("input", function(msg) {
            try {
            	const a=node.getData(msg);
            	if(!(Array.isArray(a)))  throw Error(node.arrayProperty+ " is not array");
            	if(node.setSize>a.length) throw Error("Set size of "+node.setSize+" > array "+a.length);
            	node.sendData(msg,a);
            } catch(ex) {
            	node.error(ex,msg);
            }
       });
    }
    RED.nodes.registerType("Array Permutations",arrayPermutationsNode);
};