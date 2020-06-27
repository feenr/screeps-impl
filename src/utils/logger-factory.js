module.exports = (function(){

    var publicAPI = {};

    publicAPI.getLogger = function(roomName){
        var logger = {};
        logger.log = log;
        logger.logEvent = logEvent;
        logger.logError = logError;
        return logger;
    };

    publicAPI.getRoomLogger = function(roomName){
        var logger = {};
        logger.log = function(message){
            console.log("<font color=\"#809fff\"><a href='/a/#!/room/"+roomName+"'>"+roomName+"</a></font>: "+message);
        };
        logger.logEvent = logEvent;
        logger.logError = logError;
        return logger;
    };

    publicAPI.getCreepLogger = function(creep){
        var creepTemplates = require("settings_creeps");
        var color = creepTemplates[creep.memory.role].color || 'white';
        var logger = {};
        var roomName = creep.room.name;
        logger.log = function(message){
            if(creep) {
                console.log("<font type='highlight'><a href='/a/#!/room/" + roomName + "'>" + roomName + "</a></font> <span style='color:"+color+"'>" + creep.name + "</span>: " + message);
            }
        };
        logger.logEvent = logEvent;
        logger.logError = logError;
        return logger;
    };

    publicAPI.getStructureLogger = function(structure){
        var logger = {};
        var roomName = structure.room.name;
        logger.log = function(message){
            if(structure) {
                console.log("<a href='/a/#!/room/" + roomName + "'>" + roomName + "</a> " + structure.structureType + ": " + message);
            }
        };
        logger.logEvent = logEvent;
        logger.logError = logError;
        return logger;
    }
    
    publicAPI.getCPULogger = function(){
        var logger = {};
        var startCPU;
        var eventName;
        logger.startReading = function(aEventName){
            if(!Memory.settings.cpuUsage){
                return;
            }
            startCPU = Game.cpu.getUsed();
            eventName = aEventName;
        }
        logger.endReading = function(){
            if(!Memory.settings.cpuUsage){
                return;
            }
            cpuUsed = (Math.round((Game.cpu.getUsed()-startCPU) * 100))/100
            console.log(eventName+": "+cpuUsed+" ");
        }
        logger.logEvent = logEvent;
        logger.logError = logError;
        return logger;
    }

    function logEvent(message){
        console.log("<span style='color: yellow;'>" + message + "</span>");
    }

    function logError(message){
        console.log("<span style='color: yellow;'>" + message + "</span>");
    }

    function log(message){
        console.log("<span style='color: gray;'>" + message + "</span>");
    }

    return publicAPI;
})();
