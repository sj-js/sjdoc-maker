const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const FilewatcherPlugin = require("filewatcher-webpack-plugin");
const path = require('path');
const glob = require("glob");
const file = require("fs");
const marked = require("marked");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


function SjMarkdownManager(options){
    this.publicDirRawFilesMap = undefined;

    this.libraryNameMarkdownPathsMap = undefined;
    this.libraryNameResolvedMarkdownPathsMap = undefined;
    this.markdownFileRange = undefined;
    this.markdownFilePathList = undefined;

    this.htmlWebpackPluginList = [];
    this.filewatcherPluginList = [];

    this.poolByLibraryName = {};
    this.jsonPool = {};
    this.template;
    this.chunks;
    this.defaultDist;

    this.modeDevelopment = false;
    this.alias = null;
    this.homePage = null;
    this.dist = null;

    //Temp
    this.tempAllCallCountForChangeEvent = 0;
    this.tempCallCountForChangeEvent = 0;
    this.tempCheckingNewList = [];
    this.lastFileCount = -1;
    this.tempAllFileCount = 0;
    this.modeAddAndRemoveEvent = false;
}

SjMarkdownManager.TAG_REPLACER_AFTER_GENERATING_MENU = '<indexlist></indexlist>'; //Custom Tag wiil be replaced

/** Exports **/
try {
    module.exports = exports = SjMarkdownManager;
} catch (e) {}


SjMarkdownManager.prototype.setModeDevelopment = function(mode){
    this.modeDevelopment = mode;
    return this;
};

SjMarkdownManager.prototype.setAlias = function(alias){
    this.alias = alias;
    return this;
};
SjMarkdownManager.prototype.setHome = function(homePage){
    this.homePage = homePage;
    return this;
};
SjMarkdownManager.prototype.setDist = function(dist){
    this.dist = dist;
    return this;
};

SjMarkdownManager.prototype.setLibraryNameAndPublicDirRawFilesMap = function(libraryNameAndPublicDirRawFilesMap){
    this.libraryNameAndPublicDirRawFilesMap = libraryNameAndPublicDirRawFilesMap;
    return this;
};

SjMarkdownManager.prototype.setLibraryNameAndMarkdownPathsMap = function(libraryNameAndMarkdownPathsMap){
    var that = this;
    this.libraryNameAndMarkdownPathsMap = libraryNameAndMarkdownPathsMap;
    this.libraryNameResolvedMarkdownPathsMap = this.resolveAllPath(libraryNameAndMarkdownPathsMap);
    this.markdownFileRange = this.concatAllValue(libraryNameAndMarkdownPathsMap);
    this.markdownFilePathList = this.concatAllValue(this.libraryNameResolvedMarkdownPathsMap);
    // console.log(this.libraryNameMarkdownPathsMap);
    // console.log(this.markdownFileRange);
    // console.log(this.markdownFilePathList);
    return this;
};

SjMarkdownManager.prototype.concatAllValue = function(map){
    var result = [];
    for (var key in map){
        var item = map[key];
        if (typeof item == 'string')
            result.push(item);
        if (item instanceof Array){
            for (var i=0; i<item.length; i++){
                result.push(item[i]);
            }
        }
    }
    return result;
};
SjMarkdownManager.prototype.resolveAllPath = function(rangeObject){
    if (typeof rangeObject == 'string')
        rangeObject = glob.sync(rangeObject);
    if (rangeObject instanceof Array){
        var result = [];
        for (var i=0; i<rangeObject.length; i++){
            var resolvedPath = glob.sync(rangeObject[i]);
            if (resolvedPath instanceof Array){
                for (var j=0; j<resolvedPath.length; j++){
                    result.push(resolvedPath[j]);
                }
            }else{
                result.push(resolvedPath);
            }
        }
        return result;

    }else if (rangeObject instanceof Object){
        var result = {};
        for (var libName in rangeObject){
            var paths = rangeObject[libName];
            result[libName] = this.resolveAllPath(paths);
        }
        return result;
    }
};


SjMarkdownManager.prototype.setTemplate = function(templateFilePath){
    this.template = templateFilePath;
    return this;
};

