const logger = new (require("node-red-contrib-logger"))("array-permutations");
logger.sendInfo("Copyright 2020-2022 Jaroslav Peter Prib");

const combinations=require("./combinations.js");
const combinationLoop=require("./combinationLoop.js");
const permutations=require("./permutations.js");
const permutationLoop=require("./permutationLoop.js");
const permutationRandom=require("./permutationRandom.js");
const permutationsCallable=require("./permutationsCallable.js");
const permutationsCircular=require("./permutationsCircular.js");
const permutationsHeap=require("./permutationsHeap.js");
const permutationsUnique=require("./permutationsUnique.js");

function sendMessages(RED,node,msg,a,i,p,setSize){
	if(p.length<node.setSize){
		let j=(node.unique&&p>0?i+1:i);
		const l=a.length;
    	for(;j<l;j++) sendMessages(RED,node,msg,a,j,p.concat([a[j]]));
	} else {
   		const newMsg=RED.util.cloneMessage(msg);
		node.setData(p,msg)
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
const sendData={
	Loop:function(RED,msg,dataArray) {
		if(logger.active) logger.send({label:"sendDataLoop",_arrayPermIndex:msg._arrayPermIndex});
		if(msg._arrayPerm){
			sendLoop(RED,this,msg);
			return;
		}
		msg._arrayPerm={array:dataArray,arrayLength:dataArray.length+1,index:[],payload:[],level:0};
		for(let i=0;i<this.setSize;i++) msg._arrayPerm.index.push(this.unique?i:0);
		sendLoop(RED,this,msg);
	},
	CombinationLoop:function(RED,msg,dataArray,send,done) {
		if(logger.active) logger.send({label:"sendDataCombinationLoop",_arrayCombo:msg._arrayCombo?msg._arrayCombo:null});
		if(msg._arrayCombo)
			msg._arrayCombo.position++;
		else
			msg._arrayCombo={position:0,combination:[],combinationStack:[],dataArray:dataArray,setSize:this.setSize,subsetEnd:dataArray.length};
		combinationLoop(msg._arrayCombo,
			(combination)=>{
				this.setData(combination,msg);
				send([,,msg],false);
				if(logger.active) logger.send({label:"SendCombinationLoop send",msg:msg});
				done();
			}
			,()=>{
				if(logger.active) logger.send({label:"SendCombinationLoop done"});
				delete msg._arrayCombo;
				this.setData(null,msg);
				send(msg);
				done();
			});
	},
	Combinations:function(RED,msg,dataArray) {
		const combinationsArray=combinations(dataArray,this.setSize,);
		this.setData(combinationsArray,msg);
		this.send(msg,false);
	},
	CombinationMessages:function(RED,msg,dataArray) {
		let arrayCombinationCount=0;
		combinations(dataArray,this.setSize,combination=>{
			const newMsg=RED.util.cloneMessage(msg);
			this.setData(combination,newMsg);
			newMsg._msgid=newMsg._msgid+":"+(++msg.arrayCombinationCount);
			this.send(newMsg,false);
		})
	},
	Messages:function(RED,msg,dataArray) {
		sendMessages(RED,this,msg,dataArray,0,[]);
	},
	Permutations:function(RED,msg,dataArray) {
		const permutationsArray=permutations(dataArray,this.setSize);
		this.setData(permutationsArray,msg);
		this.send(msg,false);
	},
	PermutationsCallable:function(RED,msg,dataArray) {
		this.setData(permutationsCallable(dataArray,this,setSize,this.unique),msg);
		this.send(msg,false);
	},
	PermutationsCallableMessages:function(RED,msg,dataArray) {
		let arrayCount=0;
		const node=this;
		permutationsCallable(dataArray,this,setSize,this.unique,permutation=>{
			const newMsg=RED.util.cloneMessage(msg);
			this.setData(permutation,newMsg);
			newMsg._msgid=newMsg._msgid+":"+(++arrayCount);
			this.send(newMsg,false);
		})
		this.send(msg,false);
	},
	PermutationsCircular:function(RED,msg,dataArray) {
		this.setData(permutationsCircular(dataArray),msg);
		this.send(msg,false);
	},
	PermutationsCircularMessages:function(RED,msg,dataArray) {
		let arrayCount=0;
		const node=this;
		permutationsCircular(dataArray,permutation=>{
			const newMsg=RED.util.cloneMessage(msg);
			this.setData(permutation,newMsg);
			newMsg._msgid=newMsg._msgid+":"+(++arrayCount);
			this.send(newMsg,false);
		})
		this.send(msg,false);
	},
	PermutationsHeap:function(RED,msg,dataArray) {
		const permutationsArray=permutationsHeap(dataArray);
		this.setData(permutationsArray,msg);
		this.send(msg,false);
	},
	PermutationLoop:function(RED,msg,dataArray,send,done) {
		if(logger.active) logger.send({label:"PermutationLoop",_arrayPermutations:msg._arrayPermutations?msg._arrayPermutations:null});
		if(!msg._arrayPermutations)
			msg._arrayPermutations={position:0,permutationStack:[{permutation:[],position:0}],dataArray:dataArray,setSize:this.setSize};
		permutationLoop(msg._arrayPermutations,this.unique,
			(permutation)=>{
				this.setData(permutation,msg);
				send([,,msg],false);
				if(logger.active) logger.send({label:"PermutationLoop send",msg:msg});
				done();
			}
			,()=>{
				if(logger.active) logger.send({label:"PermutationLoop done"});
				delete msg._arrayPermutations;
				this.setData(null,msg);
				send(msg);
				done();
			});
	},
	PermutationRandom:function(RED,msg,dataArray) {
		permutationRandom(dataArray)
		this.send(msg,false);
	},
	PermutationUnique:function(RED,msg,dataArray) {
		permutationUnique(dataArray)
		this.send(msg,false);
	},
	PermutationUniqueMessages:function(RED,msg,dataArray) {
		let arrayCount=0;
		const node=this;
		permutationsUnique(dataArray,permutation=>{
			const newMsg=RED.util.cloneMessage(msg);
			this.setData(permutation,newMsg);
			newMsg._msgid=newMsg._msgid+":"+(++arrayCount);
			this.send(newMsg,false);
		})
		this.send(msg,false);
	},
};
module.exports = function (RED) {
    function arrayPermutationsNode(n) {
		if(logger.active) logger.send({label:"settings",node:n});
        RED.nodes.createNode(this, n);
        let node=Object.assign(this,n);
        node.unique=(node.unique=="true");
        try{
        	node.getData=eval("((msg,node)=>"+(node.arrayProperty||"msg.payload")+")");
        	node.setData=eval("(data,msg,)=>{"+(node.arrayTarget||"msg.payload")+"=data;}");
        	if(node.action in sendData)
        		node.sendData=sendData[node.action].bind(node);
        	else 
        		throw Error("Method function "+node.action+" not found");
        	node.status({fill:"green",shape:"ring"});
        } catch(ex) {
    		node.error(ex.message);
        	node.status({fill:"red",shape:"ring",text:"Invalid setup "+ex.message});
        } 

        node.on("input", function(msg,send,done) {
            try {
				send=send||function(){node.send.apply(node,arguments)}
            	const dataArray=node.getData(msg,node);
            	if(msg._arrayPerm||msg._arrayPerm) {
            		node.sendData(RED,msg,dataArray,send,done);
            		return;
            	}
            	if(!(Array.isArray(dataArray)))  throw Error(node.arrayProperty+ " is not array");
            	if(node.setSize>dataArray.length) throw Error("Set size of "+node.setSize+" > array "+dataArray.length);
            	if(dataArray.length*node.setSize>100) node.status({fill:"yellow",shape:"ring",text:"large number messages array size: "+dataArray.length+" set size:"+node.setSize})
            	node.sendData(RED,msg,dataArray,send,done);
            } catch(ex) {
				if(logger.active) logger.sendError({error:ex.message,stack:ex.stack});
            	node.status({fill:"red",shape:"ring",text:"Failure "+ex.message});
            	node.error(ex.message);
            	msg.error=ex.message;
            	node.send([null,msg]);
            }
       });
    }
    RED.nodes.registerType("Array Permutations",arrayPermutationsNode);
    RED.nodes.registerType("Array Combinations",arrayPermutationsNode);
};