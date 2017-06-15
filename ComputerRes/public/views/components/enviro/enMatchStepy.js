/**
 * Created by SCR on 2017/6/10.
 */
var React = require('react');
var Axios = require('axios');
var EnMatchTable = require('./enMatchTable');

var EnMatchStepy = React.createClass({
    getInitialState:function () {
        return {
            ui:null,
            sweRst:null,
            hweRst:null
        };
    },

    componentDidMount:function () {

    },

    GetMatchResult:function () {
        var self = this;
        webix.ready(function () {
            self.state.sweRst = self.refs['swe-table-ref'].getMatchedResult().result;
            self.state.hweRst = self.refs['hwe-table-ref'].getMatchedResult().result;
            var sweRst = 1,hweRst = 1;
            var sweRstLen = self.state.sweRst.length;
            var hweRstLen = self.state.hweRst.length;
            for(var i=0;i<sweRstLen;i++){
                if(self.state.sweRst[i].result == 0){
                    sweRst = 0;
                    break;
                }
            }
            for(var j=0;j<hweRstLen;j++){
                if(self.state.hweRst[j].result == 0){
                    hweRst = 0;
                    break;
                }
            }
            if(self.state.sweRst.length == 0){
                self.state.sweRst.push({
                    name:'null',
                    result:-1
                });
                sweRstLen+=1;
            }
            if(self.state.hweRst.length == 0){
                self.state.hweRst.push({
                    name:'null',
                    result:-1
                });
                hweRstLen+=1;
            }
            var sweHeight,hweHeight;
            sweHeight = 34*(sweRstLen>4?4:sweRstLen);
            hweHeight = 34*(hweRstLen>4?4:hweRstLen);
            var rstList = {
                type:'line',
                cols:[{
                    type:'clean',
                    rows:[{
                        view:'template',
                        type:'header',
                        height:40,
                        css:'webix-list-header',
                        template:'软件环境'
                    },{
                        type:'clean',
                        view:'list',
                        width:self.props.css.width.tabbar/2,
                        height:sweHeight,
                        template:function (obj, common, value) {
                            return obj.name;
                        },
                        scheme:{
                            $init:function (obj) {
                                if(obj.result == 0)
                                    obj.$css = 'matchList-unmatched';
                                else if(obj.result == 1)
                                    obj.$css = 'matchList-matched';
                                else if(obj.result == -1)
                                    obj.$css = 'matchList-null';
                            }
                        },
                        data:self.state.sweRst,
                        scrollX:true,
                        scrollY:true,
                        borderless:true
                    }]
                },{
                    type:'clean',
                    rows:[{
                        view:'template',
                        type:'header',
                        height:40,
                        css:'webix-list-header',
                        template:'硬件环境'
                    },{
                        type:'clean',
                        view:'list',
                        width:self.props.css.width.tabbar/2,
                        height:hweHeight,
                        template:function (obj, common, value) {
                            return obj.name;
                        },
                        scheme:{
                            $init:function (obj) {
                                if(obj.result == 0)
                                    obj.$css = 'matchList-unmatched';
                                else if(obj.result == 1)
                                    obj.$css = 'matchList-matched';
                                else if(obj.result == -1)
                                    obj.$css = 'matchList-null';
                            }
                        },
                        data:self.state.hweRst,
                        scrollX:true,
                        scrollY:true,
                        borderless:true
                    }]
                }]
            };
            if(sweRst && hweRst){
                webix.ui({
                    id:'match-rst',
                    type:'clean',
                    width:700,
                    container:self.props.id+'-match-result',
                    rows:[rstList, {
                        type:'clean',
                        rows:[{
                            height:20
                        },{
                            type:'clean',
                            view:'template',
                            height:20,
                            template:'环境匹配成功，您可以部署模型！'
                        }]
                    }]
                });
                self.props.changeModalBtn(false);
            }
            else{
                webix.ui({
                    type:'clean',
                    width:750,
                    container:self.props.id+'-match-result',
                    rows:[rstList, {
                        type:'clean',
                        rows:[{
                            height:20
                        },{
                            type:'clean',
                            view:'template',
                            height:20,
                            template:'环境匹配失败，部分软硬件环境不匹配！'
                        }]
                    }]
                });
                self.props.changeModalBtn(true);
            }
        });
    },

    tabOnClick:function (e) {
        var self = this;
        if($($('#' +this.props.id + ' ul li')[2]).hasClass('active')){
            if(self.refs['swe-table-ref'].hadLoaded() && self.refs['hwe-table-ref'].hadLoaded()){
                this.props.changeModalFooter(true);
                $('#'+self.props.id+'-match-result').children().remove();
                this.GetMatchResult();
            }
            else{
                $('#' + self.props.id+'-match-result').children().remove();
                webix.ready(function () {
                    webix.ui({
                        container:self.props.id+'-match-result',
                        template:'<span><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>&nbsp;&nbsp;&nbsp;Loading...</span>',
                        height:60,
                        type:'clean',
                        borderless:true,
                        border:false
                    })
                })
            }
        }
        else{

            this.props.changeModalFooter(false);
        }
    },

    removeTab3:function () {
        $('#'+this.props.id+'-match-result').children().remove();
    },

    render:function () {
        return (
            <div id={this.props.id}>
                <section className="panel">
                    <header className="panel-heading custom-tab ">
                        <ul className="nav nav-tabs">
                            <li className="active" onClick={e=>{this.tabOnClick(e)}}>
                                <a href="#swe-tab" data-toggle="tab">Software Enviroment</a>
                            </li>
                            <li className="" onClick={e=>{this.tabOnClick(e)}}>
                                <a href="#hwe-tab" data-toggle="tab">Hardware Enviroment</a>
                            </li>
                            <li className="" onClick={e=>{this.tabOnClick(e)}}>
                                <a href="#match-result" data-toggle="tab">Match result</a>
                            </li>
                        </ul>
                    </header>
                    <div className="panel-body">
                        <div className="tab-content">
                            <div className="tab-pane active" id="swe-tab">
                                <EnMatchTable
                                    tableID="swe-table"
                                    type="swe"
                                    pid={this.props.pid}
                                    place={this.props.place}
                                    css={this.props.css}
                                    ref='swe-table-ref'
                                    removeTab3={this.removeTab3}
                                />
                            </div>
                            <div className="tab-pane" id="hwe-tab">
                                <EnMatchTable
                                    tableID="hwe-table"
                                    type="hwe"
                                    pid={this.props.pid}
                                    place={this.props.place}
                                    css={this.props.css}
                                    ref='hwe-table-ref'
                                    removeTab3={this.removeTab3}
                                />
                            </div>
                            <div className="tab-pane" id="match-result">
                                <div id={this.props.id+'-match-result'}></div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
});

module.exports = EnMatchStepy;