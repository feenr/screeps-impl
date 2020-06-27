module.exports = (function(){



    /**
     * If lab group does not have the minerals it needs, make a queue request
     * If a terminal is in a room which has a mineral from a request in the queue, claim it until the terminal has enough
     *    to fill the request.
     * If a messenger is not busy,
     *    it should check if the terminal needs a mineral
     *    it should check if the lab group needs a mineral
     *
     */



    function perform() {
        var mineralCraftQueue = require('utils_queue-manager').getQueue(Game, 'craftMineral');
        var mineralRequestQueue = require('utils_queue-manager').getQueue(Room, 'requestMineral');
        var primaryLab = {};
        var secondaryLabs = [];
        var mineralComponents = [];
        var currentJob = {type: "", amount: 0};


        if (currentJob) {
            if (currentJob.amount > primaryLab.mineralAmount) {
                var mineralOne = false;
                var mineralTwo = false;
                if (secondaryLabs[0].mineralType == mineralComponents[0]) {
                    mineralOne = true;
                } else {

                }
                if (secondaryLabs[1].mineralType == mineralComponents[1]) {
                    mineralTwo = true;
                } else {

                }

                if (mineralOne && mineralTwo) {
                    primaryLab.runReaction(secondaryLabs[0], secondaryLabs[1]);
                }


            } else {
                // Complete the job
            }
        } else {
            var mineralQueue = require('utils_queue-manager');
            getQueue(Game, 'craftMineral');
            var nextJob = {};
            mineralComponents = utils.calculateComponents(nextJob.mineralType);
        }
    }
    var publicAPI = {};
    publicAPI.perform = perform;
    return publicAPI;
})();


