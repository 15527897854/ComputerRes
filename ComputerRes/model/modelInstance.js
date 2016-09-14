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
        this.start = null;
        this.state = null;
    }
    else
    {
        this.guid = mis.guid;
        this.socket = mis.socket;
        this.ms = mis.ms;
        this.start = mis.start;
        this.state = mis.state;
    }
    return this;
}

module.exports = ModelInstance;