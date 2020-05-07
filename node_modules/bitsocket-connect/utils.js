var Queue = function(){
    this._storage = [];
};

Queue.prototype.enqueue = function(data) {
    this._storage.push(data);
};

Queue.prototype.dequeue = function(){
    var item = this._storage[0];
    this._storage.shift();
    return item;
};
Queue.prototype.getLength = function(){
    return this._storage.length;
};

var SelfDrainingQueue = function (process) {
    this._process = process;
    this._queue = new Queue();
    this._draining = false;
    this._isAsync = process.constructor.name == 'AsyncFunction';
    this._drainQueue = function () {
        if (!this._draining) {
            this._draining = true;
            while (this._queue.getLength() > 0) {
                var item = this._queue.dequeue();
                this._process(item);
            }
            this._draining = false;
        }
    }
    this._drainQueueAsync = async function () {
        if (!this._draining) {
            this._draining = true;
            while (this._queue.getLength() > 0) {
                var item = this._queue.dequeue();
                await this._process(item);
            }
            this._draining = false;
        }
    }
}

SelfDrainingQueue.prototype.enqueue = function (item) {
    this._queue.enqueue(item);
    if(this._isAsync){
        this._drainQueueAsync();
    }else{
        this._drainQueue();
    }
}

SelfDrainingQueue.prototype.isDrained = function(){
    return (!this._draining);
}

exports.SelfDrainingQueue=SelfDrainingQueue;

exports.Queue= Queue;
exports.sleep = async function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

