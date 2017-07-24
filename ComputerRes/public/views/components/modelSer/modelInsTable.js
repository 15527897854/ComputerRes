/**
 * Created by Franklin on 2017/7/17.
 */

var React = require('react');
var Axios = require('axios');
var NoteDialog = require('../../action/utils/noteDialog');

var ModelInsTable = React.createClass({

    getInitialState : function(){
        return {
            looper : null,
            mis : []
        };
    },

    componentDidMount : function(){
        this.refresh();
        var looper = setInterval(this.refresh, 2000);
        this.setState({ looper : looper });
    },

    refresh : function(){
        Axios.get(this.props['data-source']).then(
            data => {
                if(data.data.result == 'suc'){
                    this.setState({mis : data.data.data});
                }
                else{
                    this.setState({mis : []});
                }
            },
            err => {
                this.setState({mis : []});
            }
        );
    },

    kill : function(e, guid, mname){
        if(confirm('kill this model instance [' + mname + '], ID : [' + guid + '] ?')){
            Axios.get('/modelins/' + guid + '?ac=kill').then(
                data => {
                    if(data.data.result == 'suc'){
                        NoteDialog.openNoteDia('Info', 'Model instance ' + mname + ', ID : ' + guid + ' has been killed!');
                    }
                },
                err => {}
            );
        }
    },

    openDetail : function(e, guid){
        window.location.href = '/modelins/' + guid + '?ac=detail';
    },

    render : function(){
        var miss = [];
        if(this.props['data-type'] == 'rmthost'){
            miss = this.state.mis.map(function(item){
                return (
                    <tr>
                        <td>{ item.ms.ms_model.m_name }</td>
                        <td>{ item.ms.ms_model.m_type }</td>
                        <td>{ item.start }</td>
                        <td>{ item.state }</td>
                        <td>
                            <button className="btn btn-danger btn-xs" onClick={(e) => {this.kill(e, item.guid, item.ms.ms_model.m_name)}} ><i className="fa fa-times-circle" ></i>&nbsp;kill</button>&nbsp;
                            <button className="btn btn-info btn-xs" onClick={(e) => {this.openDetail(e, item.guid)}} ><i className="fa fa-book" ></i>&nbsp;detail</button>
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        else{
            miss = this.state.mis.map(function(item){
                return (
                    <tr>
                        <td>{ item.ms.ms_model.m_name }</td>
                        <td>{ item.ms.ms_model.m_type }</td>
                        <td>{ item.start }</td>
                        <td>{ item.state }</td>
                        <td>
                            <button className="btn btn-info btn-xs" onClick={(e) => {this.openDetail(e, item.guid)}} ><i className="fa fa-book" ></i>&nbsp;detail</button>
                        </td>
                    </tr>
                );
            }.bind(this));
        }
        return (
            <table  className="display table table-bordered table-striped" >
                <thead>
                    <tr>
                        <th>{window.LanguageConfig.ModelInstancesTable.ModelName }</th>
                        <th>{window.LanguageConfig.ModelService.Type }</th>
                        <th>{window.LanguageConfig.ModelInstancesTable.StartTime }</th>
                        <th>{window.LanguageConfig.ModelInstancesTable.Status }</th>
                        <th>{window.LanguageConfig.ModelInstancesTable.Operation }</th>
                    </tr>
                </thead>
                <tbody>
                    {miss}
                </tbody>
            </table>
        );
    }
});

module.exports = ModelInsTable;