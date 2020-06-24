module.exports = (function(){
    var publicAPI = {};
    var settings = require('utils_settings_registry');


   publicAPI.RoomName = function(name){
     this.name = name;
     if(name[0] == 'E'){
       this.horizonalDirection = 'E';
     } else {
       this.horizonalDirection = 'W';
     }
     name = name.slice(1);
     var index = name.indexOf("N") || name.indexOf("S");
     if(name[index] == "N"){
       this.verticalDirection = "N";
     } else {
       this.verticalDirection = "S";
     }
     this.horizontalPosition = parseInt(name.slice(0, index));

     this.verticalPosition = parseInt(name.slice(index+1));
   };

    publicAPI.calculateCreepCost = function(bodyArray){
        var cost = 0;
        for(var i in bodyArray){
            cost += publicAPI.partCosts[bodyArray[i]];
        }
        return cost;
    }
    
    publicAPI.getCountOfOpenSquaresAroundPos = function(pos){
        var count = 0;
        for(var x = pos.x-1; x <= pos.x+1; x++){
            for(var y = pos.y-1; y <= pos.y+1; y++){
                if(x == pos.x && y == pos.y){
                    continue;
                }
                var room = Game.rooms[pos.roomName];
                var results = room.lookAt(x, y);
                var wallFound = false;
                results.forEach(function(result){
                    if(result.type =='terrain' && result.terrain == 'wall'){
                        wallFound = true;
                    }
                });
                if(!wallFound){
                    count++;
                }
            }
        }
        return count;
    }
    
    publicAPI.findStructuresWithEnergyCapacity = function(){
        var structures = Game.rooms["W18S25"].find(FIND_STRUCTURES);
        var validStructures = [];
        for(var i in structures){
            var structure = structures[i];
            if(structure.energyCapacity > 0 ){
                validStructures.push(structure);
            }
        }
        return validStructures;
    }
    
    
    // Filters
    // This function is silly, it returns a filter using the list of structure
    // types passed in as an array.
    publicAPI.isA = function(types){
        if(typeof(types) == 'string'){
            types = [types];
        }
        return function(struct){
            return types.indexOf(struct.structureType) >= 0;
        }
    }
    
    publicAPI.isARoad = function(struct){
        return struct.structureType == 'road';
    }
    
    publicAPI.isAWallOrRampart = function(struct){
	    return struct.structureType == 'constructedWall' || struct.structureType == 'rampart';
	}
    // Filters End
    
    
    publicAPI.getRoom = function(){
        return Game.rooms[settings.get("defaultRoom")];
    }
    
    publicAPI.deleteRoadConstruction = function(){
        var room = publicAPI.getRoom();
        var roadSites = room.find(FIND_CONSTRUCTION_SITES, {filter:publicAPI.isARoad});
        for(var i in roadSites){
            var roadSite = roadSites[i];
            roadSite.remove();
        }
        // TODO delete roadlocation;
    }
    
    publicAPI.getCreepCountByRole = function(role){
        var count = 0;
        for(var i in Game.creeps){
            if(Memory.creeps[i] && Memory.creeps[i].role == role){
                count++;
            }
        }
        return count;
    }
    
    // Update this to support different types right now, creep > structure
    publicAPI.getTransferAmount = function(transferFrom, transferTo){
        
        var maxReceiveAmount = -1;
        var maxTransferAmount = -1;
        if(transferTo instanceof Creep){
            maxReceiveAmount = transferTo.carryCapacity - transferTo.carry.energy;
        } else if(transferTo instanceof Structure || transferTo instanceof Spawn) {
            switch(transferTo.structureType){
                case 'storage':
                    maxReceiveAmount = transferTo.storeCapacity - (transferTo.store.energy + transferTo.store.power)
                    break;
                default :
                    maxReceiveAmount = transferTo.energyCapacity - transferTo.energy; 
            }
        }
        
        if(transferFrom instanceof Creep){
            maxTransferAmount = transferFrom.carry.energy;
        } else if(transferFrom instanceof Structure || transferFrom instanceof Spawn){
            switch(transferFrom.structureType){
                case 'storage':
                     maxTransferAmount = transferFrom.store.energy;
                     break;
                default : 
                    maxTransferAmount = transferFrom.energy;
            }
        }
        
        //maxTransferAmount = transferFrom.carry.energy;
        //console.log(maxReceiveAmount+" "+maxTransferAmount);
        //console.log(transferFrom.name+" "+maxTransferAmount+ " "+ maxReceiveAmount)
        if(maxReceiveAmount <= maxTransferAmount){
            return maxReceiveAmount;
            
        } else {
            return maxTransferAmount;
        }
    }
    
    publicAPI.partCosts = {
        move : 50,
        work : 100,
        carry : 50,
        attack : 80,
        ranged_attack : 150,
        heal : 250,
        tough : 10,
        claim: 600
    }
    
    publicAPI.sortByPriority = function(list){
        var tempArray = [];
        for(var i in list){
            tempArray.push({name:i, value:list[i]});
        }
        tempArray.sort(function(itemA, itemB){
            if(itemA.value.priority > itemB.value.priority){
                return 1;
            }
            if(itemA.value.priority < itemB.value.priority){
                return -1
            }
            return 0;
        });
        return tempArray;
    }
    
    publicAPI.errorCodes = {
        "-1" : "ERR_NOT_OWNER",
        "-6" : "ERR_NOT_ENOUGH_RESOURCES",
        "-7" : "ERR_INVALID_TARGET",
        "-8" : "ERR_FULL",
        "-9" : "ERR_NOT_IN_RANGE"
    }


    publicAPI.getLatticePositions = function(pos, positionsNeeded, startOdd){
        var positions = []; 
        var currSum = 0;
        var x = 0;
        while (true){
            for(var x2 = x%2; x2 < x; x2+=2){
                var y = x;
                positions.push({x : pos.x+x2, y: pos.y-y});
                if(positions.length == positionsNeeded){
                    return positions;
                }
            }
            for(var y = x % 2; y <= x; y+=2){
                positions.push({x : pos.x+x, y : pos.y-y});
                if(positions.length == positionsNeeded){
                    return positions;
                }
            }
            x++;
        }
    }    
    
    publicAPI.getLatticePositionAlt = function(positionsNeeded){
      var positions = []; 
      var currSum = 0;
      var breakAt = 100;
      while(positions.length < positionsNeeded){
        for(var x = 0; x <= currSum; x++){
          for(var y = x%2; y <= currSum; y+=2){
            console.log(x + " + " +y+" = "+currSum+" ?")
            if(x + y == currSum){
               positions.push({x : x, y : y});
               if(positions.length == positionsNeeded){
                 return positions;
               }
            }
          }
        }
        currSum = currSum +2;
        breakAt--;
        if(breakAt == 0){
      	  console.log("You appear to be stuck");
          break;
        }
      }
      return positions;
    }
    
    publicAPI.isAHarvestGroupTarget = function(structureId){
        for(var k in Memory.rooms[roomId].harvestGroups){
            if(Memory.rooms[roomId].harvestGroups[k].targetEnergyStore == structureId){
                return true;
            }
        }
        return false;
    }
    

    publicAPI.generateId = function(prefix){
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    publicAPI.calculateComponents = function(targetMineral){
      for(var mineral1 in REACTIONS){
        for(var mineral2 in REACTIONS[mineral1]){
          if(REACTIONS[mineral1][mineral2] == targetMineral){
            return [mineral1, mineral2];
          }
        }
      }
    };

  publicAPI.loadObjectsFromIDs = function(idList){
    var objectList = [];
    for(var i in idList){
      objectList.push(Game.getObjectById(idList[i]));
    }
    return objectList;
  }

    return publicAPI;
    
 })();