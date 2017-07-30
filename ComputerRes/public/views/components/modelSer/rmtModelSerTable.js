/**
 * Created by Franklin on 2017/3/22.
 */
var React = require('react');
var Axios = require('axios');

var PortalInfo = require('../systemSetting/portalInfo');

var RmtModelSerTable = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            ms : null,
            init : true,
            type : this.props['data-type'],
            item : null
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    refresh : function () {
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.res == 'err')
                {
                    this.setState({loading : false, err : data.data.message});
                }
                else
                {
                    this.setState({loading : false, err : false, data : data.data.data});
                    if(this.state.init)
                    {
                        //初始化完成
                        $('#modelservice-table').dataTable(
                            {
                                //数据URL
                                "data": "/modelser/json/rmtall",
                                //载入数据的时候是否显示“正在加载中...”
                                "processing": true,
                                //是否显示分页
                                "bPaginate": true,
                                //每页显示条目数
                                "bLengthChange": true,
                                //排序
                                "bSort": true,
                                //排序配置
                                //"aaSorting": [[0, "desc"]],
                                //自适应宽度
                                "bAutoWidth": true,
                                //多语言配置
                                "oLanguage": {
                                    "sLengthMenu": window.LanguageConfig.TablePaging.LengthMenu,
                                    "sZeroRecords": window.LanguageConfig.TablePaging.ZeroRecords,
                                    "sInfo": window.LanguageConfig.TablePaging.Info,
                                    "sInfoEmtpy": window.LanguageConfig.TablePaging.InfoEmtpy,
                                    "sInfoFiltered": window.LanguageConfig.TablePaging.InfoFiltered,
                                    "sProcessing": window.LanguageConfig.TablePaging.Processing,
                                    "sSearch": window.LanguageConfig.TablePaging.Search,
                                    //多语言配置文件，可将oLanguage的设置放在一个txt文件中，例：Javascript/datatable/dtCH.txt
                                    "sUrl": "",
                                    "oPaginate": {
                                        "sFirst":    window.LanguageConfig.TablePaging.Paginate.First,
                                        "sPrevious": window.LanguageConfig.TablePaging.Paginate.Previous,
                                        "sNext":     window.LanguageConfig.TablePaging.Paginate.Next,
                                        "sLast":     window.LanguageConfig.TablePaging.Paginate.Last
                                    }
                                }
                            }
                        );
                        this.setState({init : false});
                    }

                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    startModelSerHandle : function (e, host, msid) {
        if(confirm('Open this model service?') == true)
        {
            if(host){
                Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=start').then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else{
                Axios.put('/modelser/' + msid + '?ac=start').then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    stopModelSerHandle : function (e, host, msid) {
        if(confirm('Close this model service?') == true)
        {
            if(host){
                Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=stop').then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else {
                Axios.put('/modelser/' + msid + '?ac=stop').then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    deleteModelSerHandle : function(e, host, msid) {
        if(confirm('Delete this model service?') == true)
        {
            if(host){
                Axios.delete('/modelser/rmt/' + host + '/' + msid ).then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else{
                Axios.delete('/modelser/' + msid ).then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    openModelSerInfoHandle : function (e, host, msid) {
        if(host && host == 'custom'){
            window.location = '/public/modelser/' + msid;
        }
        else if(host){
            window.location = '/modelser/rmt/' + host + '/' + msid;
        }
        else{
            window.location = '/modelser/' + msid;
        }
    },

    uploadModelSer : function(e, host, msid){
        if(host){

        }
        else{
            window.open('/modelser/uploader/' + msid);
        }
    },

    openModelSerProHandle : function (e, host, msid) {
        if(host && host == 'custom'){
            window.open('/public/modelser/preparation/' + msid);
        }
        else if(host){
            window.open('/modelser/rmt/preparation/' + host + '/' + msid + '');
        }
        else{
            window.open('/modelser/preparation/' + msid );
        }
    },

    openRegisterDialogHandle : function (e, item) {
        $('#mdModelSerRegister').modal('show');
    },

    lockHandle : function(e, host, msid){
        if(confirm('Lock this model service?') == true)
        {
            if(host){
                Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=lock').then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else{
                Axios.put('/modelser/' + msid + '?ac=lock').then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    unlockHandle : function(e, host, msid){
        if(confirm('Unlock this model service?') == true)
        {
            if(host){
                Axios.put('/modelser/rmt/' + host + '/' + msid + '?ac=unlock').then(
                    data => {
                        this.refresh();
                    }
                );
            }
            else{
                Axios.put('/modelser/' + msid + '?ac=unlock').then(
                    data => {
                        this.refresh();
                    }
                );
            }
        }
    },

    render : function () {
        if(this.state.loading)
        {
            return (
                <span>loading...</span>
                );
        }
        if(this.state.err)
        {
            return (
                <span>Error : {JSON.stringify(this.state.err)}</span>
            );
        }
        var MsItems = [];
        var Heading = null;
        //! reomote model services
        if(this.state.type == 'rmt'){
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Version}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>{window.LanguageConfig.ModelService.Address}</th>
                    <th>{window.LanguageConfig.ModelService.Platform}</th>
                    <th>{window.LanguageConfig.ModelService.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
                </tr>
            );
            MsItems = this.state.data.map(function(host){
                if(host.ping == 'err'){
                    return;
                }
                var mss = host.ms.data.map(function (item) {
                    var platform;
                    if(item.ms_platform == 1)
                    {
                        platform = (<span className="label label-info"><i className="fa fa-windows"> </i> windows</span>);
                    }
                    else if(item.ms_platform == 2)
                    {
                        platform = (<span className="label label-info"><i className="fa fa-linux"> </i> linux</span>);
                    }
                    else
                    {
                        platform = (<span className="label label-info"> Unknown</span>);
                    }
                    var status;
                    var button;
                    var button2;
                    if(item.ms_status == 1)
                    {
                        status = (<span className="badge badge-success hand" onClick={(e)=>{this.stopModelSerHandle(e, host.host, item._id)}}>{window.LanguageConfig.ModelService.Avai}</span>);
                        button = (
                            <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openModelSerProHandle(e, host.host, item._id) }} >
                                <i className="fa fa-retweet"> </i>{window.LanguageConfig.ModelService.Invoking}
                            </button>);
                        // button2 = (
                        //     <button className="btn btn-danger btn-xs tooltips" type="button" title={window.LanguageConfig.ModelService.Stop} 
                        //             onClick={(e)=>{this.stopModelSerHandle(e, host.host, item._id)}} >
                        //         <i className="fa fa-stop"> </i> {window.LanguageConfig.ModelService.Stop} 
                        //     </button>
                        // );
                    }
                    else
                    {
                        status = (<span className="badge badge-defult hand" onClick={(e)=>{this.startModelSerHandle(e, host.host, item._id)}}>{window.LanguageConfig.ModelService.Unavai}</span>);
                        button = (
                            <button className="btn btn-warning btn-xs tooltips" type="button" title={window.LanguageConfig.ModelService.Delete}
                                    onClick={(e) => { this.deleteModelSerHandle(e, host.host, item._id) }} >
                                <i className="fa fa-trash-o"> </i> {window.LanguageConfig.ModelService.Delete}
                            </button>
                        );
                        // button2 = (
                        //     <button className="btn btn-success btn-xs tooltips" type="button" title={window.LanguageConfig.ModelService.Start} 
                        //             onClick={(e)=>{this.startModelSerHandle(e, host.host, item._id)}} >
                        //         <i className="fa fa-play"> </i> {window.LanguageConfig.ModelService.Start} 
                        //     </button>
                        // );
                    }
                    return (
                        <tr>
                            <td  title={item.ms_des} >{item.ms_model.m_name}</td>
                            <td>{item.mv_num}</td>
                            <td>{item.ms_model.m_type}</td>
                            <td>{host.host}</td>
                            <td>{platform}</td>
                            <td>{status}</td>
                            <td>
                                <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerInfoHandle(e, host.host, item._id ) } }  ><i className="fa fa-book"> </i>{window.LanguageConfig.ModelServiceTable.Detail}</button>&nbsp;
                                {button}&nbsp;{button2}
                            </td>
                        </tr>
                    );
                }.bind(this));
                return mss;
            }.bind(this));
        }
        //! custom model services
        else if(this.state.type == 'custom'){
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Version}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>Permission</th>
                    <th>{window.LanguageConfig.ModelService.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
                </tr>
            );
            MsItems = this.state.data.map(function (item) {
                var status;
                var button;
                if(item.ms_status == 1)
                {
                    status = (<span className="badge badge-success">Online</span>);
                    button = (
                        <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openModelSerProHandle(e, 'custom', item._id) }} >
                            <i className="fa fa-retweet"> </i>{window.LanguageConfig.ModelService.Invoking}
                        </button>);
                }
                else
                {
                    status = (<span className="badge badge-defult">Offline</span>);
                }
                var permission = null;
                if(item.ms_permission == 1){
                    permission = (<span className="label label-default tooltips" title={window.LanguageConfig.ModelService.Auth} ><i className="fa fa-lock" ></i>&nbsp;{window.LanguageConfig.ModelService.Auth}</span>);
                }
                else{
                    permission = (<span className="label label-success tooltips" title={window.LanguageConfig.ModelService.Public} ><i className="fa fa-unlock" ></i>&nbsp;{window.LanguageConfig.ModelService.Public}</span>);
                }
                return (
                    <tr key={item._id}>
                        <td>{item.ms_model.m_name}</td>
                        <td>{item.mv_num}</td>
                        <td>{item.ms_model.m_type}</td>
                        <td>{permission}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerInfoHandle(e, 'custom', item._id ) } }  ><i className="fa fa-book"> </i>{window.LanguageConfig.ModelServiceTable.Detail}</button>&nbsp;
                            {button}
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        //! local model services
        else {
            Heading = (
                <tr>
                    <th>{window.LanguageConfig.ModelService.Name}</th>
                    <th>{window.LanguageConfig.ModelService.Version}</th>
                    <th>{window.LanguageConfig.ModelService.Type}</th>
                    <th>Permission</th>
                    <th>Accessable</th>
                    <th>{window.LanguageConfig.ModelService.Status}</th>
                    <th>{window.LanguageConfig.ModelServiceTable.Operation}</th>
                </tr>
            );
            MsItems = this.state.data.map(function (item) {
                var platform;
                if(item.ms_platform == 1)
                {
                    platform = (<span className="label label-info"><i className="fa fa-windows"> </i> windows</span>);
                }
                else if(item.ms_platform == 2)
                {
                    platform = (<span className="label label-info"><i className="fa fa-linux"> </i> linux</span>);
                }
                else
                {
                    platform = (<span className="label label-info">Unknown</span>);
                }
                var status;
                var button;
                var button2;
                var button3 = null;
                if(!item.ms_model.m_register){
                    button3 = (
                        <button className="btn btn-default btn-xs" type="button" onClick={(e) => { this.openRegisterDialogHandle(e, item) }} >
                            <i className="fa fa-cloud-upload"> </i>&nbsp;{window.LanguageConfig.ModelServiceTable.Register}
                        </button>);
                }
                else{
                    button3 = (
                        <button className="btn btn-default btn-xs" type="button" onClick={(e) => {  }} >
                            <i className="fa fa-share-square-o"> </i>&nbsp;Unregister
                        </button>);
                }
                if(item.ms_status == 1)
                {
                    status = (<span className="badge badge-success hand" onClick={(e)=>{this.stopModelSerHandle(e, null, item._id)}} >Online</span>);
                    // button = (
                    //     <button className="btn btn-danger btn-xs tooltips" type="button" data-toggle="tooltip" data-placement=" bottom" title={window.LanguageConfig.ModelService.Stop} data-original-title={window.LanguageConfig.ModelService.Stop}
                    //             onClick={(e)=>{this.stopModelSerHandle(e, null, item._id)}} >
                    //         <i className="fa fa-stop"> </i>&nbsp;Stop
                    //     </button>
                    // );
                    button2 = (
                        <button className="btn btn-primary btn-xs" type="button" onClick={(e) => { this.openModelSerProHandle(e, null, item._id) }} >
                            <i className="fa fa-retweet"> </i>{window.LanguageConfig.ModelService.Invoking}
                        </button>);
                }
                else
                {
                    status = (<span className="badge badge-defult hand" onClick={(e)=>{this.startModelSerHandle(e, null, item._id)}}>Offline</span>);
                    // button = (
                    //     <button className="btn btn-success btn-xs tooltips" type="button" data-toggle="tooltip" data-placement=" bottom" title={window.LanguageConfig.ModelService.Start} data-original-title={window.LanguageConfig.ModelService.Start}
                    //             onClick={(e)=>{this.startModelSerHandle(e, null, item._id)}} >
                    //         <i className="fa fa-play"> </i>&nbsp;Start
                    //     </button>
                    // );
                    button2 = (
                        <button className="btn btn-warning btn-xs tooltips" type="button" data-toggle="tooltip" data-placement=" bottom" title={window.LanguageConfig.ModelService.Delete} data-original-title={window.LanguageConfig.ModelService.Delete}
                                onClick={(e) => { this.deleteModelSerHandle(e, null, item._id) }} >
                            <i className="fa fa-trash-o"> </i>&nbsp;Delete
                        </button>
                    );
                }
                var limited = null;
                if(item.ms_limited == 1){
                    limited = (<button className="btn btn-warning btn-xs" title={window.LanguageConfig.ModelService.Private} onClick={ (e) => { this.unlockHandle(e, null, item._id) } } ><i className="fa fa-user" ></i>&nbsp;{window.LanguageConfig.ModelService.Private}</button>);
                }
                else{
                    limited = (<button className="btn btn-success btn-xs" title={window.LanguageConfig.ModelService.Public} onClick={ (e) => { this.lockHandle(e, null, item._id) } } ><i className="fa fa-users" ></i>&nbsp;{window.LanguageConfig.ModelService.Public}</button>);
                }
                var permission = null;
                if(item.ms_permission == 1){
                    permission = (<span className="label label-default tooltips" title={window.LanguageConfig.ModelService.Auth} ><i className="fa fa-lock" ></i>&nbsp;{window.LanguageConfig.ModelService.Auth}</span>);
                }
                else{
                    permission = (<span className="label label-success tooltips" title="Open" ><i className="fa fa-unlock" ></i>&nbsp;Open</span>);
                }
                var name = item.ms_model.m_name;
                if(name.length > 25){
                    name = name.substr(0, 25) + '...';
                }
                var tyep = item.ms_model.m_type;
                if(tyep.length > 20){
                    tyep = tyep.substr(0, 20) + '...';
                }
                return (
                    <tr key={item._id} >
                        <td title={ item.ms_model.m_name + ' - ' +item.ms_des}>{name}</td>
                        <td>{item.mv_num}</td>
                        <td title={ item.ms_model.m_type }>{tyep}</td>
                        <td>{permission}</td>
                        <td>{limited}</td>
                        <td>{status}</td>
                        <td>
                            <button className="btn btn-info btn-xs" type="button" onClick={ (e) =>
                            { this.openModelSerInfoHandle(e, null, item._id ) } }  ><i className="fa fa-book"> </i>{window.LanguageConfig.ModelServiceTable.Detail}</button>&nbsp;
                            {button}&nbsp;{button2}&nbsp;{button3}&nbsp;
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        var ms_name = null;
        return (
            <div>
                <table className="display table table-bordered table-striped" id="modelservice-table">
                    <thead>
                        {Heading}
                    </thead>
                    <tbody>
                        {MsItems}
                    </tbody>
                </table>
                <div aria-hidden="true" aria-labelledby="mdModelSerRegister" role="dialog" tabIndex="-1" id="mdModelSerRegister" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button aria-hidden="true" data-dismiss="modal" className="close" type="button">×</button>
                                <h4 className="modal-title">Register</h4>
                            </div>
                            <div className="modal-body">
                                <PortalInfo />
                                <h5 >Service Name : {ms_name} </h5>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-success" >Confirm</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = RmtModelSerTable;