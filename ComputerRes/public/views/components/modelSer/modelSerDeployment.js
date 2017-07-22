/**
 * Created by Franklin on 2017/7/14.
 */

var React = require('react');
var Axios = require('axios');

var ModelItemSelect = require('./modelItemSelect');
var NoteDialog = require('../../action/utils/noteDialog');

var ModelSerDeployment = React.createClass({
    getInitialState : function(){
        return {
            progressbar : false,
            progresspercet : 0,
            fileFinished : false,
            fieldFinished : false,
            oid : null
        };
    },

    componentDidMount : function(){
        $('#stepy_form').stepy({
            backLabel: '上一步',
            nextLabel: '下一步',
            errorImage: true,
            block: false,
            description: true,
            legend: false,
            titleClick: true,
            titleTarget: '#top_tabby',
            validate: false,
            finishButton:true,
            finish: this.onSubmit
        });
        
    },

    onSubmit : function(e){
        if($('#file_modelSer').val() == ''){
            NoteDialog.openNoteDia('Info', 'Please choose package!');
            return false;
        }
        this.setState({progressbar : true});
        // var formdata = new FormData($('#stepy_form')[0]);
        var formdata = new FormData($('#deployForm')[0]);
        $.ajax({
            url:'/modelser',
            method:'POST',
            data: formdata,
            processData: false,
            contentType: false,
            success: this.onFieldFinished
        });
        var fileInsterval = setInterval(function () {
            Axios.get('/modelser/file').then(
                data => {
                    this.setState({progresspercet : data.data.value});
                    if(data.data.value == 100){
                        clearInterval(fileInsterval);
                        this.setState({fileFinished : true});
                        this.checkFinished();
                    }
                }
            );
        }.bind(this), 500);
        return false;
    },

    onSelectedItem : function(e, item){
        $('#stepy_form-title-1').click();
    },

    onFieldFinished : function (msg) {
        msg = JSON.parse(msg);
        if(msg.result == 'suc'){
            oid = msg.data._id;
            this.setState({ fieldFinished : true, oid : oid });
            this.checkFinished();
        }
        else if(msg.result == 'err'){
            msg = msg.message;
            if(msg.status == 0)
            {
                //系统出错
                NoteDialog.openNoteDia('System Error', 'Please try later!');
            }
            else if(msg.status == 1)
            {
                if(msg.isValidate){
                }
                else{
                    //上传文件结构出错
                    if(!msg.cfgfile){
                        NoteDialog.openNoteDia('Package Error', 'Lack of config file!');
                    }
                    if(msg.cfg.length){
                        var cfgerr = '';
                        for(var i=0;i<msg.cfg.length;i++){
                            cfgerr += msg.cfg[i];
                            if(i != msg.cfg.length-1)
                                cfgerr += ' ';
                        }
                        NoteDialog.openNoteDia('Package Error', 'Config file error and message is ' + cfgerr);
                    }
                    else{
                        if(!msg.mdl){
                            NoteDialog.openNoteDia('Package Error', 'Lack of MDL file!');
                        }
                        else if(!msg.start){
                            NoteDialog.openNoteDia('Package Error', 'Lack of entry file!');
                        }
                    }
                }
            }
            else{
                NoteDialog.openNoteDia('Unknown error', JSON.stringify(msg));
            }
        }
    },

    checkFinished : function(){
        if(this.state.fileFinished && this.state.fieldFinished){
            window.location.href = '/modelser/' + this.state.oid;
        }
    },

    render : function(){
        var procBar = null;
        var btnEnable = '';
        if(this.state.progressbar){
            procBar = (
                <div id="div_upload">
                    Current Progress:
                    <br />
                    <div className="progress progress-striped active progress-sm">
                        <div id="upload_bar" style={{"width": this.state.progresspercet + '%'}} aria-valuemax="100" aria-valuemin="0" aria-valuenow="0" role="progressbar" className="progress-bar progress-bar-success">
                            <span className="sr-only">{this.state.progresspercet}% Complete</span>
                        </div>
                    </div>
                </div>
            );
            btnEnable = 'disable';
        }
        return (
            <section className="panel" >
                <header className="panel-heading">
                    Deployment &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button className="btn btn-info btn-sm" type="button" onClick={ (e) => { window.location.href="/modelser/cloud" }}  >Deployment from portal</button>
                </header>
                <div className="panel-body">
                    <form id="deployForm" className="form-horizontal left-align form-well" action="/modelser" method="post" encType="multipart/form-data" >
                        {/* <div className="form-group">
                            <label className="col-md-2 col-sm-2 control-label">模型条目</label>
                            <div className="col-md-6 col-sm-6">
                                <input name="m_name" type="text" id="m_name" className="form-control" readOnly="readOnly" />
                                <input name="m_id" type="hidden" id="m_id" className="form-control" />
                            </div>
                        </div> */}
                        <fieldset>
                            <div className="form-group">
                                <label className="col-md-2 col-sm-2 control-label">Limited</label>
                                <div className="col-md-2 col-sm-2">
                                    <select id="ms_limited" name="ms_limited" className="form-control" >
                                        <option value="0">Public</option>
                                        <option value="-1">Private</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="col-md-2 col-sm-2 control-label">Image</label>
                                <div className="col-md-6 col-sm-6">
                                    <div className="fileupload fileupload-new" data-provides="fileupload">
                                        <div className="fileupload-new thumbnail" style={ { "width ":"200px", "height":"150px" }}>
                                            <img src="/images/noimg.png" alt="" />
                                        </div>
                                        <div className="fileupload-preview fileupload-exists thumbnail" style={{"maxWidth" : "200px", "maxHeight" : "150px", "lineHeight": "20px"}}></div>
                                        <div>
                                        <span className="btn btn-default btn-file">
                                                <span className="fileupload-new"><i className="fa fa-paper-clip"></i> Select</span>
                                                <span className="fileupload-exists"><i className="fa fa-undo"></i> Change</span>
                                                <input id="file_img" name="ms_img" type="file" className="default"  accept=".png,.jpg" />
                                        </span>
                                            <a href="#" className="btn btn-danger fileupload-exists" data-dismiss="fileupload"><i className="fa fa-trash"></i> Remove</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="col-md-2 col-sm-2 control-label">Package</label>
                                <div className="col-md-6 col-sm-6">
                                    <div className="fileupload fileupload-new" data-provides="fileupload">
                                        <span className="btn btn-default btn-file">
                                            <span className="fileupload-new"><i className="fa fa-paper-clip"></i> Select</span>
                                            <span className="fileupload-exists"><i className="fa fa-undo"></i> Change</span>
                                            <input id="file_modelSer" name="file_model" type="file" className="default" accept=".zip" />
                                        </span>
                                        <span className="fileupload-preview" style={{ "marginLeft" : "5px"}}></span>
                                        <a href="#" className="close fileupload-exists" data-dismiss="fileupload" style={{"float":"none", "marginLeft":"5px"}}></a>
                                        <br />
                                        <br />
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        
                        <div className="form-group">
                            <label className="col-md-2 col-sm-2 control-label"></label>
                            <div className="col-md-6 col-sm-6">
                                <button className="btn btn-info" type="button" onClick={this.onSubmit} >Submit</button>
                            </div>
                        </div>
                    </form>
                    {procBar}
                    {/* <div className="box-widget">
                        <div className="widget-head clearfix">
                            <div id="top_tabby" className="block-tabby pull-left"></div>
                        </div>
                        <div className="widget-container">
                            <div className="widget-block">
                                <div className="widget-content box-padding">
                                    <form id="stepy_form" className="form-horizontal left-align form-well" action="/modelser" method="post" encType="multipart/form-data" >
                                        <fieldset title="Step 1">
                                            <legend>选择模型服务分类</legend>
                                            <ModelItemSelect  
                                                data-source={this.props['data-source-category']} 
                                                data-pulltag="false"
                                                onSelectedItem={ this.onSelectedItem }
                                                data-btn-text="Choose"  />
                                        </fieldset>
                                        <fieldset title="Step 2">
                                            <legend>模型服务选项及文件</legend>
                                            <div className="form-group">
                                                <label className="col-md-2 col-sm-2 control-label">模型条目</label>
                                                <div className="col-md-6 col-sm-6">
                                                    <input name="m_name" type="text" id="m_name" className="form-control" readOnly="readOnly" />
                                                    <input name="m_id" type="hidden" id="m_id" className="form-control" />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="col-md-2 col-sm-2 control-label">是否公开</label>
                                                <div className="col-md-6 col-sm-6">
                                                    <select id="ms_limited" name="ms_limited" className="form-control" >
                                                        <option value="0">公开</option>
                                                        <option value="-1">私有</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="col-md-2 col-sm-2 control-label">模型描述图片</label>
                                                <div className="col-md-6 col-sm-6">
                                                    <div className="fileupload fileupload-new" data-provides="fileupload">
                                                        <div className="fileupload-new thumbnail" style={ { "width ":"200px", "height":"150px" }}>
                                                            <img src="/images/noimg.png" alt="" />
                                                        </div>
                                                        <div className="fileupload-preview fileupload-exists thumbnail" style={{"maxWidth" : "200px", "maxHeight" : "150px", "lineHeight": "20px"}}></div>
                                                        <div>
                                                        <span className="btn btn-default btn-file">
                                                                <span className="fileupload-new"><i className="fa fa-paper-clip"></i> 选择图片</span>
                                                                <span className="fileupload-exists"><i className="fa fa-undo"></i> 更变</span>
                                                                <input id="file_img" name="ms_img" type="file" className="default"  accept=".png,.jpg" />
                                                        </span>
                                                            <a href="#" className="btn btn-danger fileupload-exists" data-dismiss="fileupload"><i className="fa fa-trash"></i> 移除</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="col-md-2 col-sm-2 control-label">模型文件</label>
                                                <div className="col-md-6 col-sm-6">
                                                    <div className="fileupload fileupload-new" data-provides="fileupload">
                                                        <span className="btn btn-default btn-file">
                                                            <span className="fileupload-new"><i className="fa fa-paper-clip"></i> 选择文件</span>
                                                            <span className="fileupload-exists"><i className="fa fa-undo"></i> 更变</span>
                                                            <input id="file_modelSer" name="file_model" type="file" className="default" accept=".zip" />
                                                        </span>
                                                        <span className="fileupload-preview" style={{ "marginLeft" : "5px"}}></span>
                                                        <a href="#" className="close fileupload-exists" data-dismiss="fileupload" style={{"float":"none", "marginLeft":"5px"}}></a>
                                                        <br />
                                                        <br />
                                                    </div>
                                                </div>
                                            </div>
                                        </fieldset>
                                        <button id="btn_ok" name="btn_upload" type="submit" className="finish btn btn-info btn-extend" disabled={btnEnable} >提交</button>
                                    </form>
                                    {procBar}
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </section>
        );
    }
});

module.exports = ModelSerDeployment;