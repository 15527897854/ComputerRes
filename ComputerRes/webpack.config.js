/**
 * Created by Franklin on 2017/3/14.
 */
var webpack = require('webpack');
var path = require('path');

module.exports = {
    context:__dirname,
    entry : [
        path.join(__dirname, './public/views/main/index.js')
    ],
    output: {
        path: path.join(__dirname, '/public/js/output/'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                loader: ['jsx-loader?harmony']
            }
        ]
    }

};