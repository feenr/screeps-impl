module.exports = (function(){
  var queueManager = require('./utils_queue_manager');
  var mineralRequestQueue = queueManager.getQueue(Game, 'requestMineral');
  StructureTerminal.prototype.perform = function(){
    if(this.energy == 0){
      return;
    }
    var that = this;
    var mineralsRequest = mineralRequestQueue.getNextMatch(function(request){
      if(request.type in that.store && that.store[request.type] > request.amount){
        return true;
      }
    });
    if(mineralsRequest){
      var targetRoom = Game.getObjectById(mineralsRequest.room);
      if(this.send(mineralsRequest.type, mineralsRequest.amount, targetRoom)==0){
        mineralRequestQueue.remove(mineralsRequest);
      }
    }
  };


  StructureTerminal.prototype.getMineralAmount = function(mineralType){
    return this.store[mineralType];
  };

  StructureTerminal.prototype.needsMoreMineral = function(mineralType){
    return this.getMineralAmount(mineralType) < 2000;
  };



})();
