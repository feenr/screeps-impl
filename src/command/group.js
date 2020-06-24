module.exports = function(){
  /**
  var utils = require("utils_misc");
  var settings = require('utils_settings_registry');
  var id = "";
  var energyNode = Game.getObjectById(nodeId);
  var room = energyNode.room;
  var roomId = room.name;


  //Stored in memory
  var targetEnergyStore;
  var targetCreepCounts = {};

  var harvesterList;

  function perform(){
    // Remove all dead harvesters
    for(var i in harvesterList){
      if(!Game.getObjectById(harvesterList[i])){
        harvesterList.splice(i, 1);
      }
    }

    if(settings.get("disabled", roomId)){
      return;
    }

    // Check if the energy store is not defined or invalid
    if(!targetEnergyStore || !Game.getObjectById(targetEnergyStore)){
      // Find an appropriate energy store
      Memory.rooms[roomId].harvestGroups[nodeId].targetEnergyStore = findNearestEnergyStore();
    }
    //if(!targetHarvesterCount || targetHarvesterCount ==0 ) {
    //    targetHarvesterCount = utils.getOpen
    //}

    // If we don't have enough harvesters on this node, find
    // an idle one and assign it.

    for(var role in targetCreepCounts){
      //if(targetCreepCounts)
    }

    if(harvesterList.length < targetCreepCount){
      var harvester = findUnassignedHarvester();
      if(harvester){
        addHarvester(harvester);
      }
    }

    var spawns = room.find(FIND_MY_SPAWNS);
    var spawnCount = spawns.length;
    if(spawnCount == 0){
      Memory.rooms[roomId].harvestGroups[nodeId].parentRoom = settings.get('defaultRoom');
    }
  }

  function addCreep(creep, index){
    Memory.creeps[creep.name].command_croup = id;
    if(typeof(index) == 'undefined'){
      index = harvesterList.length;
    }
    harvesterList[index] = creep.id;
  }

  function getFromMemory(){
    Memory.commandGroups = Memory.commandGroups
  }

  function getTargetCreepCounts(){
    return {};
  }

  var debugTable = function(){
    var node = Game.getObjectById(id);
    for(var i in harvesterList){
      var harvesterId = harvesterList[i];
      var harvester = Game.getObjectById(harvesterId);
      console.log(harvesterId + " : "+ harvester.name + "["+harvester.pos.x+", "+harvester.pos.y+"]");
    }
  }

  var publicAPI = {};
  publicAPI.perform = perform;
  publicAPI.debugTable = debugTable;
  return publicAPI;
   **/
};