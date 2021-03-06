/*
 * Event timer allows you to register expensive events to only occur at a certain interval.
 * This allows you to spread out the processing of expensive events. Currently it only allows
 * registering an event that occurs every X ticks, but we could update to execute at certain times.
 * see end for example
 */

module.exports = (function(){
    const logger = require('utils_logger-factory').getLogger();
    var registerAction = function(name, module, event, parameters, ticks){
        var eventRegistry = getRegistry();
        eventRegistry[name] = {
            ticksRemaining : ticks,
            ticksTotal : ticks,
            module : module,
            event : event,
            parameters : parameters
        }
    }

    var deregisterAction = function(name){
        eventRegistry = getRegistry();
        delete eventRegistry[name];
    }

    var processActions = function(){
        //var eventRegistry = Memory.EventRegistry;
        var eventRegistry = getRegistry();
        for(var i in eventRegistry){
            var eventName = i;
            var event = eventRegistry[i];
            event.ticksRemaining--;
            if(event.ticksRemaining <= 0) {
                var eventModule = require(event.module);
                var parameters = event.parameters;
                logger.logEvent("Executing event: "+eventName);
                eval("eventModule."+event.event+"("+JSON.stringify(parameters)+")");
                event.ticksRemaining = event.ticksTotal;
            }
        }
    }

    function getRegistry(){
        if(!Memory.EventRegistry){
            Memory.EventRegistry = {};
        }
        return Memory.EventRegistry;
    }

    // Register scheduled events
    function scheduleEvents(events){
        for(let eventName in events){
            let event = events[eventName];
            if(!Memory.EventRegistry[event.name]){
                if(!event.disabled){
                    this.registerAction(event.name, event.module, event.functionName, event.parameters, event.interval);
                }
            } else {
                if (event.disabled){
                    this.deregisterAction(event.name);
                }
            }
        }
    }


    var publicAPI = {}
    publicAPI.processActions = processActions;
    publicAPI.deregisterAction = deregisterAction;
    publicAPI.registerAction = registerAction;
    publicAPI.scheduleEvents = scheduleEvents;
    return publicAPI;
})();


/**
 Example Usage:

 // console.js
 module.exports = (function(){
        var publicAPI = {};
        publicAPI.log = function(parameters){
            console.log(parameters.text);   
        }
        return publicAPI;
    })()

 // Usage
 eventTimer.registerAction("SayHiOccasionally", "console", "log", {text: "Hi", 100})

 // This will output the text "Hi" to the log every 100 ticks.

 // Can be disabled by calling
 eventTimer.deregisterAction("SayHiOccasionally");
 **/
