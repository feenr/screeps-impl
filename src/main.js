require('prototype_creep');
require('prototype_flag');
require('prototype_room');
require('prototype_room_position');
require('prototype_structure');
require('prototype_structure_lab');
require('prototype_structure_link');
require('prototype_structure_spawn');
require('prototype_structure_storage');
require('prototype_structure_terminal');
require('prototype_structure_tower');

var scripts = {
    room : require('room'),
    utils : require('utils_misc'),
    logFactory : require('utils_logger-factory'),
    stats: require('utils_collect-stats'),
    colony: require('colony'),
    memoryManagement: require('utils_memory-management'),
    creepSettings: require('settings_creeps'),
    structureDefinitions: require('structure_definitions'),
    eventDefinitions: require("event_definitions"),
    eventsScheduler: require('event_scheduler')
};

module.exports.loop = function () {
    // Flags:
    // Rally - will lead all soldiers to this flag. Secondary color determines the number of soldiers.
    // Room-EXXNYY - will lead a single explorer to another room.

    var memoryManager = scripts.memoryManagement;
    memoryManager.cleanUp();

    // Perform rooms
    for(var roomName in Game.rooms){
        if(!Memory.rooms[roomName]){
            try {
                Game.rooms[roomName].initialize();
                // End this tick early.
                return;
            } catch (e) {
                console.log("Exception processing room "+roomName+"\n"+e);
            }
        }
    }

    // cpuLog.startReading("rooms");
    for(var roomName in Memory.rooms){
        try {
            scripts.room.perform(roomName);
            //room.performTick();
        } catch (e) {
            console.log("Exception processing room "+roomName+"\n"+e.stack);
        }
    }
    // cpuLog.endReading();

    // Perform creeps
    // cpuLog.startReading("creeps");
    var creepTemplates = scripts.creepSettings;
    for(var creepId in Game.creeps){
        try {
            var template = creepTemplates[Memory.creeps[creepId].role];
            template.action(Game.creeps[creepId]);
        } catch(e) {
            console.log("Exception processing creep: "+Game.creeps[creepId].room.name +" "+Game.creeps[creepId].name+"\n"+e)
        }
    }
    // cpuLog.endReading();

    // Perform structures
    for(var structureId in Game.structures){
        var structure = Game.structures[structureId];
        structure.perform();
    }

    // Perform harvest groups


    // Perform Event schedules
    var schedule = scripts.eventsScheduler;
    schedule.processActions();

    var events = scripts.eventDefinitions;
    for(var eventName in events){
        var event = events[eventName];
        if(!Memory.EventRegistry[event.name]){
            if(!event.disabled){
                schedule.registerAction(event.name, event.module, event.functionName, event.parameters, event.interval);
            }
        } else {
            if (event.disabled){
                schedule.deregisterAction(event.name);
            }
        }
    }
    // tickLogger.endReading("tick");
    scripts.stats.exportStats();
};