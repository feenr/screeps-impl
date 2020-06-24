/**
 * Created by feenr on 6/11/2016.
 */
module.exports = (function(){
  var publicAPI = {};
  publicAPI.getQueue = function(gameObject, queueName){
    var objectType;
    var id = gameObject.id;
    if(gameObject instanceof Room){
      objectType = 'room';
      id = gameObject.name;
    } else if (gameObject instanceof StructureSpawn){
      objectType = 'spawn'
    } else if (gameObject instanceof Creep){
      objectType = 'creep'
    } else if (gameObject.gpl !== undefined) {
      objectType = 'game';
      id = 'global';
    } else {
        console.error("Type of "+gameObject+" is not supported");
    }

    
    var queueContent = _.get(Memory, ['queues', objectType, id, queueName], []);
    _.set(Memory, ['queues', objectType, id, queueName], queueContent);
    return new Queue(queueContent);
  };

  function Queue(queueContent){
    this.pop = function(){
      return queueContent.pop();
    };
    this.push = function(object){
      queueContent.push(object);
    };
    this.peekTop = function(){
      return queueContent[queueContent.length-1];
    };
    this.peekBottom = function(){
      return queueContent[0];
    };
    this.shift = function(){
      return queueContent.shift();
    };
    this.size = function(){
      return queueContent.length;
    };
    this.contains = function(object){
      return (queueContent.indexOf(object) >=0);
    };
  }
  return publicAPI;
})();