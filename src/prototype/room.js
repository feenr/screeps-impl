module.exports = (function() {
  var queueManager = require('utils_queue-manager');
  var utils = require('utils_misc');
  var logFactory = require("utils_logger-factory");
  var settings = require('settings_registry');

  Room.prototype.creepsByRole = {};
  Room.prototype.assignedCreepsByRole = {};
  Room.prototype.flagSettings = {};

  Room.prototype.getSources = function () {
      return this.find(FIND_SOURCES);
  };

  Room.prototype.getLogger = function(){
    if(this.log){
      return this.log;
    } else {
      this.log = logFactory.getRoomLogger(this.name).log;
      return this.log;
    }
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
    this.creepsByRole[role] = this.getMyCreeps(function(creep){return creep.memory.role == role});
    return this.creepsByRole[role];
  };

  Room.prototype.getAssignedCreeps = function(filter){
    var creepList = [];
    for(var i in Game.creeps){
      var creep = Game.creeps[i];
      if(creep.getHomeRoom() == this.name){
        if(typeof filter != "function" || filter(creep)){
          creepList.push(creep);
        }
      }
    }
    return creepList;
  };

  Room.prototype.getAssignedCreepsByRole = function(role){
    this.assignedCreepsByRole[role] = this.getAssignedCreeps(function(creep){return creep.memory.role == role});
    return this.assignedCreepsByRole[role];
  };
  
  Room.prototype.getMySpawns = function(){
      return this.find(FIND_MY_STRUCTURES, {filter: function(o){return o.structureType == 'spawn';}});
  };
  
  Room.prototype.getMyConstructionSites = function(){
      return this.find(FIND_MY_CONSTRUCTION_SITES);
  };

  Room.prototype.getSettingFromFlag = function(setting){
    if(typeof this.flagSettings[setting] == "object"){
      return this.flagSettings[setting];
    } else {
      for(var flagName in Game.flags){
        if(Game.flags[flagName].room == this && Game.flags[flagName].name.indexOf(setting+"-")==0){
          return Game.flags[flagName].getSetting();
        }
      }
    }
  };

  Room.prototype.initialize = function(){
    var room = this;
    var log = this.getLogger();
    log("Initializing room");

    Memory.rooms = Memory.rooms || (Memory.rooms = {});
    Memory.rooms[room.name] = {};
    this.initializeSourceHarvestGroups();
    this.initializeMineralHarvestGroups();

    if(Game.rooms.length === 1){
        settings.set("disabled", false, room.name);
    } else {
        settings.set("disabled", true, room.name);
    }

    if(room.controller) {
      var creepTemplates = require('settings_creeps');
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

    function initializeFlags(){
      var flagSettings = require('settings_flags');
      var settingPosX = 0;
      var settingPosY = 49;
      for(var i in flagSettings){
        var flag = flagSettings[i];
        var ypos;
        var xpos;
        var flagName;
        if(flag.type == 'setting'){
          flagName = flag.prefix+room.name;
          ypos = settingPosY;
          xpos = settingPosX;
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
        flagName = room.createFlag(xpos, ypos, flagName);
      }
    }
  };
  
  Room.prototype.initializeSourceHarvestGroups = function(){
    var harvestGroups = Memory.rooms[this.name].harvestGroups || (Memory.rooms[this.name].harvestGroups = {});
    var sources = this.getSources();
    var harvestGroup = null;
    for(var i = 0; i < sources.length; i++){
      harvestGroup = {
        targetHarvesterCount : sources[i].pos.getOpenAdjacentPositionsCount()+1
      };
      harvestGroups[sources[i].id] = harvestGroup;
    }
  };

  Room.prototype.getHarvestGroups = function(){
    var harvestGroups = [];
    for(var i in this.memory.harvestGroups){
      harvestGroups.push(this.memory.harvestGroups[i]);
    }
    return harvestGroups;
  };
  
  Room.prototype.initializeMineralHarvestGroups = function(){
    var harvestGroups = Memory.rooms[this.name].harvestGroups;
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
      };
      harvestGroups[minerals[i].id] = harvestGroup;
    }
  };

  Room.prototype.findParentRoom = function(){
    var roomNameObj = new utils.RoomName(this.name);
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
  };

  Room.prototype.updateSettings = function(){
    if(this.isControlledRoom()) {
      var targetCreepCounts = settings.get("targetCreepCounts", this.name);
      // TODO, this shouldn't happen but it do
      if(!targetCreepCounts){
        console.log("prototype_room.updateSettings"+this.name);
        return;
      }
      targetCreepCounts.researcher = this.getSettingFromFlag("Researchers");
      targetCreepCounts.harvester = this.getHarvestorCount();
      targetCreepCounts.explorer = 0;
      targetCreepCounts.builder = this.getSettingFromFlag("Builders");
      targetCreepCounts.messenger = this.getSettingFromFlag("Messengers");
      targetCreepCounts.deconstructor = 0;
      targetCreepCounts.colonizer = 0;
      targetCreepCounts.soldier = 0;
      targetCreepCounts.healer = targetCreepCounts.soldier - 2;
      targetCreepCounts.rangedSoldier = 0;
      targetCreepCounts.soldier = 0;
      if (this.name == 'W9N4') {
        targetCreepCounts.spawner = 0;
      }
    }

    Room.updateNeutralSettings(this.name);

  };

  Room.prototype.isControlledRoom = function(){
    return this.controller && this.controller.my && this.controller.level > 0;
  };

  Room.prototype.isClaimedRoom = function(){
    return this.controller && this.controller.my
  };

  Room.prototype.getHarvestorCount = function(){
    var count = 0;
    var harvesterGroups = this.findChildHarvesterGroups();
    for(var i =0; i <  harvesterGroups.length; i++){
      count += harvesterGroups[i].targetHarvesterCount;
    }
    return count;
  };

  Room.prototype.findChildHarvesterGroups = function(){
    var harvesterGroups = [];
    for(var i in Memory.rooms){
      if(settings.get("disabled", i)){
        continue;
      }

      // Only count rooms with visibility and a flag
      if(!Game.rooms[i]){
        continue;
      }
      if(i != this.name && settings.get("parentRoom", i) != this.name){
        continue;
      }
      for(var k in Memory.rooms[i].harvestGroups){
        var harvestGroup = Memory.rooms[i].harvestGroups[k]
        harvesterGroups.push(harvestGroup);
      }
    }
    return harvesterGroups;
  };


  Room.prototype.performLevelUp = function(){
    var log = this.getLogger();
    var level = this.controller.level;
    log("Upgraded to level "+ level);
    settings.set("CurrentLevel", level, this.name);
    switch(level){
      case 1:
        this.createSpawn();
        break;
      case 2:
        this.createExtensions(5);
        module.require("event_road_building").initializeRoads(this.name);
        break;
      case 3:
        this.createTower();
        this.createExtensions(5);
        break;
      case 4:
        this.createStorage();
        this.createExtensions(10);
        this.enableMineralHarvestGroup();
        break;
      case 5:
        this.createTower();
        this.createLink(2);
        this.createExtensions(10);
        break;
      case 6:
        this.createExtensions(10);
        this.createLink();
        this.createExtractor();
        break;
      case 7:
        this.createTower();
        this.createLink();
        this.createExtensions(10);
        break;
      case 8:
        this.createExtensions(10);
        break;
      default:
      // Do nothing
    }
  };

  Room.prototype.createSpawn = function() {
    createStructure("Spawn-", STRUCTURE_SPAWN);
  };

  Room.prototype.createTower = function(){
    createStructure("Tower-", STRUCTURE_TOWER);
  };

  Room.prototype.createLink = function(count){
    createStructure("Link-", STRUCTURE_LINK, count);
  };

  Room.prototype.createStorage = function(){
    createStructure("Storage-", STRUCTURE_STORAGE);
  };

  Room.prototype.createExtractor = function(){
    var minerals = room.getMinerals();
    for(var i in minerals){
      this.createConstructionSite(minerals[i].pos, STRUCTURE_EXTRACTOR);
    }
  };

  function createStructure(flagName, structureType, count){
    if(typeof count != 'number'){
      count = 1;
    }
    for(var i in Game.flags){
      if(Game.flags[i].name.indexOf(flagName)==0 && Game.flags[i].room == room){
        if(this.createConstructionSite(Game.flags[i].pos, structureType) == 0){
          var log = flag.room.getLogger();
          log("Created a "+structureType+" construction site.");
          Game.flags[i].remove();
          count--;
          if(count == 0){
            break;
          }
        }
      }
    }
  }

  Room.prototype.getSetting = function(name){
    return settings.get(name, this.name);
  }

  Room.prototype.setSetting = function(name, value){
    settings.set(name, value, this.name);
  }

  Room.prototype.createExtensions = function(count){
    var log = this.getLogger();
    log("Creating "+count+" extensions");
    var extensionPosition = null;
    for(var i in Game.flags){
      if(Game.flags[i].room == this && Game.flags[i].name.indexOf("Extension-")==0){
        extensionPosition = Game.flags[i].pos;
      }
    }
    if(!extensionPosition){
      return;
    }
    var latticePositions = utils.getLatticePositions(extensionPosition, 50);
    var createdExtensions = 0;
    for(var i in latticePositions){
      var status = this.createConstructionSite(latticePositions[i].x, latticePositions[i].y, STRUCTURE_EXTENSION);
      if(status == 0){
        createdExtensions++;
      }
      if(createdExtensions == count){
        break;
      }
    }
  };

  Room.prototype.enableMineralHarvestGroup = function(){
    for(var i in this.memory.harvestGroups){
      var groupTarget = Game.getObjectById(i);
      if(groupTarget instanceof Mineral){
        this.memory.harvestGroups[i].targetHarvesterCount = 1;
      }
    }
  };

  Room.prototype.hasInvaders = function(){
    return this.find(FIND_HOSTILE_CREEPS).length > 0;
  };

  Room.prototype.needsReservation = function(){
    if( !this.controller.reservation || this.controller.reservation.username == "" || (this.controller.reservation.username == 'Beave' && this.controller.reservation.ticksToEnd < 2000)) {
      return true;
    }
    return false;
  };

  Room.prototype.getParentRoom = function(){
    var parentRoomName = this.getSetting("ParentRoom");
    if(parentRoomName){
      return Game.rooms[parentRoomName];
    } else {
      return null;
    }
  };

  Room.prototype.getSpawnQueue = function(){
    return queueManager.getQueue(this, 'requestSpawns');
  };

  /** Static functions **/
  Room.updateNeutralSettings = function(roomName){
    var parentFlag = Game.flags["Parent-"+roomName];
    if(parentFlag){
      settings.set("ParentRoom", parentFlag.pos.roomName, roomName);
    } else {
      settings.set("ParentRoom", "", roomName);
    }
  };

  /**
   * Fogged room is a room inside fog of war. It can access a subset of room functions.
   * @param roomName
   * @constructor
   */
  FoggedRoom = function(roomName){
    this.name = roomName;
    this.memory = Memory.rooms[roomName];
  };
  FoggedRoom.prototype.creepsByRole = {};
  FoggedRoom.prototype.assignedCreepsByRole = {};
  FoggedRoom.prototype.flagSettings = {};
  FoggedRoom.prototype.getAssignedCreeps = Room.prototype.getAssignedCreeps;
  FoggedRoom.prototype.getAssignedCreepsByRole = Room.prototype.getAssignedCreepsByRole;
  FoggedRoom.prototype.getParentRoom = Room.prototype.getParentRoom;
  FoggedRoom.prototype.getSetting = Room.prototype.getSetting;
  FoggedRoom.prototype.setSetting = Room.prototype.setSetting;

})();