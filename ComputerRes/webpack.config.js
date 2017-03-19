/**
 * Created by Franklin on 2017/3/14.
 */
var webpack = require('webpack');

module.exports = {
    entry : [
        './public/views/main/index.js'
    ],
    output: {
        path: './public/js/output/',
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