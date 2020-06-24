module.exports = (function(){
  var settings = require('./utils_settings_registry');
  var templates = require('./settings_creeps');
  var utils = require('./utils_misc');
  var queueManager = require('./utils_queue_manager');

  var room;
  var spawns;
  var log;
  var roomName;
  var spawns;

  function perform(aRoomName){
    roomName = aRoomName;
    room = Game.rooms[roomName];

    if(!room || !room.controller || !room.controller.my){

      if(!room){
        room = new FoggedRoom(roomName);
        Room.updateNeutralSettings(roomName);
        spawnExplorer(room);
        return;
      } else {
        room.updateSettings();
        performNeutralRoom(room);
      }

      return;
    }

    log = room.getLogger();
    spawns = room.find(FIND_MY_SPAWNS);


    if(checkRoomLevel()){
      return;
    }
    performTransfers();
    processHarvestGroups();
    room.updateSettings();
    processConstructionSites();
    //lookForDroppredResourced();
  }

  function performTransfers(){
    if(room.memory.spawnsNeeded){
      return;
    }
    for(var i in spawns) {
      spawns[i].performTransfers();
    }
  }

  function processHarvestGroups(){
    var harvestGroup = require('./harvest_group');
    var groups = Memory.rooms[room.name].harvestGroups;
    groups = utils.sortByPriority(groups);
    for(var i in groups){
      harvestGroup(groups[i].name);
    }
  }

  function processConstructionSites(){
    var sites = room.getMyConstructionSites();
    room.memory.constructionSites = room.memory.constructionSites || {};
    for(var i in sites){
      var site = sites[i];
      if(!room.memory.constructionSites[site.id]){
        room.memory.constructionSites[site.id] = {
          type : sites[i].structureType,
          x : site.pos.x,
          y : site.pos.y
        };
      }
    }
    for(var k in room.memory.constructionSites){
      if(!Game.getObjectById(k)){
        var missingSite = room.memory.constructionSites[k];
        var lookAtResult  =room.lookAt(missingSite.x, missingSite.y);
        lookAtResult = _.filter(lookAtResult, function(o){return o.type == 'structure'});
        lookAtResult = _.map(lookAtResult, function(o){return o.structure});
        for(var n in lookAtResult){
          if(lookAtResult[n].structureType == missingSite.type){
            constructionCompleteEvent(lookAtResult[n]);
            delete room.memory.constructionSites[k];
          }
        }
      }
    }
  }

  function constructionCompleteEvent(structure){
    console.log("CONSTRUCTION COMPLETE"+structure.structureType);
  }

  function lookForDroppredResourced(){
    var droppedResourceQueue = queueManager.getQueue(room,"droppedResources");
    var droppedResources = room.find(FIND_DROPPED_RESOURCES);
    for(var i in droppedResources){
      if(!droppedResourceQueue.contains(droppedResources[i].id)){
        droppedResourceQueue.push(droppedResources[i].id);
      }
    }

  }

  function spawnCreeps(roomName){
    room = Game.rooms[roomName];
    log = require("./utils_logger_factory").getRoomLogger(room.name).log;
    room.memory.spawnsNeeded = false;
    spawns = room.find(FIND_MY_SPAWNS);
    var targetCreepCounts = settings.get("targetCreepCounts", room.name);
    // TODO This should not happen but it do
    if(!targetCreepCounts){
      log("ERROR: room.spawnCreeps targetCreepCounts is null");
      return;
    }
    for(var i in templates){
      var template = templates[i];
      var currentCreepCount = room.getAssignedCreepsByRole(template.role).length;
      if(currentCreepCount < (targetCreepCounts[template.role] || 0)){
        log("Need to spawn "+template.role+" ("+currentCreepCount + "/" + targetCreepCounts[template.role]+")");
        for(var i in spawns) {
          var spawn = spawns[i];
          if(!spawn.spawning && !spawn.spawnQueued) {
            var makeMax = false; // Something small I am trying out...
            if(currentCreepCount >= 1){
              makeMax = true;
            }
            addCreep(spawn, template, {}, makeMax);
            spawn.spawnQueued = true;
            break;
          }
        }
        break;
      } else if(currentCreepCount > (targetCreepCounts[template.role] || 0)){
        if((targetCreepCounts[template.role] || 0) > 0){
          log("Room has too many "+template.role+" "+ currentCreepCount+"'s: / "+(targetCreepCounts[template.role] || 0));
        }
      }
    }
    var spawnQueue = queueManager.getQueue(room, 'requestSpawns');
    if(spawnQueue.size() > 0){
      var creepRequest = spawnQueue.peekBottom();
      for(var i in spawns) {
        var spawn = spawns[i];
        if (!spawn.spawning && !spawn.spawnQueued) {
          var status = addCreep(spawn, templates[creepRequest.role], creepRequest.memory);
          if(typeof status != "number" || status >= 0){
            log("Spawning queued "+creepRequest.role+" with memory "+JSON.stringify(creepRequest.memory));
            spawnQueue.shift();
            spawn.spawnQueued = true;
            break;
          } else {
            log("Failed to spawn queued "+creepRequest.role+" with memory "+JSON.stringify(creepRequest.memory)+": "+status);
          }
        }
      }
    }
  }

  function addCreep(spawn, template, memory, makeMax){
    var totalAvailable = room.energyAvailable;
    var totalStorage = room.energyCapacityAvailable;
    var creepCost = 0;
    var parts = [];
    var partIndex = 0;

    //Only create a creep when the spawn is full?
    if(totalAvailable < totalStorage){
      //log("Waiting for energy: "+totalAvailable+" / "+totalStorage)
      if(typeof template.maxSize == "boolean" && template.maxSize){
        return;
      }
    }

    if(template.cappedSize){
      parts = template.skills;
    } else {
      //Create the biggest creep we can with current energy.
      while (true){
        var part = template.skills[partIndex];
        if(utils.partCosts[part] + creepCost > totalAvailable){
          break;
        }
        parts.push(part);
        if(parts.length == 50){
          break;
        }
        if(typeof template.maxSize == 'number' && template.maxSize == parts.length){
          break;
        }
        creepCost += utils.partCosts[part];
        partIndex = (partIndex+1)%template.skills.length;
      }
      // This creep is smaller than the minimum allowed.
      if(makeMax && template.maxSize < parts.length){
        room.memory.spawnsNeeded = true;
        return false;
      }
      if(parts.length < template.skills.length){
        room.memory.spawnsNeeded = true;
        return false;
      }
    }
    // This creep won't have the minimum requirements. Exit here.

    // Move all heavy parts to the start of the array
    var toughParts = [];
    parts = parts.filter(function(part){
      if(part == TOUGH){
        toughParts.push(part);
        return false;
      } else {
        return true;
      }
    });
    parts = toughParts.concat(parts);
    memory = memory || {};
    memory.role = template.role;
    if(!memory.room){
      memory.room = room.name;
    }
    var spawnedCreep = spawn.createCreep(parts, null, memory);

    if(typeof spawnedCreep != 'string'){
      log("Error creating creep: "+spawnedCreep+" "+room.name+" "+template.role+" "+parts);
      //Error
    } else {
      log("Created a "+template.role + " with "+ parts.length + " parts for " + creepCost + " energy.");
      //stats.record("room.addCreep", {parts : parts, room : room.Id, role : template.role})
    }
  }

  function performNeutralRoom(room){
    setEnabledDisabled();
    if(settings.get("disabled", room.name)){
      return;
    }
    if(room.hasInvaders()){
      return;
    }
    // return here fixes JSON exception.
    if(room.needsReservation()) {
      if (room.getAssignedCreepsByRole('reserver').length < 1) {
        var parentRoom = room.getParentRoom();
        if (parentRoom) {
          var queue = room.getParentRoom().getSpawnQueue();
          var queueRequest = {role: "reserver", memory: {room: room.name}};
          if (queue.containsCount(queueRequest) < 1) {
            queue.push(queueRequest);
          }
        }
      }
    }
    var remoteHarvesterCount = (room.getHarvestGroups().length-1) * 2;
    if(room.getAssignedCreepsByRole('messenger').length < remoteHarvesterCount){
      var parentRoom = room.getParentRoom();
      if(parentRoom) {
        var queue = parentRoom.getSpawnQueue();
        var queueRequest = {role: "messenger", memory: {room: room.name}};
        if (queue.containsCount(queueRequest) < 1) {
          queue.push(queueRequest);
        }
      }
    }

    processHarvestGroups();
  }

  function spawnExplorer(foggedRoom){
    var explorerCount = foggedRoom.getAssignedCreepsByRole("explorer").length
    if(explorerCount < 1){
      var parentRoom = foggedRoom.getParentRoom();
      if(parentRoom){
        var queue = room.getParentRoom().getSpawnQueue();
        var queueRequest = {role:"explorer", memory :{ room: room.name}}
        if(queue.containsCount(queueRequest) < 1){
          queue.push(queueRequest);
        }
      }
    }
  }

  function setEnabledDisabled(){
    if(!room || !room.controller || !room.controller.my) {
      if (Game.flags["Disabled-" + roomName]) {
        settings.set("disabled", true, roomName);
      } else {
        settings.set("disabled", false, roomName);
      }
    }
  }

  function checkRoomLevel(){
    var level = settings.get("CurrentLevel", room.name);
    if(level != room.controller.level){
      room.performLevelUp();
      return true;
    }
  }

  /* Just wanted to get this working... will move this*/
  function claimRoom(roomName){
    room = Game.memory.room();
    if(room && !room.needsReservation()){
      return;
    }
    for(var i in Game.creeps){

    }
  }

  var publicAPI = {};
  publicAPI.perform = perform;
  publicAPI.spawnCreeps = spawnCreeps;
  publicAPI.claimroom = claimRoom;
  return publicAPI;
})();