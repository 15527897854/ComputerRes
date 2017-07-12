/**
 * Created by Franklin on 2017/4/28.
 */

var React = require('react');
var Axios = require('axios');

var ModelCategory = React.createClass({
    getInitialState : function () {
        return {
            loading : true,
            err : null
        };
    },

    componentDidMount : function () {
        this.refresh();
    },

    onSelectItem : function(id){
        if(this.props.onSelectItem){
            this.props.onSelectItem(id);
        }
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
                            this.onSelectItem(data.id);
                        }.bind(this)
                    });
                }
            },
            err => {
                this.setState({loading : false, err : err});
            }
        );
    },

    render : function(){
        if(this.state.loading){
            return (
                <span>Loading...</span>
            );
        }
        if(this.state.err) {
            return (
                <span>Error:{JSON.stringify(this.state.err)}</span>
            );
        }
        return (
            <div id="catalog_tree"></div>
        );
    }
});

module.exports = ModelCategory;