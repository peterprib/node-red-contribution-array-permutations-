const logger = new (require("node-red-contrib-logger"))("permutations");
logger.sendInfo("Copyright 2022 Jaroslav Peter Prib");
function permutations(dataArray,k=dataArray.length,call=p=>p,permutation=[],subsetStart=0,subsetEnd=dataArray.length){
	const answerSet=[];
 	if(k>1){
		for(let i=subsetStart; i<subsetEnd; i++){
			const result=permutations(dataArray,k-1,call,[...permutation,dataArray[i]],subsetStart,subsetEnd);
			if(result) answerSet.push(...result)
		}
	}else{
		for(let i=0; i<subsetEnd; i++) {
			const result=call([...permutation,dataArray[i]]);
			if(result) answerSet.push(result)
		}
	}
	return answerSet;
}
module.exports=permutations;