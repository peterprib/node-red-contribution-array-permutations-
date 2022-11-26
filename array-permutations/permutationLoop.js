const logger = new (require("node-red-contrib-logger"))("permutationLoop");
logger.sendInfo("Copyright 2022 Jaroslav Peter Prib");

function permutationLoop(arrayPermutations,unique,call,done){
    if(unique==true) permutationLoopUnique(arrayPermutations,call,done)
    else permutationLoopAll(arrayPermutations,call,done)
    return;
}

function permutationLoopAll(arrayPermutations,call,done){
	const dataArraySize=arrayPermutations.dataArray.length;
	const depth=arrayPermutations.permutationStack.length;
	const setSize=arrayPermutations.setSize-depth+1;
	const last=arrayPermutations.permutationStack[depth-1];
	if(logger.active) logger.send({label:"permutationLoopAll",setSize:setSize,arrayPermutations:arrayPermutations});
	if(arrayPermutations.position<dataArraySize){
		const permutation=[...last.permutation,arrayPermutations.dataArray[arrayPermutations.position]];
		if(setSize==1) {
			arrayPermutations.position++;
			call(permutation);
		} else {
			const position=arrayPermutations.position;
			arrayPermutations.position=0;
			arrayPermutations.permutationStack.push({permutation:permutation,position:position})
			permutationLoopAll(arrayPermutations,call,done);
		}
		return;
	}
	if(depth==1) {
		done();
		return;
	}
	const lastStack=arrayPermutations.permutationStack.pop();
	arrayPermutations.position=lastStack.position+1;
	permutationLoopAll(arrayPermutations,call,done);
}
function permutationLoopUnique(arrayPermutations,call,done){
	const depth=arrayPermutations.permutationStack.length;
	const setSize=arrayPermutations.setSize-depth+1;
	const last=arrayPermutations.permutationStack[depth-1];
	if(logger.active) logger.send({label:"permutationLoopUnique",setSize:setSize,arrayPermutations:arrayPermutations});
 	if(setSize>0){
		if(arrayPermutations.position<arrayPermutations.dataArray.length){
			const permutation=[...last.permutation,arrayPermutations.dataArray[arrayPermutations.position]];
			arrayPermutations.position++;
			if(setSize==1) {
				call(permutation);
			} else {
				arrayPermutations.permutationStack.push({permutation:permutation,position:arrayPermutations.position})
				permutationLoopUnique(arrayPermutations,call,done);
			}
			return;
		}
	}
	if(depth==1) {
		done();
		return;
	}
	const lastStack=arrayPermutations.permutationStack.pop();
	arrayPermutations.position=last.position;
	permutationLoopUnique(arrayPermutations,call,done);
}
module.exports=permutationLoop;