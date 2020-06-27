module.exports = (function(){
    
    var publicAPI = {};
    
    publicAPI.cleanUp = function(){
        for(var i in Memory.creeps){
            if(!Game.creeps[i]){
                delete Memory.creeps[i];
            }
        }
        var creepQueues = _.get(Memory, ['queues', 'creep']);
        for(var i in creepQueues){
            if(!Game.creeps[i]){
                delete Memory.queues['creep'][i];
            }
        }
        var structureQueues = _.get(Memory, ['queues', 'structure']);
        for(var i in structureQueues){
            if(!Game.creeps[i]){
                delete Memory.queues['structure'][i];
            }
        }
    };

    publicAPI.bootstrap = function(){
        if(!Memory.rooms){
            Memory.rooms = {};
        }
    };
    return publicAPI;
})();