SjMarkdownManager.prototype.setChunks = function(chunkList){
    this.chunks = chunkList;
    return this;
};

SjMarkdownManager.prototype.setDefaultDist = function(defaultDist){
    this.defaultDist = defaultDist;
    return this;
};









SjMarkdownManager.prototype.generateDevelopWebpackPluginList = function(TEMP_PATH){
    var resultList = [];
    var copyWebpackPluginList = this.generateCopyWebpackPluginFromRawFiles(this.libraryNameAndPublicDirRawFilesMap);
    var htmlWebpackPluginList = this.generateHtmlWebpackPluginFromMarkdownFiles(this.libraryNameResolvedMarkdownPathsMap, this.poolByLibraryName);
    resultList = resultList.concat(copyWebpackPluginList).concat(htmlWebpackPluginList);
    if (this.modeDevelopment){
        var fileWatcherPluginList = this.generateFilewatcherPluginToReloadFully(TEMP_PATH, this.markdownFileRange);
        resultList = resultList.concat(fileWatcherPluginList);
    }else{
        if (this.dist){
            var fileCopyAfterBuildPluginList = this.generateFileCopyAfterBuildPluginList(this.defaultDist, this.dist);
            resultList = resultList.concat(fileCopyAfterBuildPluginList);
        }
    }
    return resultList;
};

SjMarkdownManager.prototype.generateCopyWebpackPluginFromRawFiles = function(publicDirRawFilesMap){
    var copyWebpackObjectList = [];
    for (var publicPath in publicDirRawFilesMap){
        var rawPathList = publicDirRawFilesMap[publicPath];
        var targetPath = (this.alias ? this.alias + '/' : '') + publicPath;
        for (var i=0; i<rawPathList.length; i++){
            var rawPath = rawPathList[i];
            copyWebpackObjectList.push({
                from: rawPath,
                transform: function(fileContent, path) {
                    return fileContent;
                },
                to: targetPath
            });
        }

    }
    return [ new CopyWebpackPlugin(copyWebpackObjectList) ];
};

SjMarkdownManager.prototype.generateFileCopyAfterBuildPluginList = function(defaultDistPath, secondDistPath){
    return [
        new FileManagerPlugin({
            onStart: {
                mkdir:[
                    secondDistPath
                ]
            },
            onEnd: {
                copy:[
                    {source:defaultDistPath, destination:secondDistPath}
                ]
            }
        })
    ];
};

/*************************
 * Generating HtmlWebpackPlugin
 *************************/
SjMarkdownManager.prototype.generateHtmlWebpackPluginFromMarkdownFiles = function(libraryNameResolvedMarkdownPathsMap, poolByLibraryName){
    console.log('\n ========================= Start Generating SJ Markdown');
    var that = this;
    // var libraryNameResolvedMarkdownPathsMap = that.libraryNameResolvedMarkdownPathsMap;

    this.updateSjMarkdown();
    // console.log(libraryNameResolvedMarkdownPathsMap);

    for (var libName in libraryNameResolvedMarkdownPathsMap){
        var markdownFilePathListByLibName = libraryNameResolvedMarkdownPathsMap[libName];

        for (var i=0; i<markdownFilePathListByLibName.length; i++){
            var mdFilePath = markdownFilePathListByLibName[i];
            var fileName = path.basename(mdFilePath);
            var mdFileName = fileName.split('.')[0];
            that.htmlWebpackPluginList.push(new HtmlWebpackPlugin({
                filename: './' + (this.alias ? this.alias +'/' : '') + libName + '/' + mdFileName + '.html',
                template: that.template,
                chunks: that.chunks,
                chunksSortMode: 'manual',
                inject: 'head',  //head or body
                title: mdFileName,
                libraryName: libName,
                mdFileName: mdFileName,
                thisContext: poolByLibraryName[libName]['poolByFileName'][mdFileName],
            }));
        }
    }

    console.log('========================= Finish Generating SJ Markdown \n');
    return that.htmlWebpackPluginList;
};

