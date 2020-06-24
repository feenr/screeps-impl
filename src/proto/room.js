module.exports = (function() {
  var utils = require('utils');
  var logFactory = require("logger-factory");
  var settings = require('settings');
  var roomScript = require('room');

  Room.prototype.creepsByRole = {};
  Room.prototype.flagSettings = {};

  Room.prototype.performTick = function(){
    roomScript.perform(this.name);
  };

  Room.prototype.getSources = function () {
      return this.find(FIND_SOURCES);
  };

  Room.prototype.getMinerals = function () {
      return this.find(FIND_MINERALS);
  };

  Room.prototype.getNameComponents = function() {
    var components = {};
    components.name = this.name;
    var tempName = this.name + "";
    if (this.name[0] == 'E') {
      components.horizonalDirection = 'E';
    } else {
      components.horizonalDirection = 'W';
    }
    tempName = tempName.slice(1);
    var index = tempName.indexOf("N") || tempName.indexOf("S");
    if (tempName[index] == "N") {
      components.verticalDirection = "N";
    } else {
      components.verticalDirection = "S";
    }
    components.horizontalPosition = parseInt(tempName.slice(0, index));
    components.verticalPosition = parseInt(tempName.slice(index + 1));
    return components;
  };

  Room.prototype.getMyCreeps = function(filter){
      if(typeof filter == 'function'){
        return this.find(FIND_MY_CREEPS, {filter: filter});
      } else {
        return this.find(FIND_MY_CREEPS);
      }
  };

  Room.prototype.getCreepsByRole = function(role){
      // We might need more special cases like this in the future, but this is what we've got...
      if(role == "explorer"){
          this.creepsByRole[role] = this.creepsByRole[role] || []; 
          for(var i in Game.creeps){
              var creep = Game.creeps[i];
              if(creep.memory.role == 'explorer' && creep.memory.room == this.name){
                  this.creepsByRole[role].push(creep);
              }
          }
      } else {
          var creepCount = 0;
          this.creepsByRole[role] = this.getMyCreeps(function(creep){return creep.memory.role == role});
          var spawns = this.getMySpawns();
          for(var i in spawns){
              if(spawns[i].spawning){
                  var creep = Game.creeps[spawns[i].spawning.name];
                  if(creep.memory.role == role){
                      this.creepsByRole[role].push(creep);
                  }
              }
          }
      }
      return this.creepsByRole[role];
  };
  
  Room.prototype.getMySpawns = function(){
      return this.find(FIND_MY_STRUCTURES, {filter: function(o){return o.structureType == 'spawn';}});
  }
  
  Room.prototype.getMyConstructionSites = function(){
      return this.find(FIND_MY_CONSTRUCTION_SITES);
  }

  Room.prototype.getSettingFromFlag = function(setting){
    if(typeof this.flagSettings[setting] == "object"){
      return this.flagSettings[setting];
    } else {
      for(var i in Game.flags){
        if(Game.flags[i].room == this && Game.flags[i].name.indexOf(setting+"-")==0){
          return Game.flags[i].getSetting();
        }
      }
    }
  };

  Room.prototype.initialize = function(){
    var room = this;
    var log = logFactory.getRoomLogger(room.name).log;
    log("Initializing room");

    Memory.rooms = Memory.rooms || (Memory.rooms = {});
    Memory.rooms[room.name] = {};
    var harvestGroups = (Memory.rooms[room.name].harvestGroups = {});
    this.initializeSourceHarvestGroups();
    this.initializeMineralHarvestGroups();
    
    if(Game.rooms.length == 1){
        settings.set("disabled", false, room.name);        
    } else {
        settings.set("disabled", true, room.name);
    }

    //settings.set("parentRoom", findParentRoom(), room.name);

    if(room.controller) {
      var creepTemplates = require('creep-templates');
      var targetCreepCounts = {};
      for(var i in creepTemplates){
        targetCreepCounts[creepTemplates[i].role] = 0;
      }
      // Set room defaults
      targetCreepCounts['harvester'] = 8;
      targetCreepCounts['builder'] = 2;
      targetCreepCounts['researcher'] = 2;
      log("Setting creep counts: "+JSON.stringify(targetCreepCounts));
      settings.set("targetCreepCounts", targetCreepCounts, room.name);
      settings.set("CurrentLevel", room.controller.level, room.name);
      initializeFlags();
    }

    /**
     * Checks the eight adjacent rooms for an own controller, and if found
     * return the room name.
     **/
    function findParentRoom(){
      var roomNameObj = new utils.RoomName(room.name);
      var yDir = roomNameObj.verticalDirection;
      var xDir = roomNameObj.horizonalDirection;
      var xPos = roomNameObj.horizontalPosition;
      var yPos = roomNameObj.verticalPosition;
      var potentialRooms = [];

      var roomCenter = "";

      for(var x= xPos-1; x <= xPos+1; x++){
        for(var y = yPos-1; y <= yPos+1; y++){
          if(y == yPos && x == xPos){
            continue;
          }
          var potentialRoomName = xDir + x + yDir + y;
          if(Game.rooms[potentialRoomName]
            && Game.rooms[potentialRoomName].controller
            && Game.rooms[potentialRoomName].controller.my){
            potentialRooms.push(Game.rooms[potentialRoomName].controller.pos);
          }
        }
      }
      //var path = PathFinder.search(new RoomPosition(20,20, roomName), potentialRooms);
      //console.log(JSON.stringify(path));
      //return path.path[path.path.length-1].roomName;
      return potentialRooms[0].roomName;
    }

    function initializeFlags(){
      var flagSettings = require('settings_flags');
      var settingPosX = 0;
      var settingPosY = 49;
      for(var i in flagSettings){
        var flag = flagSettings[i];
        var ypos;
        var xpos;
        var flagName;
        var defaultValue = flagSettings[i].default;
        if(flag.type == 'setting'){
          flagName = flag.prefix+room.name;
          ypos = settingPosY;
          xpos = settingPosX
          settingPosY = settingPosY - 2;
        } else {
          xpos = flag.x;
          if(flag.count){
            for(var k = 1; k <= flag.count; k++){
              ypos = flag.y+k;
              flagName = flag.prefix+k+"-"+room.name;
              room.createFlag(xpos, ypos, flagName);
            }
            continue;
          } else {
            ypos = flag.y;
            flagName = flag.prefix+room.name;
          }
        }
        var flagName = room.createFlag(xpos, ypos, flagName);
        if(typeof flagName == "string"){
            //Game.flags[flagName].set
        }
      }
    }
  };
  
  Room.prototype.initializeSourceHarvestGroups = function(){
    var harvestGroups = Memory.rooms[this.name].harvestGroups
    var sources = this.getSources();
    for(var i = 0; i < sources.length; i++){
      var harvestGroup = {
        targetHarvesterCount : sources[i].pos.getOpenAdjacentPositionsCount()+1
      }
      harvestGroups[sources[i].id] = harvestGroup;
    }
  }
  
  Room.prototype.initializeMineralHarvestGroups = function(){
    var harvestGroups = Memory.rooms[this.name].harvestGroups
    var minerals = this.getMinerals();
    var targetEnergyStore = ""; // ToDo rename this variable...
    var storages = this.find(FIND_MY_STRUCTURES, {filter: utils.isA("storage")});
    if(storages[0]){
        targetEnergyStore = storages[0].id;
    }
    for(var i = 0; i < minerals.length; i++){
      var harvestGroup = {
        targetHarvesterCount : 0,
        targetEnergyStore : targetEnergyStore
      }
      harvestGroups[minerals[i].id] = harvestGroup;
    }
  }

  Room.prototype.findParentRoom = function(){
    var roomNameObj = new utils.RoomName(room.name);
    var yDir = roomNameObj.verticalDirection;
    var xDir = roomNameObj.horizonalDirection;
    var xPos = roomNameObj.horizontalPosition;
    var yPos = roomNameObj.verticalPosition;
    var potentialRooms = [];

    for(var x= xPos-1; x <= xPos+1; x++){
      for(var y = yPos-1; y <= yPos+1; y++){
        if(y == yPos && x == xPos){
          continue;
        }
        var potentialRoomName = xDir + x + yDir + y;
        if(Game.rooms[potentialRoomName]
          && Game.rooms[potentialRoomName].controller
          && Game.rooms[potentialRoomName].controller.my){
          potentialRooms.push(Game.rooms[potentialRoomName].controller.pos);
        }
      }
    }

    return potentialRooms[0].roomName;
  }
})();