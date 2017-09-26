// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import tollboothoperator_artifacts from '../../build/contracts/TollBoothOperator.json'
import regulator_artifacts from '../../build/contracts/Regulator.json'
import tollboothholder_artifacts from '../../build/contracts/TollBoothHolder.json'

var TollBoothOperator = contract(tollboothoperator_artifacts);
var TollBoothHolder = contract(tollboothholder_artifacts);
var Regulator = contract(regulator_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

var tollboothoperator_owner;

var regulator_contract;
var regulator_owner;

var tollboothlogs = [];
var tollboothLogArray = [];
var currentTollBoothOperator;


var tollbooth_listener_exists = false;

window.App = {

  start: function () {
    var self = this;

    var tollBoothOperatorList = $("#tollBoothOperatorList");


    // Bootstrap the MetaCoin abstraction for Use.
    TollBoothOperator.setProvider(web3.currentProvider);
    TollBoothHolder.setProvider(web3.currentProvider);
    Regulator.setProvider(web3.currentProvider);
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
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
        .then(function (instance) {
          let contract = instance;
          console.log("The contract:", contract);
          regulator_contract = contract;
          console.log(regulator_contract);

          // Log event handlers

          contract.LogVehicleTypeSet({}, { fromBlock: 0, toBlock: 'latest' }).watch((error, eventResult) => {
            if (error) {
              console.log("error", error);
            } else {
              console.log(eventResult);
              self.setStatus("Vehicle " + eventResult.args.vehicle + " type set to " + eventResult.args.vehicleType)
            }
          })

          contract.LogTollBoothOperatorCreated({}, { fromBlock: 0, toBlock: 'latest' }).watch((error, eventResult) => {
            if (error) {
              console.log("error", error);
            } else {
              self.setTollBoothLog("Tollbooth created at " + eventResult.args.newOperator + " with deposit " + eventResult.args.depositWeis)
              tollBoothOperatorList.append($("<option />").val(eventResult.args.newOperator).text(eventResult.args.newOperator));
              tollboothLogArray.push(eventResult)
              console.log(eventResult);

              if (!tollbooth_listener_exists) {
                
                TollBoothOperator.at(eventResult.args.newOperator).LogTollBoothAdded({}, {fromBlock: 0, toBlock: 'latest'}).watch((error, eventResult) => {
                  if (error) {
                    console.log("error", error);
                  } else {
                    $("#tollbooths").append("<li>" + eventResult.args.tollBooth + "</li>");
                    console.log(eventResult);
                  }
                })

                TollBoothOperator.at(eventResult.args.newOperator).LogRoutePriceSet({}, {fromBlock: 0, toBlock: 'latest'}).watch((error, eventResult) => {
                  if (error) {
                    console.log("error", error);
                  } else {
                    $("#routeprices").append("<li>" + "<b>" + eventResult.args.priceWeis + "</b>" + eventResult.args.entryBooth + "->" + eventResult.args.exitBooth + "</li>");
                    console.log(eventResult);
                  }
                })


                
                tollbooth_listener_exists = true;  
              }




            }
          })


        })






    });
  },

  setStatus: function (message) {
    $("#status").append("<li>" + message + "</li>");
  },

  setTollBoothLog: function (message) {
    $("#tollboothlog").append("<li>" + message + "</li>");
  },


  addTollBooth: function () {
    currentTollBoothOperator.addTollBooth($("#tollBoothAddressField").val(), { from: tollboothoperator_owner })
      .then(console.log)
  },

  setRoutePrice: function () {
    console.log(tollboothoperator_owner)
    console.log($("#entryTollBooth").val())
    console.log($("#exitTollBooth").val())
    currentTollBoothOperator.setRoutePrice($("#entryTollBooth").val(), $("#exitTollBooth").val(), parseInt($("#routepriceweis").val()), { from: tollboothoperator_owner, gas: 3000000 })
      .then(console.log)
  },

  populateTollBoothOperatorDetails: function () {
    for (var i in tollboothLogArray) {
      if (tollboothLogArray[i].args.newOperator == $('#tollBoothOperatorList :selected').text()) {

        currentTollBoothOperator = TollBoothOperator.at(tollboothLogArray[i].args.newOperator) //tollboothLogArray[i];
        console.log(currentTollBoothOperator)
        tollboothoperator_owner = tollboothLogArray[i].args.owner;
        $("#tollBoothOperatorAddressField").val(tollboothLogArray[i].args.newOperator)
        $("#tollBoothOperatorDepositField").val(tollboothLogArray[i].args.depositWeis.toNumber())
        console.log(tollboothLogArray[i].args.depositWeis.toNumber());
        console.log(tollboothLogArray[i].args.newOperator);
        console.log(tollboothLogArray[i].args.owner);
      }
    }
  },

  createTollBoothOperator: function () {
    var owner = $("#owneraddress").val();
    var initialDeposit = parseInt($("#deposit").val())

    console.log(owner)
    console.log($("#owneraddress").val())
    console.log(parseInt($("#deposit").val()))
    Regulator.deployed().then(function (instance) {
      console.log(instance.createNewOperator(owner, initialDeposit, { from: regulator_owner, gas: 3000000 }));
    }).then(function (tx) {
      console.log(tx);
    })
  },

  setVehicleType: function () {
    var self = this;

    var vehicleType = parseInt(document.getElementById("amount").value);
    var vehicleAddress = document.getElementById("receiver").value;

    Regulator.deployed().then(function (instance) {
      instance.setVehicleType(vehicleAddress, vehicleType, { from: regulator_owner });
    }).then(function (tx) {
      console.log(tx);
    })
  },


};

window.addEventListener('load', function () {
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
