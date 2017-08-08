/**
 * Created by Franklin on 2016/8/3.
 * Model for ModelInstace
 */

function ModelInstance(mis) {
    if(mis == null)
    {
        this.guid = '';
        this.socket = null;
        this.ms = null;
        this.input = null;
        this.output = null;
        this.log = [];
        this.start = null;
        this.state = null;
    }
    else
    {
        this.guid = mis.guid;
        this.socket = mis.socket;
        this.ms = mis.ms;
        this.input = mis.input;
        this.output = mis.output;
        this.log = mis.log;
        this.start = mis.start;
        this.state = mis.state;
    }
    return this;
}

module.exports = ModelInstance;