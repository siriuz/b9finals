var Regulator = artifacts.require("./Regulator.sol");
var TollBoothOperator = artifacts.require("./TollBoothOperator.sol")

module.exports = function(deployer, network, accounts) {
    let regulatorInstance;
    let tollBoothOperatorInstance;

    regulatorOwner = accounts[0];
    tollBoothOperatorOwner = accounts[1];

    console.log(accounts);

    return deployer.deploy(Regulator)
    .then(() => Regulator.deployed())
    .then(instance => regulatorInstance = instance)
    .then(() => regulatorInstance.getOwner())
    .then((regulatorOwner) => console.log("Regulator deployed at", regulatorInstance.address, ", owned by", regulatorOwner))
    
    .then(() => regulatorInstance.createNewOperator(tollBoothOperatorOwner, 105 , {from: regulatorOwner}))
    .then((tx) => tollBoothOperatorInstance =  TollBoothOperator.at(tx.logs[1].args.newOperator))
    .then(() => tollBoothOperatorInstance.getOwner())
    .then((tollBoothOperatorOwner) => console.log("Tollbooth Operator deployed at", tollBoothOperatorInstance.address, ", owned by", tollBoothOperatorOwner))
    .then(() => tollBoothOperatorInstance.setPaused(false, {from: tollBoothOperatorOwner}));

    ;

};
  