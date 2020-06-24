module.exports = (function(){
    var settings = require('settings');
    var templates = require('creep_templates'); 
    var utils = require('utils');
    var queueManager = require('queue_manager');

    var room;
    var spawns;
    var log;
    var roomName;
    var spawns;

    function perform(aRoomName){
        roomName = aRoomName;
        room = Game.rooms[roomName];

        if(!room || !room.controller || !room.controller.my){
            performNeutralRoom();
            return;
        }

        log = require("logger_factory").getRoomLogger(room.name).log;
        spawns = room.find(FIND_MY_SPAWNS);


        if(checkRoomLevel()){
            return;
        }
        performTransfers();
        processHarvestGroups();
        updateRoomSettings();
        //lookForDroppredResourced();
    }

    function updateRoomSettings(){
        var targetCreepCounts = settings.get("targetCreepCounts", room.name);
        targetCreepCounts.researcher = room.getSettingFromFlag("Researchers");
        targetCreepCounts.harvester = getHarvestorCount();
        targetCreepCounts.explorer = getExplorerCount();
        targetCreepCounts.builder = room.getSettingFromFlag("Builders");
        targetCreepCounts.messenger = room.getSettingFromFlag("Messengers");
        targetCreepCounts.deconstructor = 0;
        targetCreepCounts.colonizer = 0;
        targetCreepCounts.soldier = 0;
        targetCreepCounts.healer = targetCreepCounts.soldier -2; 
        targetCreepCounts.rangedSoldier = 0;
        targetCreepCounts.soldier = 0;
        if(room.name == 'W5S1'){
            targetCreepCounts.colonizer= 0;
        }
        if(room.name == 'W13N2'){
            targetCreepCounts.spawner= 0;
        }
        if(room.name == 'W1N1'){
            targetCreepCounts.soldier = 0;
        }
        
    }
    
    function getHarvestorCount(){
        var count = 0; 
        var harvesterGroups = findChildHarvesterGroups();
        for(var i =0; i <  harvesterGroups.length; i++){
            count += harvesterGroups[i].targetHarvesterCount;
        }

        return count;
    }
    
    function getSoldierCount(){
        if(settings.get('defaultRoom') != room.name){
            return 0;
        }
        var count = 0;
        var flag = Game.flags["Rally-"+room.name];
        if(flag){
            count = flag.getSetting();
        }
        return count;
    }
    
    function getColonizerCount(){
        var count = 0;
        for(var i in Game.flags){
            if(i.indexOf("Claim") ==0){
                count++;
            }
        }   
        return count;
    }

    function getExplorerCount(){
        if(Game.flags["Explore-"+room.name]){
            return 1;
        }
        return 0;
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
        var harvestGroup = require('harvest_group');
        var groups = Memory.rooms[room.name].harvestGroups;
        groups = utils.sortByPriority(groups);
        for(var i in groups){
            harvestGroup(groups[i].name);
        }
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
        log = require("logger_factory").getRoomLogger(room.name).log;
        room.memory.spawnsNeeded = false;
        spawns = room.find(FIND_MY_SPAWNS);
        var targetCreepCounts = settings.get("targetCreepCounts", room.name);
        for(var i in templates){
            var template = templates[i];
            var currentCreepCount = room.getCreepsByRole(template.role).length;
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
            }
        }
        var spawnQueue = queueManager.getQueue(room, 'requestSpawns');
        if(spawnQueue.size() > 0){
            var creepRequest = spawnQueue.shift();
            for(var i in spawns) {
                var spawn = spawns[i];
                if (!spawn.spawning && !spawn.spawnQueued) {
                    addCreep(spawn, templates[creepRequest.role], creepRequest.memory);
                    spawn.spawnQueued = true;
                    break;
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
        memory.room = room.name;
        var spawnedCreep = spawn.createCreep(parts, null, memory);

        if(typeof spawnedCreep != 'string'){
            log("Error creating creep: "+spawnedCreep+" "+room.name+" "+template.role+" "+parts);
            //Error
        } else {
            log("Created a "+template.role + " with "+ parts.length + " parts for " + creepCost + " energy.");
            //stats.record("room.addCreep", {parts : parts, room : room.Id, role : template.role})
        }
    }

    function performNeutralRoom(){
        setEnabledDisabled();

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

    function findChildHarvesterGroups(){
        var harvesterGroups = [];
        for(var i in Memory.rooms){
            if(settings.get("disabled", i)){
                continue;
            }
            
            // Only count rooms with visibility and a flag
            if(!Game.rooms[i]){
                continue;
            }
            if(i != room.name && settings.get("parentRoom", i) != room.name){
                continue;
            }
            for(var k in Memory.rooms[i].harvestGroups){
                var harvestGroup = Memory.rooms[i].harvestGroups[k]
                harvesterGroups.push(harvestGroup);
            }
        }
        return harvesterGroups;
    }


    function checkRoomLevel(){
        var level = settings.get("CurrentLevel", room.name);
        if(level != room.controller.level){
            performLevelUp(room.controller.level);
            return true;
        }
    }

    function performLevelUp(level){
        log("Upgraded to level "+ level);
        settings.set("CurrentLevel", room.controller.level, room.name);
        switch(level){
            case 1:
                createSpawn();
                break;
            case 2:
                createExtensions(5);
                break;
            case 3:
                createTower();
                createExtensions(5);    
                break;
            case 4:
                createStorage();
                createExtensions(10);
                enableMineralHarvestGroup();
                break;
            case 5:
                createTower();
                createLink(2);
                createExtensions(10);
                break;
            case 6:
                createExtensions(10);
                createLink();
                createExtractor();
                break;
            case 7:
                createTower();
                createLink();
                createExtensions(10);
                break;
            case 8:
                createExtensions(10);
                break;
            default:
                // Do nothing
        }
    }
    function createSpawn() {
        createStructure("Spawn-", STRUCTURE_SPAWN);
    }

    function createTower(){
        createStructure("Tower-", STRUCTURE_TOWER);
    }

    function createLink(count){
        createStructure("Link-", STRUCTURE_LINK, count);
    }

    function createStorage(){
        createStructure("Storage-", STRUCTURE_STORAGE);
    }
    
    function createExtractor(){
        var minerals = room.getMinerals();
        for(var i in minerals){
            room.createConstructionSite(minerals[i].pos, STRUCTURE_EXTRACTOR);
        }
    }

    function createStructure(flagName, structureType, count){
        if(typeof count != 'number'){
            count = 1;
        }
        log("Creating a "+structureType+" construction site.");
        for(var i in Game.flags){
            if(Game.flags[i].name.indexOf(flagName)==0 && Game.flags[i].room == room){
                if(room.createConstructionSite(Game.flags[i].pos, structureType) == 0){
                    Game.flags[i].remove();
                    count--;
                    if(count == 0){
                        break;
                    }
                }
            }
        }
    }

    function createExtensions(count){
        log("Creating "+count+" extensions");
        var extensionPosition = null;
        for(var i in Game.flags){
            if(Game.flags[i].room == room && Game.flags[i].name.indexOf("Extension-")==0){
                extensionPosition = Game.flags[i].pos;
            }
        }
        if(!extensionPosition){
            return;
        }
        var latticePositions = utils.getLatticePositions(extensionPosition, 50);                
        var createdExtensions = 0;
        for(var i in latticePositions){
            var status = room.createConstructionSite(latticePositions[i].x, latticePositions[i].y, STRUCTURE_EXTENSION);
            if(status == 0){
                createdExtensions++;
            }
            if(createdExtensions == count){
                break;
            }       
        }
    }
    
    function enableMineralHarvestGroup(){
        for(var i in room.memory.harvestGroups){
            var groupTarget = Game.getObjectById(i);
            if(groupTarget instanceof Mineral){
                room.memory.harvestGroup[i].targetHarvesterCount = 1;
            }
        }
    }
    
    var publicAPI = {};
    publicAPI.perform = perform;
    publicAPI.spawnCreeps = spawnCreeps;
    return publicAPI;
})();



