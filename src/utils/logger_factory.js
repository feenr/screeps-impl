module.exports = (function(){

    var publicAPI = {};
    publicAPI.getRoomLogger = function(roomName){
        var logger = {};
        logger.log = function(message){
            console.log("<font color=\"#809fff\"><a href='/a/#!/room/"+roomName+"'>"+roomName+"</a></font>: "+message);
        };
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
        
        return logger;
    }
    

    publicAPI.getEventLogger = function(){

    }
    return publicAPI;
})();