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
    memoryManagement: require('utils_memory-management'),
    creepSettings: require('settings_creeps'),
    structureDefinitions: require('structure_definitions'),
    eventDefinitions: require("event_definitions"),
    eventsScheduler: require('event_scheduler'),
    viz: require('utils_visuals')
};

module.exports.loop = function () {

    const logger = scripts.logFactory.getLogger();
    scripts.memoryManagement.bootstrap();
    scripts.memoryManagement.cleanUp();

    // Initialize new rooms
    for(var roomName in Game.rooms){
        if(!Memory.rooms[roomName]){
            try {
                Game.rooms[roomName].initialize();
                // Initialization is expensive. End this tick early.
                return;
            } catch (e) {
                logger.logError("Exception processing room "+roomName+"\n"+e);
            }
        }
    }

    // Perform rooms
    for(var roomName in Memory.rooms){
        try {
            scripts.room.perform(roomName);
            scripts.viz.visualizeRoadLocations(roomName);
            //scripts.viz.visualizeDistanceTransform(roomName);
        } catch (e) {
            logger.logError("Exception processing room "+roomName+"\n"+e.stack);
        }
    }

    // Perform creeps
    for(var creepId in Game.creeps){
        try {
            var template = scripts.creepSettings[Memory.creeps[creepId].role];
            template.action(Game.creeps[creepId]);
        } catch(e) {
            logger.logError("Exception processing creep: "+Game.creeps[creepId].room.name +" "+Game.creeps[creepId].name+"\n"+e)
        }
    }

    // Perform structures
    for(var structureId in Game.structures){
        var structure = Game.structures[structureId];
        structure.perform();
    }

    // Perform harvest groups
    // TODO This is currently called in the room logic.

    // Perform Event schedules
    var schedule = scripts.eventsScheduler;
    schedule.processActions();

    // Register scheduled events
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


    // Post tick stats for grafana
    scripts.stats.exportStats();
};
