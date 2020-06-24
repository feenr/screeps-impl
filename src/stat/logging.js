module.exports = (function(){
    
     var stats = Memory.stats || (Memory.stats = {});
     
     var publicAPI = {};
     
     // Not required, but requested to use these stat types
     
     publicAPI.STAT_SPAWN_CREEP = "Spawn creep";
     publicAPI.STAT_RETURN_ENERGY = "Return energy";
     publicAPI.STAT_DESTROYED_ENEMY_STRUCTURE = "Destroyed enemy structure";
     publicAPI.STAT_DESTROYED_ENEMY_CREEP = "Destroyed enemy creep";
     publicAPI.STAT_CREATE_HARVEST_GROUP = "Create a harvest group";
     publicAPI.STAT_COMPLETE_CONSTRUCTION = "Complete construction";
     
     
     
     publicAPI.record = function(statType, details){
        var statArray = stats[statType] || (stats[statType] = []);
        statArray.push({time: Game.time, details: details});
     }
     
     return publicAPI;
     
 })();