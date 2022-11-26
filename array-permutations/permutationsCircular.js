const logger = new (require("node-red-contrib-logger"))("permutationsCircular");
logger.sendInfo("Copyright 2022 Jaroslav Peter Prib");
function permutationsCircular(dataArray,call=(perm,agg)=>{agg.push(perm);return agg},agg=[]){
	const l=dataArray.length
	for(let i=0; i<l; i++) {
		call([
			...dataArray.slice(i%l),
			...dataArray.slice(0,i%l)
		],agg);
	}
	return agg;
}
module.exports=permutationsCircular;