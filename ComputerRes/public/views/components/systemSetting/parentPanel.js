/**
 * Created by Franklin on 2017/3/27.
 */
var React = require('react');
var Axios = require('axios');

var ParentPanel = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            parent : null
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function () {
        Axios.get(this.props.source).then(
            data => {
                if(data.data.res == 'err')
                {
                    this.setState({loading : false, err : data.data.message});
                }
                else
                {
                    this.setState({loading : false, err : false, parent : data.data.data.ss_value});
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    openDialog : function(){
        $('#diaParent').modal('open');
    },

    checkServer : function() {
        var port = '8060';
        if($('#txtNewParentHost').val().trim() == '')
        {
            return;
        }
        if($('#txtNewParentPort').val().trim() != '')
        {
            port = $('#txtNewParentPort').val();
        }
        Axios.get('/checkserver/' + $('#txtNewParentHost').val() + ':' + port).then(
            data => {
                if(data.data.result == 'OK')
                {
                    $('#btn_ok').attr('disabled', false);
                }
                else
                {
                    $('#btn_close').attr('disabled', true);
                }
            },
            err => {}
        );
    },

    onSubmit : function(e) {
        alert('lalalalala');
    },

    render : function () {
        if(this.state.loading)
        {
            return (
                <span>加载中...</span>
            );
        }
        if(this.state.err)
        {
            return (
                <span>Error : { JSON.stringify(this.state.err) }</span>
            );
        }
        return (
            <div>
                <p><strong>父节点</strong>&nbsp;:&nbsp;<span>{this.state.parent}</span></p>
                <button className="btn btn-info" data-toggle="modal" href="#diaParent" >变更父节点</button>
                <div aria-hidden="true" aria-labelledby="parentAlterDialog" role="dialog" tabIndex="-1" id="diaParent" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">变更父节点</h4>
                            </div>
                            <div className="modal-body">
                                <form className="form-horizontal" >
                                    <strong>当前父节点</strong>&nbsp;:&nbsp;{this.state.parent}<br />
                                    <label>更变父节点</label><br />
                                    <label htmlFor="txtNewParentHost" >服务器</label>
                                    <input id="txtNewParentHost" placeholder="127.0.0.1" type="text" className="form-control" onBlur={this.checkServer} />
                                    <label htmlFor="txtNewParentPort" >端口</label>
                                    <input id="txtNewParentPort" placeholder="8060" type="text" className="form-control" onBlur={this.checkServer} />
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button id="btn_ok" type="button" className="btn btn-default" data-dismiss="modal" >关闭</button>
                                <button id="btn_close" type="button" className="btn btn-success" disabled="disabled" onClick={ this.onSubmit } >确定</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ParentPanel;