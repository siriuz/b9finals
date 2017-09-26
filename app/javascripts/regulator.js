// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import regulator_artifacts from '../../build/contracts/Regulator.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var Regulator = contract(regulator_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

var regulator_owner;

var regulator_contract;

var vehicleTypeLogs = [];

window.App = {

  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Regulator.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      regulator_owner = accounts[0];

     console.log(accounts) 
      Regulator.deployed()
      .then(function(instance) {
        let contract = instance;
        console.log("The contract:", contract);
        regulator_contract = contract;
        console.log(regulator_contract);
        
        // Log event handlers


        contract.LogVehicleTypeSet({}, { fromBlock: 0, toBlock: 'latest'}).watch((error, eventResult) => {
          if (error) {
          console.log("error", error);
        } else {
          console.log(eventResult);
          self.setStatus("Vehicle " + eventResult.args.vehicle + " type set to "  + eventResult.args.vehicleType) 
        }
      })

       contract.LogTollBoothOperatorCreated({}, { fromBlock: 0, toBlock: 'latest'}).watch((error, eventResult) => {
          if (error) {
          console.log("error", error);
        } else {
          self.setTollBoothLog("Tollbooth created at " + eventResult.args.newOperator + " with deposit "  + eventResult.args.depositWeis)
          console.log(eventResult);
        }
      })


      })

    });
  },

  setStatus: function(message) {
    $("#status").append("<li>" + message + "</li>");
  },

  setTollBoothLog: function(message) {
    $("#tollboothlog").append("<li>" + message + "</li>");
  },


  createTollBoothOperator: function () {
    var owner = $("#owneraddress").val();
    var initialDeposit = parseInt($("#deposit").val())

    console.log(owner)
    console.log($("#owneraddress").val())
    console.log(parseInt($("#deposit").val()))
    Regulator.deployed().then(function(instance) {
      console.log(instance.createNewOperator(owner, initialDeposit, {from: regulator_owner, gas: 3000000}));
    }).then(function (tx) {
      console.log(tx);
    }) 
  },

  setVehicleType: function () {
    var self = this;

    var vehicleType = parseInt(document.getElementById("amount").value);
    var vehicleAddress = document.getElementById("receiver").value;
  
    Regulator.deployed().then(function(instance) {
      instance.setVehicleType(vehicleAddress, vehicleType, {from: regulator_owner});
    }).then(function (tx) {
      console.log(tx);
    })
  },


};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:10000"));
  }

  App.start();
});
