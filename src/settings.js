module.exports = (function(){
    var publicAPI = {};
    if(!Memory.settings){ 
        Memory.settings = {};
    }
    /**
     * Store a setting which is saved in memory. RoomId is optional
     */
    function set(name, value, roomId){
        var localSettings = _getCallSpecificSettings(name, roomId);
        localSettings[name] = value;
    }
    
    /**
     * Get a setting which is saved in memory. RoomId is optional
     */
    function get(name, roomId){
        var localSettings = _getCallSpecificSettings(name, roomId);
        return localSettings[name];
    }
    
    function _getCallSpecificSettings(name, roomId){
        var localSettings = Memory.settings;
        if(roomId){
            if(roomId == 'default'){
                roomId = get('defaultRoom');
            }
            if(!Memory.rooms[roomId]){
                Memory.rooms[roomId] = {};
            }
            localSettings = Memory.rooms[roomId].settings || (Memory.rooms[roomId].settings = {});
        }
        return localSettings;
    }
    
    /**
     * Remove a setting which is saved in memory. RoomId is option
     */
    function clear(name, roomId){
        var localSettings = _getCallSpecificSettings(name, roomId);
        if(typeof(localSettings[name]) != 'undefined'){
            delete localSettings[name];
        }
    }
    function list(){
        var localSettings = Memory.settings;
        for(var i in localSettings){
            console.log(i+" : "+localSettings[i]);
        }
        for(var i in Memory.rooms){
            console.log("("+i+") ")
            for(var k in Memory.rooms[i].settings){
                console.log("    "+k+" : "+Memory.rooms[i].settings[k]);
            }
        }
    }
    
    publicAPI.list = list;
    publicAPI.get = get;
    publicAPI.clear = clear;
    publicAPI.set = set;
    
    return publicAPI;
})();