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

const roomScript = require('room');
const logFactory = require('utils_logger-factory');
const stats= require('utils_collect-stats');
const memoryManagement= require('utils_memory-management');
const creepSettings= require('settings_creeps');
const eventDefinitions= require("event_definitions");
const eventsScheduler= require('event_scheduler');
const viz = require('utils_visuals')

module.exports.loop = function () {

    const logger = logFactory.getLogger();
    memoryManagement.bootstrap();
    memoryManagement.cleanUp();

    // Initialize new rooms
    for(let roomName in Game.rooms){
        if(!Memory.rooms[roomName]){
            try {
                Game.rooms[roomName].initialize();
                // Initialization is expensive. End this tick early.
                return;
            } catch (e) {
                logger.logError("Exception processing room "+roomName+"\n"+e+" "+e.stack);
            }
        }
    }

    // Perform rooms
    for(let roomName in Memory.rooms){
        try {
            roomScript.perform(roomName);
            viz.visualizeRoadLocations(roomName);
            //viz.visualizeDistanceTransform(roomName);
        } catch (e) {
            logger.logError("Exception processing room "+roomName+"\n"+e+" "+e.stack);
        }
    }

    // Perform creeps
    for(let creepId in Game.creeps){
        try {
            let template = creepSettings[Memory.creeps[creepId].role];
            template.action(Game.creeps[creepId]);
        } catch(e) {
            logger.logError("Exception processing creep: "+Game.creeps[creepId].room.name +" "+Game.creeps[creepId].name+"\n"+e+" "+e.stack)
        }
    }

    // Perform structures
    for(let structureId in Game.structures){
        let structure = Game.structures[structureId];
        structure.perform();
    }

    // Perform harvest groups
    // TODO This is currently called in the room logic.

    // Perform Event schedules
    let schedule = eventsScheduler;
    schedule.processActions();
    schedule.scheduleEvents(eventDefinitions);

    // Post tick stats for grafana
    stats.exportStats();
};
