var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');

var ModelSerOpera = React.createClass({
    onStarted : function(e){
        Axios.put(this.props['data-starting']).then(
            data => {
                if(data.data.result == 'suc'){
                    NoteDialog.openNoteDia('服务已开启');
                    if(this.props['onStarted']){
                        this.props['onStarted']();
                    }
                }
            },
            err => {}
        );
    },

    onStopped : function(e){
        Axios.put(this.props['data-stopping']).then(
            data => {
                if(data.data.result == 'suc'){
                    NoteDialog.openNoteDia('服务已关闭');
                    if(this.props['onStopped']){
                        this.props['onStopped']();
                    }
                }
            },
            err => {}
        );
    },

    onDeleted : function(e){
        Axios.delete(this.props['data-deleting']).then(
            data => {
                if(data.data.result == 'suc'){
                    if(this.props['onDeleted']){
                        this.props['onDeleted']();
                    }
                }
            },
            err => {}
        );
    },

    onRun : function(){
        window.open(this.props['data-run']);
    },

    render : function(){
        if(this.props['data-status'] == 'started'){
            return (
                <div className="btn-group btn-group-justified">
                    <a href="#" className="btn btn-default" onClick={ this.onRun } >
                        <i className="fa fa-retweet"></i>调用
                    </a>
                    <a href="#" className="btn btn-danger" onClick={this.onStopped} >
                        <i className="fa fa-stop"></i>关闭服务
                    </a>
                </div>
            );
        }
        else if(this.props['data-status'] == 'stopped'){
            return (
                <div className="btn-group btn-group-justified">
                    <a href="#" className="btn btn-success" onClick={this.onStarted} >
                        <i className="fa fa-play"></i>启动服务
                    </a>
                    <a href="#" className="btn btn-warning" onClick={this.onDeleted} >
                        <i className="fa fa-trash-o"></i>删除服务
                    </a>
                </div>
            );
        }
    }
});