require('proto_extensions');
require('prototype_creep');
require('proto_structure');
require('proto_room');

var scripts = {
    room : require('room'),
    utils : require('utils'),
    logFactory : require('logger-factory'),
    stats: require('collect-stats')
}
module.exports.loop = function () {
    //return;
    var settings = require("settings");
    
    var cpuLog = scripts.logFactory.getCPULogger();
    var tickLogger = scripts.logFactory.getCPULogger();
    tickLogger.startReading("tick");
    // Flags:
    // Rally - will lead all soldiers to this flag. Secondary color determines the number of soldiers.
    // Room-EXXNYY - will lead a single explorer to another room. 

    var memoryManager = require('memory-management');
    memoryManager.cleanUp();
    
    var colony = require('colony');

    // Perform rooms
    //var room = require('room');
    for(var i in Game.rooms){
        if(!Memory.rooms[i]){
            try {
                Game.rooms[i].initialize();
                // End this tick early.
                return;
            } catch (e) {
                console.log("Exception processing room "+i+"\n"+e);
            }
        }
    }
    
    cpuLog.startReading("rooms");
    for(var i in Memory.rooms){
        try {
            scripts.room.perform(i);
            //room.performTick();
        } catch (e) {
            console.log("Exception processing room "+i+"\n"+e.stack);
        }
    }
    cpuLog.endReading();

    // Perform creeps
    cpuLog.startReading("creeps");
    var creepTemplates = require('creep-templates');
    for(var i in Game.creeps){
        try {
            var template = creepTemplates[Memory.creeps[i].role];
            template.action(Game.creeps[i]);
        } catch(e) {
            console.log("Exception processing creep: "+Game.creeps[i].room.name +" "+Game.creeps[i].name+"\n"+e)
        }
    }
    cpuLog.endReading();
    
    // Perform structures
    var structure_definitions = require('structure_definitions');
    for(var i in Game.structures){
        var definition = structure_definitions[Game.structures[i].structureType];
        if(definition && definition.action){
            definition.action(Game.structures[i]);
        }
    }
    
    // Perform harvest groups
    
    
    // Perform Event schedules
    var schedule = require('event_scheduler');
    schedule.processActions();

    var events = require("event_definitions");
    for(var i in events){
        var event = events[i];
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
    scripts.stats.exportStats();
    //Memory.remove('___screeps_stats');
}