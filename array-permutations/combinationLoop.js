const logger = new (require("node-red-contrib-logger"))("combinationLoop");
logger.sendInfo("Copyright 2022 Jaroslav Peter Prib");
function combinationLoop(arrayCombo,call,done){
	const k=arrayCombo.setSize-arrayCombo.combinationStack.length;
	if(logger.active) logger.send({label:"combinationLoop",k:k,arrayCombo:arrayCombo});
 	if(k>1){
		if(arrayCombo.position<arrayCombo.subsetEnd-k+1){
			arrayCombo.combination=[...arrayCombo.combination,arrayCombo.dataArray[arrayCombo.position]];
			arrayCombo.position++;
			arrayCombo.combinationStack.push({combination:arrayCombo.combination,position:arrayCombo.position})
			combinationLoop(arrayCombo,call,done);
			return;
		}
	}else{
		if(arrayCombo.position<arrayCombo.subsetEnd){
			call([...arrayCombo.combination,arrayCombo.dataArray[arrayCombo.position]]);
			arrayCombo.position++;
			return;
		}
	}
	if(arrayCombo.combinationStack.length>1){
		const returnData=arrayCombo.combinationStack.pop();
		arrayCombo.position=returnData.position++
		arrayCombo.combination=returnData.combination;
		combinationLoop(arrayCombo,call,done);
	} else done();
}
module.exports=combinationLoop;