/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('collect-stats');
 * mod.thing == 'a thing'; // true
 */

module.exports = function(){
// Call this function at the end of your main loop
    function exportStats() {
      // Reset stats object
      Memory.stats = {
        gcl: {},
        rooms: {},
        cpu: {},
      };
    
      Memory.stats.time = Game.time;
    
      // Collect room stats
      let roomsHeld = 0;
      for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        let isMyRoom = (room.controller ? room.controller.my : false);
        if (isMyRoom) {
            roomsHeld++;
          let roomStats = Memory.stats.rooms[roomName] = {};
          roomStats.storageEnergy           = (room.storage ? room.storage.store.energy : 0);
          roomStats.terminalEnergy          = (room.terminal ? room.terminal.store.energy : 0);
          roomStats.energyAvailable         = room.energyAvailable;
          roomStats.energyCapacityAvailable = room.energyCapacityAvailable;
          roomStats.controllerProgress      = room.controller.progress;
          roomStats.controllerProgressTotal = room.controller.progressTotal;
          roomStats.controllerLevel         = room.controller.level;
          let sourceEnergy = 0;
          let sourceEnergyCapacity = 0;
          let sources = room.find(FIND_SOURCES);
          for(let index in sources){
              sourceEnergy += sources[index].energy;
              sourceEnergyCapacity += sources[index].energyCapacity;
          }
          roomStats.sourceEnergy = sourceEnergy;
          roomStats.sourceEnergyCapacity = sourceEnergyCapacity;
          
        }
      }
    
      // Collect GCL stats
      Memory.stats.gcl.progress      = Game.gcl.progress;
      Memory.stats.gcl.progressTotal = Game.gcl.progressTotal;
      Memory.stats.gcl.level         = Game.gcl.level;
      Memory.stats.gcl.roomsTotal    = Game.gcl.level;
      Memory.stats.gcl.roomsHeld     = roomsHeld;
    
      // Collect CPU stats
      Memory.stats.cpu.bucket        = Game.cpu.bucket;
      Memory.stats.cpu.limit         = Game.cpu.limit;
      Memory.stats.cpu.used          = Game.cpu.getUsed();
    }
    var publicAPI = {
        exportStats : exportStats
    }
    return publicAPI;
}()