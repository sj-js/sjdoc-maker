const { ready, getEl, newEl, getData  } = require('@sj-js/crossman');
const BoxMan = require('@sj-js/boxman');
const PopMan = require('@sj-js/popman');
const ClipboardJS = require('clipboard');
const hljs = require('highlight.js');
const ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');





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
        //- Header Menu
        var thisLibraryName = that.getLibraryName();
        that.generateHeaderMenu('help-header-menulist', thisLibraryName);
        //- Side Menu
        var thisMenuFileName = that.getMdFileName();
        that.generateMenu('help-menu-menulist', thisMenuFileName);
        //- Tester(Editor/Runner)
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
    var content = this.getTextFromEditorWithPrefixAndSurfix(editor);
    // runnerFrame.contentWindow.document.open('text/htmlreplace');
    runnerFrame.contentWindow.document.open();
    runnerFrame.contentWindow.document.write(content);
    runnerFrame.contentWindow.document.close();
};

TesterConverter.prototype.getTextFromEditorWithPrefixAndSurfix = function(editor){
    return this.getPrefixCode() + this.getTextFromEditor(editor) + this.getSurfixCode();
};

TesterConverter.prototype.getTextFromEditor = function(editor){
    return editor.getValue();
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
    var titleMetaElement = document.getElementsByTagName('title')[0];
    var helpName = titleMetaElement.innerText;
    return helpName;
};
TesterConverter.prototype.getLibraryName = function(){
    var element = document.getElementsByName('libraryName')[0];
    return element.content;
};
TesterConverter.prototype.getMdFileName = function(){
    var element = document.getElementsByName('mdFileName')[0];
    return element.content;
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



TesterConverter.prototype.generateHeaderMenu = function(menuContext, selectedMenu){
    var headerMenuObject = this.getHeaderMenuObject();
    for (var libName in headerMenuObject){
        var headerMenu = headerMenuObject[libName];
        var menuItem = newEl('li').add([
            newEl('a', {href:'../' +libName+ '/index.html'}).html(libName)
        ]);
        if (libName == selectedMenu)
            menuItem.addClass('menu-selected');
        getEl(menuContext).add(menuItem);
    }
};
TesterConverter.prototype.generateMenu = function(menuContext, selectedMenuFileName){
    var menuMap = this.getMenuObject(menuContext);
    for (var menuName in menuMap){
        var h1MenuObject = menuMap[menuName];
        var menuItem = newEl('li').add([
            newEl('a', {href:'../' +h1MenuObject.path}).html(menuName)
        ]);
        if (h1MenuObject.fileName == selectedMenuFileName)
            menuItem.addClass('menu-selected');
        getEl(menuContext).add(menuItem);
    }
};
TesterConverter.prototype.generateEditorAndTester = function(){
    /** Code as Tester **/
    var codeDivs = document.querySelectorAll('div.lang-js, div.lang-html');
    var seqId = 0;
    for (var i=0, codeDiv; i<codeDivs.length; i++){
        codeDiv = codeDivs[i];
        /** Make Runner (iframe) **/
        var runnerFrame = newEl('iframe');
        /** Re-placing **/
        var tester = newEl('div').addClass('tester').appendToFrontOf(codeDiv).add([
            getEl(codeDiv).addClass('editor'),
            newEl('div').addClass('runner').add([
                runnerFrame
            ])
        ]);
        //- Make Tester
        var editor = this.makeEditor(codeDiv, runnerFrame.returnElement());
        this.apply(editor, runnerFrame.returnElement());
        //- Make Tool
        this.makeTool( ('tool-btn-copy-'+(++seqId)), editor, codeDiv );
    }

    /** Code others ... **/
    var preElements = document.querySelectorAll('pre');
    for (var j=0; j<preElements.length; j++){
        var preElement = preElements[j];
        var maybeCodeElement = preElement.children[0];
        if (maybeCodeElement.tagName.toLowerCase() == 'code'){
            getEl(preElement).setStyle('position', 'relative');
            //- Make Tool
            this.makeTool( ('tool-btn-copy-'+(++seqId)), null, preElement );
        }
    }

};

TesterConverter.prototype.makeTool = function(targetElementId, editor, codeContextElement){
    var that = this;
    if (!codeContextElement.extendsPanel){
        //Make Button
        //- Button - Copy
        var buttonCopy = newEl('button').html('').addClass(['icon', 'icon-code-extends', 'icon-copy']);
        // var imagePathForButtonCopy = require('../image/icon-copy.png');
        // buttonCopy.setStyle('background-image', 'url(' +imagePathForButtonCopy+ ')');
        //- Button - Pop
        var buttonPop = newEl('button').html('').addClass(['icon', 'icon-code-extends']).addEventListener('click', function(e){
            that.popman.popTemp({
                exp:'50%',
                add: function(data){
                    getEl(data.element).style('background:white;').add( getEl(codeContextElement).clone(true) );
                }
            });
        });
        //Make Panel
        var extendsPanel = codeContextElement.extendsPanel = newEl('div')
            .attr('id', targetElementId)
            .style('position:absolute; display:none; z-index:1000; text-align:right; width:100%; height:1px;')
            .add([
                buttonCopy,
                // buttonPop
            ])
            .appendToAsFirst(codeContextElement)
            .returnElement();
        //Event
        codeContextElement.addEventListener('mousemove', function(e){
            if (extendsPanel.style.display != 'block')
                extendsPanel.style.display = 'block';
            that.statusMouseover = true;
        });
        codeContextElement.addEventListener('mouseout', function(e){
            extendsPanel.style.display = 'none';
            that.statusMouseover = false;
        });
        buttonCopy.addEventListener("mouseleave", function(e){
            buttonCopy.removeClass(['tooltipped', 'tooltipped-s']);
            buttonCopy.attr('aria-label', null);
        });

        var clipboard = null;
        if (editor){
            clipboard = new ClipboardJS(('#'+targetElementId), {
                text: function(trigger){
                    return that.getTextFromEditorWithPrefixAndSurfix(editor);
                }
            });
        }else{
            clipboard = new ClipboardJS(('#'+targetElementId), {
                text: function(trigger){
                    return codeContextElement.childNodes[1].textContent;
                }
            });
        }
        clipboard.on('success', function(e){
            // e.clearSelection();
            TesterConverter.showTooltip(buttonCopy.returnElement(),'Copied!');
        });
        clipboard.on('error', function(e){
            TesterConverter.showTooltip(buttonCopy.returnElement(), TesterConverter.fallbackMessage(e.action));
        });
    }
};

TesterConverter.showTooltip = function(elem, msg){
    getEl(elem).addClass(['tooltipped', 'tooltipped-s']).attr('aria-label', msg);
};

TesterConverter.fallbackMessage = function(action){
    var actionMsg = '';
    var actionKey = (action === 'cut' ? 'X' : 'C');
    if (/iPhone|iPad/i.test(navigator.userAgent)){
        actionMsg = 'No support :(';
    }else if (/Mac/i.test(navigator.userAgent)){
        actionMsg = 'Press ⌘-'+ actionKey+' to '+ action;
    }else{
        actionMsg = 'Press Ctrl-'+ actionKey+' to '+ action;
    }
    return actionMsg;
};