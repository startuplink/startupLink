const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');


const extractPlugin = new ExtractTextPlugin({ filename: './popup/startupLinkPopup.css' });


module.exports = {
    entry: {
        popup: "./popup/startupLinkPopup.js"
    },
    output: {
        path: path.resolve(__dirname, "addon"),
        filename: "[name]/index.js"
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
        ]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new CopyWebpackPlugin([
            {
                from: 'static'
            }
        ]),
        new GenerateJsonPlugin('manifest.json', merge(
            require(`./manifest/firefox.json`)
        ), null, 2)
    ]
};
