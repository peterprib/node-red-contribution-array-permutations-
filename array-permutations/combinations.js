const logger = new (require("node-red-contrib-logger"))("combinations");
logger.sendInfo("Copyright 2022 Jaroslav Peter Prib");
function combinations(dataArray,k=dataArray.length,call=c=>c,combination=[],subsetStart=0,subsetEnd=dataArray.length){
	const answerSet=[];
 	if(k>1){
		const lastUsable=subsetEnd-k+1
		for(let i=subsetStart; i<lastUsable; i++){
			const result=combinations(dataArray,k-1,call,[...combination,dataArray[i]],i+1,subsetEnd);
			if(result) answerSet.push(...result)
		}
	}else{
		for(let i=subsetStart; i<subsetEnd; i++) {
			const result=call([...combination,dataArray[i]]);
			if(result) answerSet.push(result)
		}
	}
	return answerSet;
}
module.exports=combinations;