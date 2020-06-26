/**
 * Created by feenr on 6/11/2016.
 */
module.exports = (function(){
    var publicAPI = {};
    // TODO This is needed for tests, but causes errors in code. Oh... variable hoisting.
    //var _ = _;
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
        } else if (gameObject == Game) {
            objectType = 'game';
            id = 'global';
        } else {
            console.error("Type of "+gameObject+" is not supported");
        }

        var queueContent = _.get(Memory, ['queues', objectType, id, queueName], []);
        _.set(Memory, ['queues', objectType, id, queueName], queueContent);
        return new Queue(queueContent);
    };

    publicAPI.setLodash = function(lodash){
        _ = lodash;
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

        this.getNextMatch = function(filter){
            for(var i in queueContent){
                if(filter(queueContent[i])){
                    return queueContent[i];
                }
            }
        };

        this.contains = function(object){
            var memberFound = false;
            queueContent.forEach(function(queueMember){
                if(JSON.stringify(queueMember) == JSON.stringify(object)){
                    memberFound = true;
                }
            });
            return memberFound;
        };

        this.containsCount = function(object){
            var countFound = 0;
            queueContent.forEach(function(queueMember){
                if(JSON.stringify(queueMember) == JSON.stringify(object)){
                    countFound++;
                }
            });
            return countFound;
        };

        this.claimTop = function(claimedBy){
            queueContent[queueContent.length-1].claimedBy = claimedBy;
        };

        this.claimBottom = function(claimedBy){
            queueContent[0].claimedBy = claimedBy;
        };
    }

    return publicAPI;
})();