module.exports = function(){

  /**
   * Queues
   *    Room needs a mineral type from another room
   *    Game - Room, Type, Amount
   *    Producer Terminal in a room with desired mineral
   *    Consumer Terminal in a room in need of mineral
   *
   *
   *    Lab needs a mineral from a terminal
   *    Room - Lab, Type, Amount
   *    Producer messenger delivers mineral to lab
   *    Consumer Lab
   *
   *
   *
   * If lab group does not have the minerals it needs, make a queue request
   * If a terminal is in a room which has a mineral from a request in the queue, claim it until the terminal has enough
   *    to fill the request.
   * If a messenger is not busy,
   *    it should check if the terminal needs a mineral
   *    it should check if the lab group needs a mineral
   *
   */

  var utils = require('./utils_misc');
  var queueManager = require('./utils_queue_manager');
  var mineralRequestQueue = queueManager.getQueue(Game, 'requestMineral');
  StructureLab.prototype.isPrimary = function(){
    return this.memory.primary == true;
  };

  StructureLab.prototype.getJob = function(){
    if(this.memory.job == null){
        var nextJob = {type: "idk", amount: 100}; // Get next Job?
        this.memory.job = nextJob;
    }
    return this.memory.job;
  };

  StructureLab.prototype.getChildLabs = function(){
    if(!this.isInitialized()){// TODO this is a weird place for this initialization
      this.initializeChildLabs();
    }
    return utils.loadObjectsFromIDs(this.memory.labs);
  };

  StructureLab.prototype.initializeChildLabs = function(){
    var labs = this.room.find(FIND_STRUCTURES, {filter: (obj) => {return typeof obj == StructureLab}});
    var assignedLabIds = [];
    for(var i in labs){
      if(!labs[i].getPrimaryLab() || labs[i].getPrimaryLab() == this){
        assignedLabIds.push(labs[i].id);
        labs[i].memory.primaryLab = this.id;
        if(assignedLabIds.length == 2){
          break;
        }
      }
    }
    this.memory.labs = assignedLabIds;
  };

  StructureLab.prototype.getPrimaryLab = function(){
    if(this.memory.primaryLab){
      var primaryLab = Game.getObjectById(this.memory.primaryLab);
    } else {
      return null;
    }
    return primaryLab;
  };

  StructureLab.prototype.provideBoost = function(creep){
    if(this.isPrimary()){
      if(this.mineralAmount > 0){
        this.boostCreep(creep);
      }
    }
  };

  StructureLab.prototype.perform = function(){
    if(this.isPrimary()){
      var job = this.getJob();
      if(!job){
        return;
      }
      if(this.mineralType == job.type && this.mineralAmount == job.amount){
        this.memory.job = null;
      }
      var mineralComponents = utils.calculateComponents(job.type); // TODO may want to store in memory instead
      var childLabs = this.getChildLabs();
      var mineralOne = false;
      var mineralTwo = false;
      childLabs[0].memory.mineral = mineralComponents[0];
      childLabs[1].memory.mineral = mineralComponents[1];

      if(childLabs[0].mineralType == mineralComponents[0]){
        mineralOne = true;
      }
      if(childLabs[1].mineralType == mineralComponents[1]){
        mineralTwo = true;
      }
      if(mineralOne && mineralTwo){
        this.runReaction(childLabs[0], childLabs[1]);
      }
    }
  };
};