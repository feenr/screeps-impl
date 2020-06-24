module.exports = (function(){

    RoomPosition.prototype.getOpenAdjacentPositionsCount = function(){
      var count = 0;
      var pos = this;
      for(var x = pos.x-1; x <= pos.x+1; x++){
        for(var y = pos.y-1; y <= pos.y+1; y++){
          if(x == pos.x && y == pos.y){
            continue;
          }
          var room = Game.rooms[pos.roomName];
          var results = room.lookAt(x, y);
          var wallFound = false;
          results.forEach(function(result){
            if(result.type =='terrain' && result.terrain == 'wall'){
              wallFound = true;
            }
          });
          if(!wallFound){
            count++;
          }
        }
      }
      return count;
    };

    RoomPosition.prototype.getOpenPosition = function(range){
      for(var x = this.x-range; x <= this.x+range; x++){
        for(var y = this.y-range; y <= this.y+range; y++){
          if(x != this.x-range || x!= this.x+range || y != this.y-range || y!= this.y+range){
            continue;
          }
          var room = Game.rooms[this.roomName];
          var results = room.lookAt(x, y);
          var wallFound = false;
          var obstructionFound = false;
          results.forEach(function(result){
            if(result.type =='terrain' && result.terrain == 'wall'){
              obstructionFound = true;
            }
            if(result.type == 'structure'){
              obstructionFound = true;
            }
          });
          if(!obstructionFound){
            return new RoomPosition(x, y, room.name);
          }
        }
      }
    };
  }
)();