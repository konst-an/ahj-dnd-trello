const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devServer: {
        static: './dist',
        open: true,
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
        },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
        template: './src/index.html',
        }),
    ],
};