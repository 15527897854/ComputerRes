/**
 * Created by Franklin on 2017/3/30.
 */
var React = require('react');
var Axios = require('axios');

var NoteDialog = require('../../action/utils/noteDialog');

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

    componentDidMount : function () {
        this.refresh();
    },

    getModelItems : function(cid){
        this.setState({cid : cid});
        Axios.get('/modelser/cloud/json/modelsers?cid=' + cid).then(
            data => {
                if(data.data.result == 'err') {
                    this.setState({itemErr : data.data.message});
                }
                else{
                    this.setState({itemErr : null, items : data.data.data});
                }
            },
            err => {}
        );
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
        Axios.get('/modelser/cloud/package/' + pid + '?ac=download&fields=' + JSON.stringify(this.state.itemDetail)).then(
            data => {
                if(data.data.result == 'suc'){
                    $('#md_modelItemDetail').modal('hide');
                    NoteDialog.openNoteDia('模型拉取成功！','模型 : ' + this.state.itemDetail.model_name + ' 拉取成功！');
                    this.getModelItems(this.state.cid);
                    this.setState({ processBar : false });
                }
            },
            err => {}
        );
    },

    refresh : function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'err') {
                    this.setState({loading : false, err : data.data.message});
                }
                else{
                    this.setState({loading : false});
                    $('#catalog_tree').treeview({
                        data: data.data.data.nodes,
                        selectedBackColor : '#222244',
                        onNodeSelected: function(event, data) {
                            this.getModelItems(data.id);
                        }.bind(this)
                    });
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    render : function() {
        if(this.state.loading){
            return (
                <span>加载中...</span>
            );
        }
        if(this.state.err) {
            return (
                <span>Error:{JSON.stringify(this.state.err)}</span>
            );
        }
        var Items = null;
        var Paging = null;
        if(this.state.itemErr){
            Items = (<span>Error : {JSON.stringify(this.state.itemErr)}</span>);
        }
        else{
            var pages = parseInt(this.state.items.length / 10) + 1;
            var count = 0;

            Items = this.state.items.map(function(item){
                count ++;
                var pulled = null;
                if(item.pulled){
                    pulled = (<span className="label label-success">已拉取</span>);
                }
                else{
                    pulled = (<span className="label label-default">未拉取</span>);
                }
                return (
                    <div key={item.model_id} className="highlight">
                        <pre>
                            <h5><i className="fa fa-gear"> </i>{item.model_name} &nbsp; {pulled} </h5>
                            <h5><i className="fa fa-user"> </i>{item.model_author}</h5>
                            <p>{item.model_description}</p>
                            <button className="btn btn-info btn-sm" onClick= { (e)=>{ this.openModelDetail(e, item) }} >详情</button>
                        </pre>
                    </div>
                )
            }.bind(this));
            if(pages > 1){
                Paging = (
                    <ul className="pagination">
                        <li><a href="#">«</a></li>
                        <li className="active"><a href="#">1</a></li>
                        <li><a href="#">2</a></li>
                        <li><a href="#">3</a></li>
                        <li><a href="#">4</a></li>
                        <li><a href="#">5</a></li>
                        <li><a href="#">»</a></li>
                    </ul>);
            }
        }
        var packages = this.state.itemPackage.map(function(item){
            var btn = null;
            if(item.pulled == true){
                btn = (<button className="btn btn-success btn-sm" onClick={ (e) => { window.location.href='/modelser/' + item.ms_id } }><i className="fa fa-eye"> </i>查看</button>);
            }
            else{
                btn = (<button className="btn btn-info btn-sm" onClick={ (e) => { this.downCloudModelPackage(e, item.id); } } ><i className="fa fa-download"> </i>拉取</button>);
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
                <div className="row">
                    <div className="col-md-6">
                        <section className="panel" >
                            <header className="panel-heading">
                                门户模型分类
                            </header>
                            <div id="catalog_tree">
                            </div>
                        </section>
                    </div>
                    <div className="col-md-6">
                        <section className="panel" >
                            <header className="panel-heading">
                                门户云服务
                            </header>
                            <div className="panel-body" >
                                <div className="input-group m-bot15">
                                    <span className="input-group-btn">
                                        <button type="button" className="btn btn-default"><i className="fa fa-search"></i></button>
                                    </span>
                                    <input type="text" className="form-control" />
                                </div>
                                {Items}
                                {Paging}
                            </div>
                        </section>
                    </div>
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
            </div>
            );
    }
});

module.exports = CloudModelSerTable;