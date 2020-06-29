module.exports = (function() {
    var queueManager = require('utils_queue-manager');
    var utils = require('utils_misc');
    var logFactory = require("utils_logger-factory");
    var settings = require('settings_registry');
    var HarvestGroup = require('harvest-group');

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

    Room.prototype.createSpawnConstructionSite = function(){

    }

    Room.prototype.determineFirstSpawnLocation = function(){
        // First average the locations of all sources and the controller
        let positions = [];
        let sources = this.find(FIND_SOURCES);
        for(let i in sources){
            positions.push(sources[i].pos)
        }
        positions.push(this.controller.pos);
        let sumx = 0;
        let sumy = 0;
        for(let i in positions){
            sumx+= positions[i].x;
            sumy+= positions[i].y;
        }
        let idealx = Math.floor(sumx / positions.length);
        let idealy = Math.floor(sumy / positions.length);
        let idealLocation = {x: idealx, y: idealy}

        // Scan outward to find the spot with the highest distance from walls. Return immediately
        // if a location has 3 or greater.
        let highestDistance = -1;
        let highestDistanceLoc;
        let dt = distanceTransform(this.name);
        for(let iter = 0; iter <= 2; iter++){
            let x1, x2, y1, y2;
            switch(iter){
                case 0:
                    x1 = x2 = y1 = y2 = 0;
                    break;
                case 1:
                    x1 = y1 = -1;
                    y2 = y2 = 1;
                    break;
                case 2:
                    x1 = y1 = -2;
                    x2 = y2 = 2;
                    break;
            }

            for(let x = x1; x <= x2; x++){
                for(let y = y1; y<= y2; y++){
                    let loc = {x: idealLocation.x+x, y: idealLocation.y+y};
                    let distance = dt.get(idealLocation.x +x, idealLocation.y+y);
                    if(distance >=3){
                        return loc;
                    } else {
                        if(distance > highestDistance){
                            highestDistance = distance;
                            highestDistanceLoc = loc
                        }
                    }
                }
            }
        }
        return highestDistanceLoc;
    }


    Room.prototype.initialize = function(){
        var room = this;
        var log = this.getLogger();
        log("Initializing room");
        Memory.rooms[room.name] = {};
        this.initializeHarvestGroups();
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

    Room.prototype.initializeHarvestGroups = function(){
        let sources = this.getSources();
        let minerals = this.getMinerals();
        let harvestGroups = [];
        for(let i = 0; i < sources.length; i++){
            // harvestGroups.push(new HarvestGroup(sources[i].id));
            new HarvestGroup(sources[i].id);
        }
        for(let i = 0; i < minerals.length; i++){
            // harvestGroups.push(new HarvestGroup(minerals[i].id));
            new HarvestGroup(minerals[i].id);
        }
        return harvestGroups;
    };

    Room.prototype.getHarvestGroups = function(){
        let harvestGroups = [];
        for(let i in this.memory.harvestGroups){
            harvestGroups.push(this.memory.harvestGroups[i]);
        }
        return harvestGroups;
    };

    Room.prototype.findParentRoom = function(){
        let roomNameObj = new utils.RoomName(this.name);
        let yDir = roomNameObj.verticalDirection;
        let xDir = roomNameObj.horizonalDirection;
        let xPos = roomNameObj.horizontalPosition;
        let yPos = roomNameObj.verticalPosition;
        let potentialRooms = [];

        for(let x= xPos-1; x <= xPos+1; x++){
            for(let y = yPos-1; y <= yPos+1; y++){
                if(y == yPos && x == xPos){
                    continue;
                }
                let potentialRoomName = xDir + x + yDir + y;
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
            let targetCreepCounts = settings.get("targetCreepCounts", this.name);
            // TODO, this shouldn't happen but it do
            if(!targetCreepCounts){
                console.log("prototype_room.updateSettings"+this.name);
                return;
            }
            targetCreepCounts.researcher = this.getSettingFromFlag("Researchers");
            targetCreepCounts.harvester = this.getHarvestorCount();
            targetCreepCounts.explorer = 1;
            targetCreepCounts.builder = this.getSettingFromFlag("Builders");
            targetCreepCounts.messenger = this.getSettingFromFlag("Messengers");
            targetCreepCounts.deconstructor = 0;
            targetCreepCounts.claimer = 0;
            targetCreepCounts.soldier = 0;
            targetCreepCounts.healer = targetCreepCounts.soldier - 2;
            targetCreepCounts.rangedSoldier = 0;
            targetCreepCounts.soldier = 0;
            targetCreepCounts.spawner = 1;
            targetCreepCounts.miner = 0;
        }

        Room.updateNeutralSettings(this.name);

    };

    Room.prototype.isControlledRoom = function(){
        return this.controller && this.controller.my && this.controller.level > 0;
    };

    Room.prototype.isClaimedRoom = function(){
        return this.controller && this.controller.my;
    };

    Room.prototype.getHarvestorCount = function(){
        let count = 0;
        let harvesterGroups = this.findChildHarvesterGroups();
        for(let i =0; i <  harvesterGroups.length; i++){
            count += harvesterGroups[i].targetHarvesterCount;
        }
        return count;
    };

    Room.prototype.findChildHarvesterGroups = function(){
        let harvesterGroups = [];
        for(let i in Memory.rooms){
            if(settings.get("disabled", i)){
                continue;
            }

            // Only count rooms with visibility and a flag
            if(!Game.rooms[i]){
                continue;
            }
            if(i !== this.name && settings.get("parentRoom", i) !== this.name){
                continue;
            }
            for(let k in Memory.rooms[i].harvestGroups){
                let harvestGroup = Memory.rooms[i].harvestGroups[k];
                if(harvestGroup === null){ // This was caused by some bad memory in one of my games.
                    continue;
                }
                harvesterGroups.push(harvestGroup);
            }
        }
        return harvesterGroups;
    };


    Room.prototype.performLevelUp = function(){
        let log = this.getLogger();
        let level = this.controller.level;
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
        // if(this.getMySpawns().length === 0){
            let pos = this.determineFirstSpawnLocation();
            this.createConstructionSite(pos, STRUCTURE_SPAWN);
        // }
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
        let minerals = room.getMinerals();
        for(let i in minerals){
            this.createConstructionSite(minerals[i].pos, STRUCTURE_EXTRACTOR);
        }
    };

    function createStructure(flagName, structureType, count){
        if(typeof count != 'number'){
            count = 1;
        }
        for(let flagName in Game.flags){
            if(Game.flags[flagName].name.indexOf(flagName)===0 && Game.flags[flagName].room === this){
                if(this.createConstructionSite(Game.flags[flagName].pos, structureType) === 0){
                    let log = flag.room.getLogger();
                    log("Created a "+structureType+" construction site.");
                    Game.flags[flagName].remove();
                    count--;
                    if(count === 0){
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
        let log = this.getLogger();
        log("Creating "+count+" extensions");
        let extensionPosition = null;
        for(let i in Game.flags){
            if(Game.flags[i].room == this && Game.flags[i].name.indexOf("Extension-")==0){
                extensionPosition = Game.flags[i].pos;
            }
        }
        if(!extensionPosition){
            return;
        }
        let latticePositions = utils.getLatticePositions(extensionPosition, 50);
        let createdExtensions = 0;
        for(let i in latticePositions){
            let status = this.createConstructionSite(latticePositions[i].x, latticePositions[i].y, STRUCTURE_EXTENSION);
            if(status == 0){
                createdExtensions++;
            }
            if(createdExtensions == count){
                break;
            }
        }
    };

    Room.prototype.enableMineralHarvestGroup = function(){
        for(let i in this.memory.harvestGroups){
            let groupTarget = Game.getObjectById(i);
            if(groupTarget instanceof Mineral){
                this.memory.harvestGroups[i].targetHarvesterCount = 1;
            }
        }
    };

    Room.prototype.hasInvaders = function(){
        return this.find(FIND_HOSTILE_CREEPS).length > 0;
    };

    Room.prototype.needsReservation = function(){
        return false;
//     if( !this.controller.reservation || this.controller.reservation.username == "" || (this.controller.reservation.username == 'Beave' && this.controller.reservation.ticksToEnd < 2000)) {
//       return true;
//     }
//     return false;
    };

    Room.prototype.getParentRoom = function(){
        let parentRoomName = this.getSetting("ParentRoom");
        if(parentRoomName){
            return Game.rooms[parentRoomName];
        } else {
            return null;
        }
    };

    Room.prototype.getSpawnQueue = function(){
        return queueManager.getQueue(this, 'requestSpawns');
    };

    Room.prototype.getDistanceTransform = function(){
        let dt = this.getSetting("distanceTransform");
        if(dt){
            dt = PathFinder.CostMatrix.deserialize(dt)
            return dt;
        } else {
            dt = distanceTransform(this.name);
            this.setSetting("distanceTransform", dt.serialize());
            return dt;
        }
    }

    /** Static functions **/
    Room.updateNeutralSettings = function(roomName){
        let parentFlag = Game.flags["Parent-"+roomName];
        if(parentFlag){
            settings.set("ParentRoom", parentFlag.pos.roomName, roomName);
        } else {
            settings.set("ParentRoom", "", roomName);
        }
    };

    /** Private functions **/
    function distanceTransform(roomName) {
        let terrain = Game.rooms[roomName].getTerrain()
        let topDownPass = new PathFinder.CostMatrix();
        for (let y = 0; y < 50; ++y) {
            for (let x = 0; x < 50; ++x) {
                if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                    topDownPass.set(x, y, 0);
                }
                else {
                    topDownPass.set(x, y,
                            Math.min(topDownPass.get(x-1, y-1),
                                topDownPass.get(x, y-1),
                                topDownPass.get(x+1, y-1),
                                topDownPass.get(x-1, y)) + 1);
                }
            }
        }

        for (let y = 49; y >= 0; --y) {
            for (let x = 49; x >= 0; --x) {
                let value = Math.min(topDownPass.get(x, y),
                    topDownPass.get(x+1, y+1) + 1,
                    topDownPass.get(x, y+1) + 1,
                    topDownPass.get(x-1, y+1) + 1,
                    topDownPass.get(x+1, y) + 1);
                topDownPass.set(x, y, value);
            }
        }
        return topDownPass;
    }

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