SjMarkdownManager.prototype.updateSjMarkdown = function(){
    var that = this;
    // var libraryNameResolvedMarkdownPathsMap = that.libraryNameResolvedMarkdownPathsMap;
    var libraryNameMarkdownPathsMap = that.libraryNameAndMarkdownPathsMap;

    /** Generate HeaderMenu **/
    var headerMenuObject = {};
    var mergeHeaderMenuObject = {};
    for (var libName in libraryNameMarkdownPathsMap) {
        mergeHeaderMenuObject[libName] = {};
    }
    headerMenuObject['json'] = JSON.stringify(mergeHeaderMenuObject);


    for (var libName in libraryNameMarkdownPathsMap) {
        var markdownFilePathList = libraryNameMarkdownPathsMap[libName];
        markdownFilePathList = this.resolveAllPath(markdownFilePathList);

        /** Generate Object **/
        var libraryNamePool = this.generateObjectInObject(this.poolByLibraryName, libName, {
            'headerMenu':{},
            'menu':{},
            'menuOrderList':{},
            'poolByFileName':{},
            'indexReplaceTargetFileName':'',
            'indexReplaceTarget': SjMarkdownManager.TAG_REPLACER_AFTER_GENERATING_MENU,
            'indexOriginalHtml':'',
        });
        libraryNamePool['headerMenu'] = headerMenuObject;
        var poolByFileName = libraryNamePool['poolByFileName'];
        var menuObject = libraryNamePool['menu'];
        var menuOrderListObject = libraryNamePool['menuOrderList'];
        var mergeMenuObject = {};

        for (var i = 0; i < markdownFilePathList.length; i++) {
            var markdownFilePath = markdownFilePathList[i];
            var markdownFileName = path.basename(markdownFilePath).split('.')[0];
            console.log('----- Update - Generating SJ Markdown', i, markdownFileName);
            //Load Markdown File
            var markdownText = file.readFileSync(markdownFilePath, 'utf-8');

            /** Generate SjMarkdown **/
            var fileNamePool = this.generateObjectInObject(poolByFileName, markdownFileName, {'save': {}});
            fileNamePool['menu'] = menuObject;
            fileNamePool['menuOrderList'] = menuOrderListObject;
            fileNamePool['headerMenu'] = headerMenuObject;
            fileNamePool['html'] = this.generateSjMarkdown(libName, markdownFileName, markdownText);

            /** Generate Menu **/
            var poolData = poolByFileName[markdownFileName];
            var html = poolData['html'];
            var tempObject = this.generateMenuDataFromHtmlH1H2(libName, markdownFileName, html);
            console.log('----- MENU');
            console.log(tempObject);
            for (var h1Text in tempObject){
                 mergeMenuObject[h1Text] = tempObject[h1Text];
            }
        }

        /** After All of Generating **/
        //Menu Order
        if (menuOrderListObject['object']){
            mergeMenuObject = that.sortByList(mergeMenuObject, menuOrderListObject['object']);
        }
        menuObject['json'] = JSON.stringify(mergeMenuObject);

        //Replace Index
        var targetFileName = libraryNamePool['indexReplaceTargetFileName'];
        var target = libraryNamePool['indexReplaceTarget'];
        var originalHtml = libraryNamePool['indexOriginalHtml'];
        if (targetFileName){
            //Make Replacement and Replace
            const dom = new JSDOM(originalHtml);
            const document = dom.window.document;
            var ulElement = document.querySelector("ul");
            var olElement = document.querySelector("ol");
            if (ulElement){
                for (var i=0; i<ulElement.children.length; i++){
                    var childElement = ulElement.children[i];
                    var title = childElement.textContent.split('\n')[0];
                    var h1Object = mergeMenuObject[title];
                    if (h1Object){
                        var publicPathToThisTitle = h1Object['path']
                        var aElement = document.createElement('a');
                        aElement.setAttribute('href', '../' + publicPathToThisTitle);
                        aElement.innerHTML = title;
                        childElement.innerHTML = childElement.innerHTML.replace(title,  aElement.outerHTML);
                    }
                }
            }
            var replacement = ulElement.outerHTML;
            //Replace
            poolByFileName[targetFileName]['html'] = poolByFileName[targetFileName]['html'].replace(target, replacement);
        }

        // console.log ( '///// ///// ///// ///// ///// asdfasdfasfasdfasfgrgrthytmuy' );
        // console.log ( headerMenuObject['json'] );
        // console.log ( menuObject['json'] );
    }
};
SjMarkdownManager.prototype.generateObjectInObject = function(object, name, dataMap){
    //Make Object
    if (object[name] === undefined || object[name] === null){
        object[name] = {};
        //Copy Init Data
        if (dataMap){
            for (var key in dataMap){
                object[name][key] = dataMap[key];
            }
        }
    }
    return object[name];
};

