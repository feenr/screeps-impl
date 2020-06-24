var ScreepsStats = require('./lib_screepsstats');
global.Stats = new ScreepsStats();

require('./prototype_extensions');
require('./prototype_creep');
require('./prototype_room');
require('./prototype_flag');
require('./prototype_room_position');
require('./prototype_structure_base');
require('./prototype_structure_spawn');
require('./prototype_structure_tower');
require('./prototype_structure_terminal');
require('./prototype_structure_lab');

var scripts = {
    room : require('./room'),
    utils : require('./utils_misc'),
    logFactory : require('./utils_logger_factory')
};

module.exports.loop = function () {
    //return;
    console.log("Hi geek night")
    var cpuLog = scripts.logFactory.getCPULogger();
    var tickLogger = scripts.logFactory.getCPULogger();
    tickLogger.startReading("tick");

    var memoryManager = require('./utils_memory_management');
    memoryManager.cleanUp();


    // Perform rooms
    //var room = require('room');
    // Initialize rooms which are visible, but not yet in memory.
    for(var roomName in Game.rooms){
        if(!Memory.rooms[roomName]){
            try {
                Game.rooms[roomName].initialize();
                // End this tick early.
                return;
            } catch (e) {
                console.log("Exception processing room "+roomName+"\n"+e.stack);
            }
        }
    }
    
    cpuLog.startReading("rooms");
    for(var roomName in Memory.rooms){
        try {
            scripts.room.perform(roomName);
        } catch (e) {
            console.log("Exception processing room "+roomName+"\n"+e.stack);
        }
    }
    cpuLog.endReading();

    // Perform creeps
    cpuLog.startReading("creeps");
    var creepTemplates = require('./settings_creeps');
    for(var creepId in Game.creeps){
        try {
            var template = creepTemplates[Memory.creeps[creepId].role];
            template.action(Game.creeps[creepId]);
        } catch(e) {
            console.log("Exception processing creep: "+Game.creeps[creepId].room.name +" "+Game.creeps[creepId].name+"\n"+e)
        }
    }
    cpuLog.endReading();
    
    // Perform structures
    for(var structureId in Game.structures){
        var structure = Game.structures[structureId];
        structure.perform();
    }
    
    // Perform harvest groups
    
    
    // Perform Event schedules
    var schedule = require('./event_scheduler');
    schedule.processActions();

    var events = require("./event_definitions");
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
    tickLogger.endReading("tick");
    Stats.runBuiltinStats();
}