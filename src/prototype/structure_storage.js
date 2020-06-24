module.exports = (function(){
  StructureTerminal.prototype.getMineralAmount = function(mineralType){
    return this.store[mineralType];
  };

  StructureTerminal.prototype.needsMoreMineral = function(mineralType){
    return this.getMineralAmount(mineralType) < 2000;
  };
})();
