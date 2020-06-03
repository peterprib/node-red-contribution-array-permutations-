const Logger = require("node-red-contrib-logger");
const logger = new Logger("array-permutations");
logger.sendInfo("Copyright 2020 Jaroslav Peter Prib");

function sendMessages(RED,node,msg,a,i,p,setSize){
	if(p.length<node.setSize){
		let j=(node.unique&&p>0?i+1:i);
		const l=a.length;
    	for(;j<l;j++) sendMessages(RED,node,msg,a,j,p.concat([a[j]]));
	} else {
   		const newMsg=RED.util.cloneMessage(msg);
   	 	newMsg.payload=p;
   	 	newMsg._msgid=newMsg._msgid+":"+(++msg._arrayPermCount);
   	 	node.send(newMsg);
	}
}

function sendLoop(RED,node,msg){
//	if(logger.active) logger.send({label:"sendLoop",setSize:node.setSize,arrayPerm:msg._arrayPerm});
	const base=msg._arrayPerm,
		arrayData=base.array,
		j=base.index[base.level];
	if(base.level<0){
		delete msg._arrayPerm;
		msg.payload=null;
		node.send(msg);
		return;
	}
	if(base.level<node.setSize) {
		if(j<base.arrayLength) {
			base.level++;
			sendLoop(RED,node,msg);
		} else {
			base.level--;
			base.index[base.level]++;
			base.index[base.level+1]=base.index[base.level]+(node.unique&&base.level>0?1:0);
			sendLoop(RED,node,msg);
		}
	} else {
		msg.payload=[];
		for(var i=0;i<node.setSize;i++) {
			const v=arrayData[base.index[i]];
			if(v) msg.payload.push(v);
			else break;
		}
		base.level--;
		base.index[base.level]++;
		if(i<node.setSize) sendLoop(RED,node,msg);
		else node.send([null,null,msg]);
	}
}

module.exports = function (RED) {
    function arrayPermutationsNode(n) {
		if(logger.active) logger.send({label:"settings",node:n});
        RED.nodes.createNode(this, n);
        let node=Object.assign(this,n);
        node.unique=(node.unique=="true");
        node.sendDataMessages=function(msg,a) {
        	msg._arrayPermCount=0;
        	sendMessages(RED,node,msg,a,0,[]);
        };
        node.sendDataLoop=function(msg,a) {
       		if(logger.active) logger.send({label:"sendDataLoop",_arrayPermIndex:msg._arrayPermIndex});
       		if(msg._arrayPerm){
       			sendLoop(RED,node,msg);
       			return;
       		}
   			msg._arrayPerm={array:a,arrayLength:a.length+1,index:[],payload:[],level:0};
   			for(let i=0;i<node.setSize;i++) msg._arrayPerm.index.push(node.unique?i:0);
   			sendLoop(RED,node,msg);
        };
        try{
        	node.getData=eval("((msg,node)=>"+(node.arrayProperty||"msg.payload")+")");
        	if("sendData"+node.action in node)
        		node.sendData=node["sendData"+node.action];
        	else 
        		throw Error("Method function "+node.action+" not found");
        	node.status({fill:"green",shape:"ring"});
        } catch(ex) {
    		node.error(ex.message);
        	node.status({fill:"red",shape:"ring",text:"Invalid setup "+ex.message});
        } 

        node.on("input", function(msg) {
            try {
            	const a=node.getData(msg,node);
            	if(msg._arrayPerm) {
            		node.sendData(msg,a);
            		return;
            	}
            	if(!(Array.isArray(a)))  throw Error(node.arrayProperty+ " is not array");
            	if(node.setSize>a.length) throw Error("Set size of "+node.setSize+" > array "+a.length);
            	if(a.length*node.setSize>100) node.status({fill:"yellow",shape:"ring",text:"large number messages array size: "+a.length+" set size:"+node.setSize})
            	node.sendData(msg,a);
            } catch(ex) {
            	node.status({fill:"red",shape:"ring",text:"Failure "+ex.message});
            	node.error(ex.message);
            	msg.error=ex.message;
            	node.send([null,msg]);
            }
       });
    }
    RED.nodes.registerType("Array Permutations",arrayPermutationsNode);
};