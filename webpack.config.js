/**************************************************
 *
 *  Webpack
 *
 **************************************************/
const webpack = require('webpack');

/** Plugin **/
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackBrowserPlugin = require('webpack-browser-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/** Helper **/
const autoprefixer = require('autoprefixer');
const path = require('path');
const glob = require("glob");
const fs = require("fs");


/** Path **/
//SRC
var SRC_DIR = path.resolve(__dirname, './src');
//DIST
var DIST_DIR = path.resolve(__dirname,  './dist');

/** Path - public **/
var SRC_PUBLIC_DIR = path.resolve(SRC_DIR, './public');
var SCRIPT_SRC_DIR = SRC_PUBLIC_DIR + '/js';
var STYLE_SRC_DIR = SRC_PUBLIC_DIR + '/css';
var IMAGE_SRC_DIR = SRC_PUBLIC_DIR + '/img';

/** Path - lib (TODO: 추후 NPM 패키지로 빼든 하고파) **/
var CROSSMAN_DIR = path.resolve(__dirname, '../crossman');
var BOXMAN_DIR = path.resolve(__dirname, '../boxman');
var POPMAN_DIR = path.resolve(__dirname, '../popman');
var KEYMAN_DIR = path.resolve(__dirname, '../keyman');
//SJDocument-Maker
var boxmanJsList = glob.sync(BOXMAN_DIR+ "/src/**/boxman.js");
var popmanJsList = glob.sync(POPMAN_DIR+ "/src/**/popman.js");
var crossmanJsList = glob.sync(CROSSMAN_DIR + "/src/**/crossman.js");
var thisJsList = glob.sync(SRC_DIR + "/**/*.js");
var dependencyList = [].concat(crossmanJsList).concat(boxmanJsList).concat(popmanJsList);
//Temp
var TEMP_SRC_PATH = path.resolve(__dirname,  './temp/temp_to_full_reload.html');




/*************************
 *  PLUGIN
 *************************/
function makeCommonPlugins(sjMarkDown, srcPublicDir, distDir){
    var alias = sjMarkDown.alias;
    var aliasPath = (alias ? alias + '/' : '');
    return {
        copyWebpackPlugin:[
            new CopyWebpackPlugin([
                {
                    from: path.resolve(srcPublicDir, './lib'),
                    to: path.resolve(distDir, './lib'),
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: path.resolve(srcPublicDir, './css'),
                    to: path.resolve(distDir, './css'),
                }
            ]),
        ],
        extractTextPlugin:[
            // new ExtractTextPlugin({
            //     // filename: aliasPath +'css/style.bundle.css',
            //     filename: 'css/style.bundle.css',
            //     allChunks: true
            // }),
        ],
        htmlWebpackPlugin:[
            /** Main Page (index.html) **/
            new HtmlWebpackPlugin({
                filename: aliasPath + 'index.html',
                template: srcPublicDir + '/template/index-to-main.hsb',
                chunks: [alias],
                chunksSortMode: 'manual',
                inject: 'head',  //head or body
                title: 'Moving to document',
                homePage: sjMarkDown.homePage,
                minify: {
                    collapseWhitespace: true,
                    keepClosingSlash: true,
                    removeComments: true,
                },
            }),
        ],
    };
}




/*************************
 *
 *  Modules
 *
 *************************/
module.exports = (env, options) => {

    console.log('==================================================');
    console.log('===== env', env);
    console.log('===== options', options);
    var pathToDocs = env.docs;
    var mode = env.mode;

    //SjMarkDown //TODO:손봐
    // var ttta = path.resolve(env.docs);
    var pathListToDocs = glob.sync(pathToDocs);
    pathListToDocs = (pathListToDocs.length > 0) ? pathListToDocs : [pathToDocs];
    var config;
    var distDirList = [];
    var pluginList = [];
    var commonPlugins = {
        copyWebpackPlugin: [],
        extractTextPlugin: [],
        htmlWebpackPlugin: [],
        htmlWebpackPluginForIndex: [],
    };
    var entries = {};
    var aliasList = [];

    console.error(pathListToDocs.length, pathListToDocs);

    pathListToDocs.forEach(function(it){
        console.log("=====", it);
        var sjMarkDown = require(it);
        var alias = sjMarkDown.alias;
        aliasList.push(alias);
        sjMarkDown
            .setModeDevelopment((mode=='development'))
            .setTemplate(SRC_PUBLIC_DIR + '/template/template.hsb')
            .setChunks([alias])
            .setDefaultDist( (alias) ? path.resolve(DIST_DIR, alias) : DIST_DIR )
            ;
        //Dists
        var distDir = sjMarkDown.defaultDist;
        distDirList.push( distDir );
        //Plugins
        pluginList = pluginList.concat( sjMarkDown.generateDevelopWebpackPluginList(TEMP_SRC_PATH) );
        var thisCommonPlugins = makeCommonPlugins(sjMarkDown, SRC_PUBLIC_DIR, distDir);
        commonPlugins.copyWebpackPlugin = commonPlugins.copyWebpackPlugin.concat(thisCommonPlugins.copyWebpackPlugin);
        // commonPlugins.extractTextPlugin = commonPlugins.extractTextPlugin.concat(thisCommonPlugins.extractTextPlugin);
        // commonPlugins.extractTextPlugin = thisCommonPlugins.extractTextPlugin;
        commonPlugins.htmlWebpackPlugin = commonPlugins.htmlWebpackPlugin.concat(thisCommonPlugins.htmlWebpackPlugin);
        // commonPlugins.afterCopyWebpackPlugin = commonPlugins.afterCopyWebpackPlugin.concat(thisCommonPlugins.afterCopyWebpackPlugin);
        //Entries
        entries[alias] = dependencyList.concat(thisJsList);
    });

    //- Make MainPage
    commonPlugins.htmlWebpackPluginForIndex.push(
        /** Main Page (index.html) **/
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: SRC_PUBLIC_DIR + '/template/index.hsb',
            chunksSortMode: 'manual',
            inject: 'head',  //head or body
            title: 'Moving to main document',
            homePages: aliasList.join(','),
            minify: {
                collapseWhitespace: true,
                keepClosingSlash: true,
                removeComments: true,
            },
        }),
    );


    console.log('checkcehcehk', commonPlugins);


    config = {
        /*************************
         *  Entry
         *************************/
        entry: entries,
            // {
            //     'help': dependencyList.concat(thisJsList),
            //     // 'preRender.polyfill': [LIB_SCRIPT_SRC_DIR + '/preRender.polyfill.js']
            // },
        resolve: {
            extensions: ['.js', '.jsx'],
            alias:{
                'this_lib_js': path.resolve(BOXMAN_DIR, './src/js/boxman.js'),
                'this_lib_css': path.resolve(BOXMAN_DIR, './src/css/boxman.css'),

                'this_help_js': path.resolve(SCRIPT_SRC_DIR, './main.js'),
                'this_help_css': path.resolve(STYLE_SRC_DIR, './main.css'),
                'markdown_css': path.resolve(STYLE_SRC_DIR, './markdown.css'),
                'github_css': path.resolve(STYLE_SRC_DIR, './github.css'),

                // 'ace': path.resolve(BOWER_LIB_DIR, 'ace-builds/src-min-noconflict/ace.js'),
            }
        },
        // postcss: [
        //   autoprefixer({
        //     browsers: ['last 2 versions', '> 10%', 'ie 9']
        //   })
        // ],

        /*************************
         *  MODULE
         *************************/
        module: {
            loaders: [
                /** js  **/
                { test: /\.js$/, loaders: ['babel-loader'], exclude: /(node_modules|bower_components)/ },
                /** css  **/
                // {
                //     test: /\.css$/, loader: ExtractTextPlugin.extract({
                //         use: ['css-loader'],
                //         fallback: 'style-loader',
                //         publicPath: '',
                //         allChunks: true
                //     })
                // },
                /** html **/
                { test: /\.html$/, loader: 'raw-loader' },
                /** hsb **/
                { test: /\.hbs$/, loader: "handlebars-loader" },
                /** images **/
                { test:  /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader' },
                /** Markdown **/
                { test: /\.md$/, loader: ['html-loader', 'markdown-loader'] },
                /** font **/
                { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]' },
                /** font **/
                { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[name].[ext]' },
            ] ,
        }
    };



    switch (mode){
        case 'development':
            console.log('###########################################################################');
            console.log('######################### DEVELOPMENT !!!');
            console.log('###########################################################################');
            config.devServer = {
                contentBase: path.join(__dirname, "src"),
                port: 8081,
                watchContentBase: true
                // compress: true,
                // clientLogLevel: "none",
                // historyApiFallback: true,
            };
            config.devtool =  'cheap-eval-source-map';
            config.output = {
                publicPath: '/',
                path: DIST_DIR,
                filename: '[name]/js/[name].bundle.js',
                chunkFilename: '[name].js',
                sourceMapFilename: '[name].js.map'
            };
            config.plugins = []
                .concat([
                    /** Automatically Reload (when source code is fixed) **/
                    new webpack.HotModuleReplacementPlugin(),
                ])
                .concat(commonPlugins.copyWebpackPlugin)
                // .concat(commonPlugins.extractTextPlugin)
                .concat(commonPlugins.htmlWebpackPlugin)
                .concat(commonPlugins.htmlWebpackPluginForIndex)
                .concat([
                    /** Open Browser After bundling **/
                    new WebpackBrowserPlugin()
                ])
                .concat(pluginList)
                ;
            break;



        default:
            console.log('###########################################################################');
            console.log('######################### PRODUCT !!!');
            console.log('###########################################################################');
            config.module.loaders[0].loaders = ['babel-loader', 'webpack-strip?strip[]=debug,strip[]=console.log,strip[]=console.warn,strip[]=console.dir'];
            config.output = {
                path: DIST_DIR,
                filename: '[name]/js/[name].bundle.js',
            };
            config.plugins = []
                .concat([
                    /** Clean **/
                    new CleanWebpackPlugin(distDirList),
                    new webpack.optimize.UglifyJsPlugin({
                        compressor: {
                            warnings: false,
                        },
                    }),
                    new webpack.optimize.OccurrenceOrderPlugin(),
                ])
                .concat(commonPlugins.copyWebpackPlugin)
                // .concat(commonPlugins.extractTextPlugin)
                .concat(commonPlugins.htmlWebpackPlugin)
                .concat(commonPlugins.htmlWebpackPluginForIndex)
                .concat(pluginList)
                ;
            break;
    }


    return config;
};