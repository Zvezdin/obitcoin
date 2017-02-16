var Web3 = require("web3");
var SolidityEvent = require("web3/lib/web3/event.js");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, instance, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var decodeLogs = function(logs) {
            return logs.map(function(log) {
              var logABI = C.events[log.topics[0]];

              if (logABI == null) {
                return null;
              }

              var decoder = new SolidityEvent(null, logABI, instance.address);
              return decoder.decode(log);
            }).filter(function(log) {
              return log != null;
            });
          };

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  // If they've opted into next gen, return more information.
                  if (C.next_gen == true) {
                    return accept({
                      tx: tx,
                      receipt: receipt,
                      logs: decodeLogs(receipt.logs)
                    });
                  } else {
                    return accept(tx);
                  }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], instance, constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("Obitcoin error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("Obitcoin error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("Obitcoin contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of Obitcoin: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to Obitcoin.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: Obitcoin not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "default": {
    "abi": [
      {
        "constant": false,
        "inputs": [
          {
            "name": "index",
            "type": "uint8"
          },
          {
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "buyCoins",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "adminToRemove",
            "type": "address"
          }
        ],
        "name": "removeAdmin",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "index",
            "type": "uint8"
          }
        ],
        "name": "getPoolParticipants",
        "outputs": [
          {
            "name": "",
            "type": "address[]"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "index",
            "type": "uint8"
          },
          {
            "name": "person",
            "type": "address"
          }
        ],
        "name": "getPersonDebt",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "index",
            "type": "uint8"
          },
          {
            "name": "person",
            "type": "address"
          },
          {
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "sendCoins",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "adminToAdd",
            "type": "address"
          }
        ],
        "name": "addAdmin",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getPoolCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "people",
            "type": "address[]"
          }
        ],
        "name": "createDebtPool",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "poolIndex",
            "type": "uint8"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "int256"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "CoinsTransfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "poolIndex",
            "type": "uint8"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "CoinsPurchase",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "index",
            "type": "uint8"
          },
          {
            "indexed": true,
            "name": "by",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "PoolCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "UnauthorizedAccess",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "person",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "added",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "AdminChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "person",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "added",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "poolIndex",
            "type": "uint8"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "PersonChanged",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x6060604052600080546c0100000000000000000000000033810204600160a060020a031990911617808255600160a060020a03168152600160208190526040909120805460ff19169091179055610ca58061005a6000396000f36060604052361561006c5760e060020a600035046301259c9d81146100715780631785f53c146100df57806369813f66146101365780636d95e3e8146101645780636eab04501461018957806370480275146101f25780638eec5d7014610249578063a05ff7f914610264575b610002565b3461000257610301600435602435600160a060020a033316600090815260016020526040812054819081908190819060ff1615156103a35760408051600160a060020a03331681524260208201528151600080516020610c85833981519152929181900390910190a161039a565b346100025761030160043560005433600160a060020a039081169116146107095760408051600160a060020a03331681524260208201528151600080516020610c85833981519152929181900390910190a1610772565b346100025761030360043560408051602081019091526000815260025460ff83169080821061077557610002565b346100025761025260043560243560025460009060ff8416908082106107f157610002565b3461000257610301600435602435604435600160a060020a03331660009081526001602052604090205460ff1615156109635760408051600160a060020a03331681524260208201528151600080516020610c85833981519152929181900390910190a161095e565b346100025761030160043560005433600160a060020a03908116911614610a7e5760408051600160a060020a03331681524260208201528151600080516020610c85833981519152929181900390910190a1610772565b34610002576002545b60408051918252519081900360200190f35b346100025760408051602060048035808201358381028086018501909652808552610301959294602494909392850192829185019084908082843750949650505050505050600160a060020a03331660009081526001602052604090205460ff161515610aed5760408051600160a060020a03331681524260208201528151600080516020610c85833981519152929181900390910190a1610772565b005b60405180806020018281038252838181518152602001915080519060200190602002808383829060006004602084601f0104600302600f01f1509050019250505060405180910390f35b60408051878152426020820152815160ff8c1692600160a060020a033316927f0a2bc3adb8c2b63fe95851175d2c67b4d7233c829426007bd87b77a1bc0537ca929081900390910190a350505b50505050505050565b60025460ff8816908082106103b757610002565b600096508695508594505b6002805460ff8b169081101561000257906000526020600020906002020160005054851015610478576002805460ff8b1690811015610002579060005260206000209060020201600050600101600050600060026000508b60ff16815481101561000257906000526020600020906002020160005080548890811015610002576000918252602080832090910154600160a060020a031683528201929092526040019020549690960195600194909401936103c2565b600094505b6002805460ff8b16908110156100025790600052602060002090600202016000505485101561034d576002805460ff8b1690811015610002579060005260206000209060020201600050600101600050600060026000508b60ff16815481101561000257906000526020600020906002020160005080548890811015610002576000918252602080832090910154600160a060020a031683528201929092526040019020549350868885028115610002570492508383850311156105dc576002805460ff8b169081101561000257906000526020600020906002020160005080548690811015610002579060005260206000209001600090546040805160ff8d1681526000889003602082015242818301529051600160a060020a036101009490940a9092048316923316917f6d2ee05620d399e902392878db92049db4833ad62794528b4b566968f083680b9181900360600190a36000935061067e565b6002805460ff8b169081101561000257906000526020600020906002020160005080548690811015610002579060005260206000209001600090546040805160ff8d1681526000879003602082015242818301529051600160a060020a036101009490940a9092048316923316917f6d2ee05620d399e902392878db92049db4833ad62794528b4b566968f083680b9181900360600190a39482019492829003925b8360026000508a60ff168154811015610002579060005260206000209060020201600050600101600050600060026000508c60ff16815481101561000257906000526020600020906002020160005080548990811015610002576000918252602080832090910154600160a060020a031683528201929092526040019020556001949094019361047d565b60408051600160a060020a038316815260006020820152428183015290517f93d0a7c15c7563d9be4a11e86b41c8d9e139dc0a4d5ac958f76b611654a4cb969181900360600190a1600160a060020a0381166000908152600160205260409020805460ff191690555b50565b6002805460ff86169081101561000257600091825260209182902060029091020180546040805182850281018501909152818152928301828280156107e357602002820191906000526020600020905b8154600160a060020a031681526001909101906020018083116107c5575b505050505092505050919050565b848460005b6002805460ff8516908110156100025790600052602060002090600202016000505481101561006c5781600160a060020a031660026000508460ff1681548110156100025790600052602060002090600202016000508054839081101561000257600091825260209091200154600160a060020a031614156108bd576002805460ff8a1690811015610002579060005260206000209060020201600050600160a060020a038816600090815260019190910160205260409020549550505050505092915050565b6001016107f6565b8560026000508960ff168154811015610002579060005260206000209060020201600050600160a060020a03808a16600081815260019390930160209081526040938490208054909501909455825160ff8d1681529384018a905242848401529151919233909116917f6d2ee05620d399e902392878db92049db4833ad62794528b4b566968f083680b9181900360600190a350505050505b505050565b60025460ff84169080821061097757610002565b848460005b6002805460ff8516908110156100025790600052602060002090600202016000505481101561006c5781600160a060020a031660026000508460ff1681548110156100025790600052602060002090600202016000508054839081101561000257600091825260209091200154600160a060020a03161415610a76576002805460ff8a16908110156100025760009182526020808320600160a060020a038b168452600292830201600101905260409091205481549091889160ff8c16908110156100025760009182526020808320600160a060020a038d168452600160029093020191909101905260409020540110156108c557610002565b60010161097c565b60408051600160a060020a038316815260016020820152428183015290517f93d0a7c15c7563d9be4a11e86b41c8d9e139dc0a4d5ac958f76b611654a4cb969181900360600190a1600160a060020a03166000908152600160208190526040909120805460ff19169091179055565b60028054600181018083558281838015829011610b2357600202816002028360005260206000209182019101610b239190610bc3565b50505091909060005260206000209060020201600050604080516020818101909252848152845183548185556000858152849020929493849391820192919088018215610bfc579160200282015b82811115610bfc578251825473ffffffffffffffffffffffffffffffffffffffff19166c0100000000000000000000000091820291909104178255602090920191600190910190610b71565b50506002015b80821115610bf85780546000808355828152602081209091610bbd91908101905b80821115610bf85760008155600101610be4565b5090565b50610c2f9291505b80821115610bf857805473ffffffffffffffffffffffffffffffffffffffff19168155600101610c04565b50506002546040805160001990920160ff168252426020830152805133600160a060020a031695507f0e127b5107fa3bc272d8be8ef2c38e3749b255150965c51d9c598a62e7ce26fd945091829003019150a2505643b194910a4f77eb743a74de7edb81fbd43fe290c76132533773b9567e82fd7a",
    "events": {
      "0x98f65f93d3acffae58625594b029418a379c3436dea75dc2f0ed67a74cdd1171": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "int256"
          }
        ],
        "name": "CoinsTransfer",
        "type": "event"
      },
      "0x6d2ee05620d399e902392878db92049db4833ad62794528b4b566968f083680b": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "poolIndex",
            "type": "uint8"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "int256"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "CoinsTransfer",
        "type": "event"
      },
      "0x4501caba539b0850312c3dd3f0b4c7e575f11970eee5dad73d234db1db22c1b1": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "index",
            "type": "uint8"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "PoolCreated",
        "type": "event"
      },
      "0x43b194910a4f77eb743a74de7edb81fbd43fe290c76132533773b9567e82fd7a": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "UnauthorizedAccess",
        "type": "event"
      },
      "0x93d0a7c15c7563d9be4a11e86b41c8d9e139dc0a4d5ac958f76b611654a4cb96": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "person",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "added",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "AdminChanged",
        "type": "event"
      },
      "0x947e148b5a736aff6e24e51a90725a0cf64aa475c7dcd426887b843458389348": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "person",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "added",
            "type": "bool"
          },
          {
            "indexed": false,
            "name": "poolIndex",
            "type": "uint8"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "PersonChanged",
        "type": "event"
      },
      "0x0e127b5107fa3bc272d8be8ef2c38e3749b255150965c51d9c598a62e7ce26fd": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "index",
            "type": "uint8"
          },
          {
            "indexed": true,
            "name": "by",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "PoolCreated",
        "type": "event"
      },
      "0x0a2bc3adb8c2b63fe95851175d2c67b4d7233c829426007bd87b77a1bc0537ca": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "poolIndex",
            "type": "uint8"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "CoinsPurchase",
        "type": "event"
      }
    },
    "updated_at": 1487283295709,
    "links": {},
    "address": "0x562c2f309e28a27d07b954c0e16a61ea2e0da88f"
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};
    this.events          = this.prototype.events          = network.events || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "function") {
      var contract = name;

      if (contract.address == null) {
        throw new Error("Cannot link contract without an address.");
      }

      Contract.link(contract.contract_name, contract.address);

      // Merge events so this contract knows about library's events
      Object.keys(contract.events).forEach(function(topic) {
        Contract.events[topic] = contract.events[topic];
      });

      return;
    }

    if (typeof name == "object") {
      var obj = name;
      Object.keys(obj).forEach(function(name) {
        var a = obj[name];
        Contract.link(name, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "Obitcoin";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.2.0";

  // Allow people to opt-in to breaking changes now.
  Contract.next_gen = false;

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.Obitcoin = Contract;
  }
})();
