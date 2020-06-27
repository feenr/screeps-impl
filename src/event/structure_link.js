module.exports = (function(){
    var publicAPI = {};
    var settings = require('settings_registry');
    var utils = require('utils_misc');

    publicAPI.distributeEnergy = function(){
        for(var roomId in Game.rooms){
            if(settings.get("disabled", roomId)){
                continue;
            }
            var links = Game.rooms[roomId].find(FIND_MY_STRUCTURES, {filter : utils.isA('link')});
            var harvestGroupTargets = [];
            for(var harvestId in Memory.rooms[roomId].harvestGroups){
                harvestGroupTargets.push(Memory.rooms[roomId].harvestGroups[harvestId].targetEnergyStore);
            }
            
            for(var i in links){
                var linkA = links[i];
                if(linkA.cooldown > 0){
                    continue;
                }
                if(harvestGroupTargets.indexOf(linkA.id) >= 0){
                    for(var k in links){
                        //Hardcoded for room W11N1
                        if(i == k || links[k].id == '575d43a3a8dd2ca351d5fc51'){ // Don't transfer to self
                            continue;
                        }
                        var linkB = links[k];
                        if(harvestGroupTargets.indexOf(linkB.id) < 0 && linkB.energyCapacity > linkB.energy){
                            linkA.transferEnergy(linkB);
                        }
                    }
                }
            }
        }
    }
    return publicAPI;
})();