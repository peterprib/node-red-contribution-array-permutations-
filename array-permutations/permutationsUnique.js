const logger = new (require("node-red-contrib-logger"))("permutationsUnique");
logger.sendInfo("Copyright 2022 Jaroslav Peter Prib");
function permutationsUnique(dataArray,k=dataArray.length,call=(perm,agg)=>{agg.push(perm);return agg},agg=[]){
	if(k==0) return agg;
	return permutationsUniqueR(dataArray,k,call,agg)

}
function permutationsUniqueR(dataArray,k,call,agg,permutation=[],subsetStart=0,subsetEnd=dataArray.length){
	const lastUsable=subsetEnd-k+1
	if(k>1){
		for(let i=subsetStart; i<lastUsable; i++){
			permutationsUniqueR(dataArray,k-1,call,agg,[...permutation,dataArray[i]],i+1,subsetEnd);
		}
	}else{
		for(let i=subsetStart; i<subsetEnd; i++) {
			agg=call([...permutation,dataArray[i]],agg);
		}
	}
	return agg;
}
module.exports=permutationsUnique;