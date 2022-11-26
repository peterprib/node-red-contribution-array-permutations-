const logger = new (require("node-red-contrib-logger"))("permutationsCallable");
logger.sendInfo("Copyright 2022 Jaroslav Peter Prib");
function permutationsCallable(dataArray,setSize=dataArray.length,unique,call=(perm,agg)=>agg.push(perm),agg=[]){
    if(setSize==0||dataArray.length==0) return agg;
    if(unique==true) permutationsCallableUnique(dataArray,setSize,call,agg)
    else permutationsCallableAll(dataArray,setSize,call,agg)
    return agg;
}
function permutationsCallableAll(dataArray,setSize,call,agg,answerSet=[]){
	if(setSize>0){
		const l=dataArray.length;
    	for(let j=0;j<l;j++)
            permutationsCallableAll(dataArray,setSize-1,call,agg,[...answerSet,dataArray[j]]);
	} else {
        call(answerSet,agg)
	}
}
function permutationsCallableUnique(dataArray,setSize,call,agg,answerSet=[],offset=0){
	if(setSize>0){
		const l=dataArray.length;
    	for(let j=offset;j<l;j++)
            permutationsCallableUnique(dataArray,setSize-1,call,agg,[...answerSet,dataArray[j]],j+1);
	} else {
        call(answerSet,agg)
	}
}
module.exports=permutationsCallable;