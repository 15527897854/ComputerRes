var mongoose = require('./mongooseModel');
var ModelBase = require('./modelBase');
var setting = require('../setting');

//该数据库下只会保存一条数据，即本机容器注册信息
function Register(register) {
    if(register){
        this.registered = register.registered;
        this.hostname = register.hostname;
        this.des = register.des;
        this.host = register.host;
        this.port = register.port;
        this.platform = setting.platform;
    }
    else{
        this.registered = false;
        this.hostname = '';
        this.des = '';
        this.host = '';
        this.port = '';
        this.platform = setting.platform;
    }
}

Register.__proto__ = ModelBase;
module.exports = Register;

var RegisterSchema = new mongoose.Schema({
    registered : Boolean, 
    hostname : String,
    des : String,
    host : String,
    port : String,
    platform : Number
},{collection:'register'});
var RegisterModel = mongoose.model('register',RegisterSchema);
Register.baseModel = RegisterModel;
Register.modelName = 'register';