SjMarkdownManager.prototype.generateSjMarkdown = function (libraryName, name, markdownText){
    var htmlFromMarkdown = marked(markdownText);
    htmlFromMarkdown = this.getHtmlSavedAndRemovedSpecialData(libraryName, name, htmlFromMarkdown);
    htmlFromMarkdown = this.getCodeViewerConvertedToAceEditor(htmlFromMarkdown);
    return htmlFromMarkdown;
};

/**************************************************
 * < Remove Code >
 *      *@* *x* *@*
 *
 * < Save Code >
 *      *@* *+{ID}* *@*
 *
 * < Make Code Runner >
 *      -                  Just Make:   *@* *!* *@*
 *      - Make with Some Prefix Code:   *@* *!{ID}* *@*
 *      - Make with Some Surfix Code:   *@* *!!{ID}* *@*
 *
 * < Make Menu Order >
 *      *@* **order** *@*
 **************************************************/
SjMarkdownManager.prototype.getHtmlSavedAndRemovedSpecialData = function (libraryName, markdownFileName, html){
    var that = this;
    var resultData = null;
    while (true){
        // var hasSign = this.extractDataFromHtml(html, '<p><em>@</em>', '</p>', function(data){
        var hasSign = this.extractDataFromHtml(html, '<em>@</em>', '<em>@</em>', '<pre><code', '</code></pre>', function(data){
            // console.debug(data);
            var dataHtml = data.dataHtml;
            var idByEmTextList = data.idByEmTextList;
            var idByStrongTextList = data.idByStrongTextList;

            /*************************
             * Checking & Collecting infomation
             *************************/
            var modeRemoveCode = false, modeCodeRunner = false, modeSaveCode = false, modeMenuOrder = false;
            var saveCodeIdList = [], prefixAdditionCodeIdList = [], surfixAdditionCodeIdList = [];

            /** between <strong> and </strong> **/
            for (var i=0; i<idByStrongTextList.length; i++) {
                var id = idByStrongTextList[i];
                // console.debug(id, id.length );
                if (id == 'order'){
                    modeMenuOrder = true;
                }
            }

            /** between <em> and </em> **/
            for (var i=0; i<idByEmTextList.length; i++) {
                var id = idByEmTextList[i];
                // console.debug(id, id.length );
                if (id.indexOf('!') == 0){
                    modeCodeRunner = true;
                    if (id.length == 1){
                        //none
                    }else if (id.indexOf('!!') == 0){
                        surfixAdditionCodeIdList.push( id.substring(2, id.length) );
                    }else{
                        prefixAdditionCodeIdList.push( id.substring(1, id.length) );
                    }
                }
                if (id.indexOf('x') == 0){
                    modeRemoveCode = true;
                }
                if (id.indexOf('+') == 0){
                    modeSaveCode = true;
                    saveCodeIdList.push( id.substring(1, id.length) );
                }
            }

            // console.debug(modeCodeRunner, modeRemoveCode, modeSaveCode);
            // console.debug(prefixAdditionCodeIdList, surfixAdditionCodeIdList, saveCodeIdList);

            /** Save Menu Order **/
            if (modeMenuOrder){
                var menuOrderList = [];
                var listAsMarkdown = data.data;
                dataHtml = marked(listAsMarkdown);
                const dom = new JSDOM(dataHtml);
                var ulElement = dom.window.document.querySelector("ul");
                var olElement = dom.window.document.querySelector("ol");
                if (ulElement){
                    for (var i=0; i<ulElement.children.length; i++){
                        var childElement = ulElement.children[i];
                        var title = childElement.textContent.split('\n')[0];
                        menuOrderList.push(title);
                    }
                }
                //Make Pool
                var poolByFileName = that.poolByLibraryName[libraryName]['poolByFileName'];
                // var fileNamePool = that.generateObjectInObject(poolByFileName, mdFileName, {'menuOrderList': {}});
                var fileNamePool = poolByFileName[markdownFileName];
                fileNamePool['menuOrderList']['object'] = menuOrderList;
                fileNamePool['menuOrderList']['json'] = JSON.stringify(menuOrderList);
            }

            /** Save Code **/
            if (modeSaveCode){
                var saveMap = {};
                //Save in My Pool
                for (var ii=0; ii<saveCodeIdList.length; ii++){
                    var saveCodeId = saveCodeIdList[ii];
                    saveMap[saveCodeId] = data.data;
                    // console.debug('/////');
                    // console.debug(markdownFileName, saveCodeId, data.data);
                }
                //Make Pool
                var poolByFileName = that.poolByLibraryName[libraryName]['poolByFileName'];
                var fileNamePool = that.generateObjectInObject(poolByFileName, markdownFileName, {'save': {}});
                fileNamePool['save']['object'] = saveMap;
                fileNamePool['save']['json'] = JSON.stringify(saveMap);
            }

            /*************************
             * Render Setup
             *************************/
            /** Remove code **/
            if (modeRemoveCode){
                //- Remove code from text
                html = data.frontHtml + data.backHtml;

            }else{
                /** Make Menu Link with Order **/
                if (modeMenuOrder){
                    var libraryNamePool = that.poolByLibraryName[libraryName]
                    libraryNamePool['indexOriginalHtml'] = dataHtml;
                    libraryNamePool['indexReplaceTargetFileName'] = markdownFileName;
                    libraryNamePool['indexReplaceTarget'] = SjMarkdownManager.TAG_REPLACER_AFTER_GENERATING_MENU;
                    dataHtml = libraryNamePool['indexReplaceTarget']; //Custom Tag wiil be replaced

                /** Make Runner **/
                }else if (modeCodeRunner){
                    //- Add Surfix Code
                    // <pre><code  ==>  <pre><code data-code-surfix=...
                    for (var ss=0; ss<surfixAdditionCodeIdList.length; ss++){
                        var id = surfixAdditionCodeIdList[ss];
                        if (dataHtml.indexOf('<pre><code data-code-surfix="') != -1){
                            dataHtml = dataHtml.replace(/<pre><code data-code-surfix="/gi, '<pre><code data-code-surfix="' +id+ ' ');
                        }else{
                            dataHtml = dataHtml.replace(/<pre><code/gi, '<pre><code data-code-surfix="' +id+ '" ');
                        }
                    }

                    //- Add Prefix Code
                    // <pre><code  ==>  <pre><code data-code-prefix=...
                    for (var pp=0; pp<prefixAdditionCodeIdList.length; pp++){
                        var id = prefixAdditionCodeIdList[pp];
                        if (dataHtml.indexOf('<pre><code data-code-prefix="') != -1){
                            dataHtml = dataHtml.replace(/<pre><code data-code-prefix="/gi, '<pre><code data-code-prefix="' +id+ ' ');
                        }else{
                            dataHtml = dataHtml.replace(/<pre><code/gi, '<pre><code data-code-prefix="' +id+ '" ');
                        }
                    }

                    //- Add Custom Runner Mark
                    // <pre><code  ==>  <coderunner><code
                    if (dataHtml.indexOf('<pre><code') != -1){
                        dataHtml = dataHtml.replace(/<pre><code/gi, '<coderunner><code').replace(/<\/code><\/pre>/gi, '</code></coderunner>');
                    }
                }

                //- Remake HTML with Changed dataHtml
                html = data.frontHtml + dataHtml + data.backHtml;
            }

        });

        if (!hasSign)
            break;
    }
    return html;
};

SjMarkdownManager.prototype.extractDataFromHtml = function (html, idStartCheckString, idEndCheckString, contentStartCheckString, contentEndCheckString, callback){
    var startCheckString = idStartCheckString;
    var endCheckString = contentEndCheckString;
    var startIndex = html.indexOf(startCheckString);
    if (startIndex == -1)
        return false
    var endIndex = html.indexOf(endCheckString, startIndex) + endCheckString.length;
    var frontHtml = html.substring(0, startIndex);
    var backHtml = html.substring(endIndex, html.length);
    var croppedHtml = html.substring(startIndex, endIndex);

    //ID Context HTML
    startCheckString = idStartCheckString;
    endCheckString = idEndCheckString;
    startIndex = croppedHtml.indexOf(startCheckString);
    endIndex = croppedHtml.indexOf(endCheckString, startIndex) + endCheckString.length;
    var idContextHtml = croppedHtml.substring(startIndex, endIndex);

    //ID
    startIndex = croppedHtml.indexOf(startCheckString) + startCheckString.length;
    endIndex = croppedHtml.indexOf(endCheckString, startIndex);
    var someIdHtml = croppedHtml.substring(startIndex, endIndex);
    var idByEmTextList = this.findAllInnerTextByTag(someIdHtml, 'em');
    var idByStrongTextList = this.findAllInnerTextByTag(someIdHtml, 'strong');

    //Data Context HTML
    startCheckString = contentStartCheckString;
    endCheckString = contentEndCheckString;
    startIndex = croppedHtml.indexOf(startCheckString);
    endIndex = croppedHtml.length;
    var dataContextHtml = croppedHtml.substring(startIndex, endIndex);

    //Data
    startIndex = croppedHtml.indexOf(startCheckString) + startCheckString.length;
    startIndex = croppedHtml.indexOf('>', startIndex) + 1;
    endIndex = croppedHtml.length - endCheckString.length;
    var data = croppedHtml.substring(startIndex, endIndex);

    var resultData = {
        frontHtml: frontHtml,
        backHtml: backHtml,
        croppedHtml: croppedHtml,
        idHtml: idContextHtml,
        dataHtml: dataContextHtml,
        idByEmTextList: idByEmTextList,
        idByStrongTextList: idByStrongTextList,
        data: data.replace(/\&lt\;/gi, '<').replace(/\&gt\;/gi, '>').replace(/\&quot\;/gi, '"')
    };
    if (callback)
        callback(resultData);
    return true;
};

SjMarkdownManager.prototype.generateMenuDataFromHtmlH1H2 = function (libName, markdownFileName, html){
    var result = {};
    this.extractMenuDataFromHtmlH1H2(html, function(data){
        // result = data.h1TextH2TextListMap;
        var h1TextH2TextListMap = data.h1TextH2TextListMap;
        var h1TextH2IdListMap = data.h1TextH2IdListMap;
        for (var h1Text in h1TextH2TextListMap){
            var h1Path = libName +'/'+ markdownFileName + '.html';
            var h2TextList = h1TextH2TextListMap[h1Text];
            var h2IdList = h1TextH2IdListMap[h1Text];
            var h2PathList = [];
            for (var i=0; i<h2IdList.length; i++){
                var h2Id = h2IdList[i];
                h2PathList.push(h1Path + '#' + h2Id);
            }
            result[h1Text] = {
                path: h1Path,
                h2TextList: h2TextList,
                h2PathList: h2PathList,
            }
        }
    });
    return result;
};

SjMarkdownManager.prototype.extractMenuDataFromHtmlH1H2 = function (html, callback){
    var that = this;
    var h1TextList = [];
    var h1IdList = [];
    var h1IndexList = [];
    var h1TextH2TextListMap = {};
    var h1TextH2IdListMap = {};
    var h1TextH2IndexListMap = {};
    var findStartIndex = 0;
    var findStart2Index = 0;
    var findEndIndex = 0;
    var lastFindEndIndex = 0;

    /** H1 **/
    var findStartString = '<h1';
    var findEndString = '</h1>';
    while (findStartIndex > -1){
        findStartIndex = html.indexOf(findStartString, lastFindEndIndex);
        if (findStartIndex > -1){
            findStart2Index = html.indexOf('>', findStartIndex);
            findEndIndex = html.indexOf(findEndString, findStart2Index);
            lastFindEndIndex = findEndIndex;
            if (findEndIndex > -1  && findStartIndex < findEndIndex){
                var h1Text = html.substring(findStart2Index +1, findEndIndex);
                var h1Id = that.extractIdAttribute( html.substring(findStartIndex, findStart2Index) );
                h1TextList.push(h1Text);
                h1IdList.push(h1Id);
                h1IndexList.push(findStartIndex);
            }
        }
    }

    /** H2 **/
    findStartString = '<h2';
    findEndString = '</h2>';
    for (var i=0; i<h1IndexList.length; i++){
        var h1Text = h1TextList[i];
        var h1Index = h1IndexList[i];
        var validEndIndex = (i == (h1IndexList.length -1)) ? html.length : h1IndexList[i+1];
        var h2TextList = [];
        var h2IdList = [];
        var h2IndexList = [];
        lastFindEndIndex = h1Index;
        while(true){
            findStartIndex = html.indexOf(findStartString, lastFindEndIndex);
            if (findStartIndex > -1 && findStartIndex < validEndIndex){
                findStart2Index = html.indexOf('>', findStartIndex);
                findEndIndex = html.indexOf(findEndString, findStart2Index);
                lastFindEndIndex = findEndIndex;
                if (findEndIndex > -1  && findStartIndex < findEndIndex){
                    var h2Text = html.substring(findStart2Index +1, findEndIndex);
                    var h2Id = that.extractIdAttribute( html.substring(findStartIndex, findStart2Index) );
                    h2TextList.push(h2Text);
                    h2IdList.push(h2Id);
                    h2IndexList.push(findStartIndex);
                }
            }else{
                break;
            }
        }
        h1TextH2TextListMap[h1Text] = h2TextList;
        h1TextH2IdListMap[h1Text] = h2IdList;
        h1TextH2IndexListMap[h1Text] = h2IndexList;
    }

    //
    // console.debug('///// ///// ///// ///// ///// MMMMM');
    // console.debug(h1TextList);
    // console.debug(h1IndexList);
    // console.debug(h1TextH2TextListMap);
    // console.debug(h1TextH2IdListMap);
    // console.debug(h1TextH2IndexListMap);
    var resultData = {
        h1TextList: h1TextList,
        h1IndexList: h1IndexList,
        h1TextH2TextListMap: h1TextH2TextListMap,
        h1TextH2IdListMap: h1TextH2IdListMap,
        h1TextH2IndexListMap: h1TextH2IndexListMap
    };
    if (callback)
        callback(resultData);
    return true;
};

SjMarkdownManager.prototype.extractIdAttribute = function (string){
    var findStartString = ' id="';
    var findEndString = '"';
    var findStartIndex = string.indexOf(findStartString) + findStartString.length;
    var findEndIndex = string.indexOf(findEndString, findStartIndex);
    var value = string.substring(findStartIndex, findEndIndex);
    return value;
}

SjMarkdownManager.prototype.findAllInnerTextByTag = function(idHtml, tagName){
    var resultList = [];
    var findIndex = 0;
    var findTagStart = '<' +tagName+ '>';
    var findTagEnd = '</' +tagName+ '>';
    while(true){
        var startIndex = idHtml.indexOf(findTagStart, findIndex);
        var endIndex = idHtml.indexOf(findTagEnd, findIndex);
        findIndex = endIndex + findTagEnd.length;
        if (startIndex != -1){
            var id = idHtml.substring(startIndex +findTagStart.length, endIndex)
            resultList.push(id);
        }else{
            break;
        }
    }
    return resultList;
};

SjMarkdownManager.prototype.getCodeViewerConvertedToAceEditor = function (html){
    html = html.replace(/<coderunner><code/gi, '<div').replace(/<\/code><\/coderunner>/gi, '</div>');
    return html;
};



SjMarkdownManager.prototype.getPoolByLibraryName = function (){
    return this.poolByLibraryName;
};




/*************************
 * Generating filewatcherPlugin & htmlWebpackPlugin to fully reload
 *************************/
SjMarkdownManager.prototype.generateFilewatcherPluginToReloadFully = function(pathToWriteTempHtmlFile, markdownFileRange){
    var that = this;
    that.writeTempFile(pathToWriteTempHtmlFile);
    /** RELOAD when MD file is modified **/
    var filewatcherPlugin = new FilewatcherPlugin({
        watchFileRegex: (markdownFileRange) ? markdownFileRange : this.markdownFileRange, // Ex) watchFileRegex: ['./src/**/*.md'],
        /** Add Event **/
        onAddCallback: function(path){
            var findIndex = that.tempCheckingNewList.indexOf(path);
            if (findIndex == -1){
                that.tempCheckingNewList.push(path);
                if (that.modeAddAndRemoveEvent){
                    console.log(`File ${path} has been added. But, You need to restart`);
                    that.doAddAndRemoveEvent(pathToWriteTempHtmlFile);
                }
            }
            return null;
        },
        /** Remove Event **/
        onUnlinkCallback: function(path) {
            var findIndex = that.tempCheckingNewList.indexOf(path);
            if (findIndex != -1){
                that.tempCheckingNewList.splice(findIndex, 1);
                if (that.modeAddAndRemoveEvent){
                    console.log(`File ${path} has been removed, But, You need to restart`);
                    that.doAddAndRemoveEvent(pathToWriteTempHtmlFile);
                }
            }
        },
        /** Change Event **/
        onChangeCallback: function(path){
            //Check Calling Count
            ++that.tempAllCallCountForChangeEvent;
            if (++that.tempCallCountForChangeEvent != 1)
                return;
            // console.log('하하하하하 ' + that.tempAllCallCountForChangeEvent);
            that.doChangeEvent(pathToWriteTempHtmlFile);
        },
        /** Done Event **/
        onReadyCallback: function(){
            //AddEvent & UnlinkEvent -
            that.tempAllFileCount = that.tempCheckingNewList.length;
            if (that.lastFileCount != -1 && that.lastFileCount != that.tempAllFileCount){
                console.log('<File is Added or Removed> File Size: ' + that.lastFileCount + ' to ' + that.tempAllFileCount);
            }else{
                console.log('<Nothing to added & removed> File Size: ' + that.tempAllFileCount);
                that.modeAddAndRemoveEvent = true;
            }
            that.lastFileCount = that.tempAllFileCount;

            //ChangeEvent - Reset tempCallCountForChangeEvent (Prevent increasing call)
            that.tempCallCountForChangeEvent =  0;
            console.log('Update done.');
        },
        usePolling: false,
        ignored: '/node_modules/'
    });

    /** RELOAD when MD file is modified **/
    var htmlWebpackPluginToReloadFully = new HtmlWebpackPlugin({
        filename: 'temp_to_full_reload.html',
        template: pathToWriteTempHtmlFile,
    });

    this.filewatcherPluginList.push(filewatcherPlugin);
    this.filewatcherPluginList.push(htmlWebpackPluginToReloadFully);
    return this.filewatcherPluginList;
};

SjMarkdownManager.prototype.doAddAndRemoveEvent = function(pathToWriteTempHtmlFile){
    // this.htmlWebpackPluginList.push(new HtmlWebpackPlugin({
    //     filename: 'test.html',
    //     template: pathToWriteTempHtmlFile,
    // }));
    this.doChangeEvent(pathToWriteTempHtmlFile);
};
SjMarkdownManager.prototype.doChangeEvent = function(pathToWriteTempHtmlFile){
    var that = this;
    //Reload Trigger
    that.writeTempFile(pathToWriteTempHtmlFile);
    //Update inject
    that.updateSjMarkdown();
};
SjMarkdownManager.prototype.writeTempFile = function(pathToWriteTempHtmlFile){
    var tempData = new Date().getTime();
    file.writeFileSync(pathToWriteTempHtmlFile, tempData, 'utf-8');
    console.log('Writing temp file to Fully Reload ==> ' + pathToWriteTempHtmlFile + ' < ' + tempData);
};

SjMarkdownManager.prototype.sortByList = function(param, orderList){
    if (param instanceof Object){
        var resultObject = {};
        for (var i=0; i<orderList.length; i++){
            var orderName = orderList[i];
            if (param[orderName]){
                resultObject[orderName] = param[orderName];
            }
        }
        for (var keyName in param){
            var item = param[keyName];
            if (orderList.indexOf(keyName) != -1){
            }else{
                resultObject[keyName] = item;
            }
        }
        return resultObject;
    }
    return param;
};
