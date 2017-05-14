/**
 * Created by Franklin on 2017/3/30.
 */
var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');
var ModelItemSelect = require('./modelItemSelect');

var CloudModelSerTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            items : [],
            itemErr : null,
            init : false,
            itemDetail : {},
            itemPackage : [],
            processBar : false,
            cid : ''
        };
    },

    openModelDetail : function(e, item){
        this.setState({itemDetail : item});
        Axios.get('/modelser/cloud/json/packages?mid=' + item.model_id).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({itemPackage : data.data.data});
                    $('#md_modelItemDetail').modal('show');
                }
            },
            err => {

                $('#md_modelItemDetail').modal('show');
            }
        );
    },

    downCloudModelPackage : function(e, pid){
        this.setState({ processBar : true });
        Axios.get('/modelser/cloud/packages/' + pid + '?ac=download&fields=' + JSON.stringify(this.state.itemDetail)).then(
            data => {
                if(data.data.result == 'suc'){
                    $('#md_modelItemDetail').modal('hide');
                    NoteDialog.openNoteDia('模型拉取成功！','模型 : ' + this.state.itemDetail.model_name + ' 拉取成功！');
                    this.refs.modelItemSelector.getModelItems();
                    this.setState({ processBar : false });
                }
            },
            err => {}
        );
    },

    render : function() {
        var packages = this.state.itemPackage.map(function(item){
            var btn = null;
            if(item.pulled == true){
                btn = (<button className="btn btn-success btn-sm" onClick={ (e) => { window.location.href='/modelser/' + item.ms_id } }><i className="fa fa-eye"> </i>查看</button>);
            }
            else{
                var disabled = null;
                if(this.state.processBar){
                    disabled = 'disable';
                }
                btn = (<button className="btn btn-info btn-sm" onClick={ (e) => { this.downCloudModelPackage(e, item.id); } } disabled={disabled} ><i className="fa fa-download"> </i>拉取</button>);
            }
            return (
                <tr>
                    <td>v1.0</td>
                    <td>{item.name}</td>
                    <td>{btn}</td>
                </tr>
            );
        }.bind(this));
        var procBar = null;
        if(this.state.processBar){
            procBar = (
                <div className="progress progress-striped active progress-sm">
                    <div style={ { 'width' : '100%' }} aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" className="progress-bar progress-bar-success">
                        <span className="sr-only"> </span>
                    </div>
                </div>
            );
        }
        return (
            <div className="wrapper">
                <ModelItemSelect ref="modelItemSelector" data-source={this.props['data-source']} onSelectedItem={this.openModelDetail} />
                <div aria-hidden="true" aria-labelledby="myModel_ModelItemDetail" role="dialog" tabIndex="-1" id="md_modelItemDetail" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">模型详细信息</h4>
                            </div>
                            <div className="modal-body">
                                <h5 >ID : {this.state.itemDetail.model_id} </h5>
                                <h5 >名称 : {this.state.itemDetail.model_name} </h5>
                                <h5 >作者 : {this.state.itemDetail.model_author + ' - ' + this.state.itemDetail.model_authorId} </h5>
                                <h5 >描述 : {this.state.itemDetail.model_description} </h5>
                                <h5 >登记时间 : {this.state.itemDetail.model_registerTime} </h5>
                                <h5 >平台 : {this.state.itemDetail.model_platform} </h5>
                                <h5 >状态 : {this.state.itemDetail.model_status} </h5>
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>版本</th>
                                        <th>名称</th>
                                        <th>操作</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {packages}
                                    </tbody>
                                </table>
                                {procBar}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">关闭</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
    }
});

module.exports = CloudModelSerTable;