// var mongoose = require('./mongooseModel');
// var ModelBase = require('./modelBase');
// function Register(register) {
//     if(register){
//         this.registered = register.registered;
//     }
//     else{
//         this.registered = false;
//     }
// }
//
// Register.__proto__ = ModelBase;
// module.exports = Register;
//
// var RegisterSchema = new mongoose.Schema({
//     registered : Boolean
// },{collection:'register'});
// var RegisterModel = mongoose.model('register',RegisterSchema);
// Register.baseModel = RegisterModel;
// Register.modelName = 'register';
//
// Register.register = function (callback) {
//
// };
//
// Register.deregister = function () {
//
// };