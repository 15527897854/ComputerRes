/**
 * Created by Franklin on 2017/5/3.
 */
var React = require('react');
var Axios = require('axios');

var ModelCategory = require('./modelCategory');

var ModelItemSelect = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null,
            items : [],
            itemErr : null,
            init : false,
            cid : ''
        };
    },

    getModelItems : function(cid){
        if(cid == null){
            cid = this.state.cid
        }
        else {
            this.setState({cid : cid});
        }
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

    onSelectedItem : function(e, item){
        if(this.props['onSelectedItem']) {
            this.props.onSelectedItem(e, item);
        }
    },

    render : function() {
        var Items = null;
        var Paging = null;
        if(this.state.itemErr){
            Items = (<span>Error : {JSON.stringify(this.state.itemErr)}</span>);
        }
        else{
            var pages = parseInt(this.state.items.length / 10) + 1;
            var count = 0;

            var buttonText = '详情';
            if(this.props['data-btn-text']){
                buttonText = this.props['data-btn-text'];
            }
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
                            <button className="btn btn-info btn-sm" onClick= { (e)=>{ this.onSelectedItem(e, item) }} > {buttonText} </button>
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
        return (
                <div className="row">
                    <div className="col-md-6">
                        <section className="panel" >
                            <header className="panel-heading">
                                门户模型分类
                            </header>
                            <ModelCategory data-source={this.props['data-source']} onSelectItem={this.getModelItems} />
                        </section>
                    </div>
                    <div className="col-md-6">
                        <section className="panel" >
                            <header className="panel-heading">
                                门户模型条目
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
                </div>
        );
    }
});

module.exports = ModelItemSelect;