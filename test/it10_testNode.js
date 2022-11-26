//const assert=require('assert');
const should=require("should");
const nodeDefinition=require("../array-permutations/array-permutations.js");
const helper=require("node-red-node-test-helper");
helper.init(require.resolve('node-red'));

function getAndTestNodeProperties(o) {
	const n = helper.getNode(o.id);
	for(let p in o) n.should.have.property(p, o[p]);
	return n;
}

function testFlow(done,node,data,result) {
	const flow = [
		Object.assign(node,{wires : [ [ "out1" ],["out2"],["out2"] ]}),
		{id :"out1",	type : "helper"},
		{id :"out2",	type : "helper"},
		{id :"out3",	type : "helper"}
	];
	helper.load(node, flow, function() {
		const n=getAndTestNodeProperties(node);
		const outHelper = helper.getNode("outHelper");
		const errorHelper = helper.getNode("errorHelper");
		out1.on("input", function(msg) {
			console.log("Helper out1 "+JSON.stringify(msg));
			if(JSON.stringify(msg.payload)==JSON.stringify(result)) {
				done();
			} else {
				console.log("mismatch  expected: "+JSON.stringify(result) +" returned: "+JSON.stringify(msg.payload));
				done("mismatch");
			}
		});
		out2.on("input", function(msg) {
			console.log("Helper out2 "+JSON.stringify(msg));
			done("Helper out2");
		});
		out3.on("input", function(msg) {
			console.log("errorHelper "+JSON.stringify(msg));
			done("Helper out3");
		});
		n.receive({
			topic:"test",
			payload : data
		});
	});
}
const nodeType="Array Permutations";
const nodeBase={
	id : "array-permutations",
	type : nodeType,
	name : nodeType,
    action: "Loop",
    arrayProperty:{value:"msg.payload"},
    setSize: 2,
    unique: "true",
    outputs:3
};

// Mocha Test Case
describe('Mocha Test Case', function() {
    beforeEach(function(done) {
		helper.startServer(done);
	});
	afterEach(function(done) {
		helper.unload();
		helper.stopServer(done);
	});
    it("load config", function(done) {
		helper.load(nodeDefinition,[], function() {
			const n=getAndTestNodeProperties(nodeBase);
		});
		done();
	});
    it('test', function(done) {
        const msg={topic:1}
		testFlow(done,nodeBase,msg,msg);
    });
});