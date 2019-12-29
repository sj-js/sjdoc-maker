var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');

const hljs = require('highlight.js');

var CrossMan = require('../lib/sj-js/crossman.js');
var BoxMan = require('../lib/sj-js/boxman.js');
var PopMan = require('../lib/sj-js/popman.js');



/***************************************************************************
 *
 * TesterConverter
 *
 ***************************************************************************/
function TesterConverter(){
    this.pool = {};
    this.boxman;
    this.popman;
}

/*************************
 * Exports
 *************************/
try {
    module.exports = exports = TesterConverter;
} catch (e) {}

/*************************
 * Init
 *************************/
TesterConverter.prototype.init = function(){
    var that = this;
    that.setPool( that.getSaveObject() );

    window.addEventListener('resize', function(){
        that.resize();
    });

    ready(function(){
        that.runHighlight();
        that.generateHeaderMenu('help-header-menulist');
        that.generateMenu('help-menu-menulist');
        that.generateEditorAndTester();
        that.resize();

        that.boxman = new BoxMan({modeOnlyBoxToBox:true, modeTouch:true});
        that.popman = new PopMan();
        that.popman.new({
            id: 'mobile-pop-menu',
            exp: '70%/60%',
            pop: function(data){
                getEl(data.element).add([ getEl('help-menu-context') ]);
            },
            close: function(data){
                getEl('help-menu').add([ getEl('help-menu-context') ]);
            }
        });
        getEl('mini-menu-button').addEventListener('click', function(){
            that.popman.pop('mobile-pop-menu');
        });
    });
};

TesterConverter.prototype.resize = function(){
    if (850 < window.innerWidth){
        getEl('help-menu').setStyle('display', 'block');
        getEl('mini-menu-button').setStyle('display', 'none');
    }else{
        getEl('help-menu').setStyle('display', 'none');
        getEl('mini-menu-button').setStyle('display', 'block');
    }
    if (this.boxman)
        this.boxman.resize();
    if (this.popman)
        this.popman.resize();
}


/*************************
 * Make Editor
 *************************/
TesterConverter.prototype.makeEditor = function(editorElement, runnerFrame){
    var that = this;
    var editor = ace.edit(editorElement);
    editor.setOptions({
        minLines: 15,
        maxLines: 50,
        // maxLines: Infinity,
    });
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/javascript');
    /** Make Event **/
    editor.getSession().on('change', function(e){
        that.apply(editor, runnerFrame);
    });
    return editor;
};

/*************************
 * Apply Code from Editor to Iframe
 *************************/
TesterConverter.prototype.apply = function(editor, runnerFrame){
    var contentFromEditor = editor.getValue();
    var content = this.getPrefixCode() + contentFromEditor + this.getSurfixCode();
    // runnerFrame.contentWindow.document.open('text/htmlreplace');
    runnerFrame.contentWindow.document.open();
    runnerFrame.contentWindow.document.write(content);
    runnerFrame.contentWindow.document.close();
};

/*************************
 * Highlight
 *************************/
TesterConverter.prototype.runHighlight = function(){
    hljs.initHighlightingOnLoad();
};



TesterConverter.prototype.getPool = function(){
    return this.pool;
};
TesterConverter.prototype.setPool = function(datas){
    this.pool = datas;
};
TesterConverter.prototype.setPoolData = function(id, data){
    this.pool[id] = data;
};
TesterConverter.prototype.getPoolData = function(id){
    return this.pool[id];
};
TesterConverter.prototype.getPrefixCode = function(){
    var content = this.getPoolData('prefix');;
    if (content !== undefined && content !== null && content !== '')
        return content;
    return '';
};
TesterConverter.prototype.getSurfixCode = function(){
    var content = this.getPoolData('surfix');;
    if (content !== undefined && content !== null && content !== '')
        return content;
    return '';
};








//Setup pages hiding data pool
TesterConverter.prototype.getNameFromTitle = function(){
    var title = document.getElementsByTagName('title')[0];
    var helpName = title.innerText;
    return helpName;
};
TesterConverter.prototype.getLibraryName = function(){
    return this.parseMetaContentByName('libraryName');
};
TesterConverter.prototype.getMdFileName = function(){
    return this.parseMetaContentByName('mdFileName');
};
TesterConverter.prototype.getHeaderMenuObject = function(){
    return this.parseMetaContentByName('headerMenuJson');
};
TesterConverter.prototype.getMenuObject = function(){
    return this.parseMetaContentByName('menuJson');
};
TesterConverter.prototype.getSaveObject = function(){
    var a = this.parseMetaContentByName('saveJson');
    return a ? a : {};
};
TesterConverter.prototype.parseMetaContentByName = function(name){
    var result;
    var elements = document.getElementsByName(name);
    if (elements.length == 0)
        return result;
    var content = elements[0].content;
    try{
        if (content !== undefined && content !== null && content !== '')
            result = JSON.parse(content);
    }catch(e){
        throw e;
    }
    return result;
};



TesterConverter.prototype.generateHeaderMenu = function(menuContext){
    var headerMenuObject = this.getHeaderMenuObject();
    for (var libName in headerMenuObject){
        var headerMenu = headerMenuObject[libName];
        getEl(menuContext).add([
            newEl('li').add([
                newEl('a', {href:'../' +libName+ '/README.html'}).html(libName)
            ])
        ]);
    }
};
TesterConverter.prototype.generateMenu = function(menuContext){
    var menuMap = this.getMenuObject(menuContext);
    for (var menuName in menuMap){
        var h1MenuObject = menuMap[menuName];
        getEl(menuContext).add([
            newEl('li').add([
                newEl('a', {href:'../' +h1MenuObject.path}).html(menuName)
            ])
        ]);
    }
};
TesterConverter.prototype.generateEditorAndTester = function(){
    var codeDivs = document.querySelectorAll('div.lang-js, div.lang-html');
    for (var i=0, coderDiv; i<codeDivs.length; i++){
        coderDiv = codeDivs[i];
        var runnerFrame = newEl('iframe');
        /** Re-placing **/
        newEl('div').addClass('tester').appendToFrontOf(coderDiv).add([
            getEl(coderDiv).addClass('editor'),
            newEl('div').addClass('runner').add([
                runnerFrame
            ])
        ]);
        /** Make Tester **/
        var editor = this.makeEditor(coderDiv, runnerFrame.returnElement());
        this.apply(editor, runnerFrame.returnElement());
    }
};
