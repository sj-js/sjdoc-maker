/****************************************************************************************************
 *  PopMan
 *  Created By sujkim
 ****************************************************************************************************/
function PopMan(options){
    var that = this;
    this.event = new SjEvent();

    this.popMap = {};
    this.popElementIdMap = {};
    this.darkElementList = [];
    this.popElementStackList = [];
    this.focusDarkMap = {};
    this.lastPopIndex = 0;
    this.divCamSizeChecker;

    this.previewer;

    /** Status **/
    this.meta = {
        nowEscControlPop: null,
        nowEnterControlPop: null,
        nowClickControlPop: null,
    };
    /** Mode **/
    this.modeAnimation = true;
    this.modeSleep = false;
    this.globalSetup = {
        modeTest: false,
        modeResize: true,
        modeDark: true,
        testPopClass: null,
        testPopBorderWidth: '1px',
        testPopBorderColor: '#39ff3e',
        testPopBackground: '#c0ffc9',
        alertExp: null,
        alertExpx: '300',
        alertExpy: '200',
        alertContent: null,
        confirmExp: null,
        confirmExpx: '400',
        confirmExpy: '300',
        confirmContent: null,
        loadingExp: null,
        loadingExpx: '200',
        loadingExpy: '200',
        loadingContent: null,
    };
    if (options)
        this.setup(options);

    //Close Pop By Key [ESC]
    // getEl(document).addEventListener('keydown', function(event){
    document.addEventListener('keydown', function(event){
        var keyCode = (event.keyCode) ? event.keyCode : event.which;
        if (keyCode == 27){ //[ESC] => Close - Latest Index Pop
            var latestIndex = that.popElementStackList.length -1;
            var lastestIndexPopElement = that.popElementStackList[latestIndex];
            var lastestIndexPop = that.getPop(lastestIndexPopElement);
            // console.log(latestIndex, lastestIndexPopElement, lastestIndexPop, that.popElementStackList);
            if (lastestIndexPop && lastestIndexPop.closebyesc)
                that.meta.nowEscControlPop = lastestIndexPop;
        }
        if (keyCode == 13){ //[ENTER] => OK - Latest Index Pop
            var latestIndex = that.popElementStackList.length -1;
            var lastestIndexPopElement = that.popElementStackList[latestIndex];
            var lastestIndexPop = that.getPop(lastestIndexPopElement);
            // console.log(latestIndex, lastestIndexPopElement, lastestIndexPop, that.popElementStackList);
            if (lastestIndexPop && lastestIndexPop.okbyenter)
                that.meta.nowEnterControlPop = lastestIndexPop;
        }
    });

    document.addEventListener('keyup', function(event){
        var keyCode = (event.keyCode) ? event.keyCode : event.which;
        if (keyCode == 27){ //[ESC] => Close - Latest Index Pop
            var latestIndex = that.popElementStackList.length -1;
            var lastestIndexPopElement = that.popElementStackList[latestIndex];
            var lastestIndexPop = that.getPop(lastestIndexPopElement);
            // console.log(latestIndex, lastestIndexPopElement, lastestIndexPop, that.popElementStackList);
            if (lastestIndexPop && lastestIndexPop.closebyesc && that.meta.nowEscControlPop === lastestIndexPop){
                that.meta.nowEscControlPop = null;
                that.close(lastestIndexPop.element);
            }
        }
        if (keyCode == 13){ //[ENTER] => OK - Latest Index Pop
            var latestIndex = that.popElementStackList.length -1;
            var lastestIndexPopElement = that.popElementStackList[latestIndex];
            var lastestIndexPop = that.getPop(lastestIndexPopElement);
            // console.log(latestIndex, lastestIndexPopElement, lastestIndexPop, that.popElementStackList);
            if (lastestIndexPop && lastestIndexPop.okbyenter && that.meta.nowEnterControlPop === lastestIndexPop){
                that.meta.nowEnterControlPop = null;
                var result = that.ok(lastestIndexPop.element);
                if (result)
                    that.close(lastestIndexPop.element);
            }

        }
    });



    if (this.globalSetup.modeResize){
        window.addEventListener('resize', function(){
            that.resize();
        });
    }

    ready(function(){
        that.resize();
    });
}



/*************************
 * Exports
 *************************/
try{
    module.exports = exports = PopMan;
}catch(e){}




PopMan.prototype.setup = function(options){
    for (var objName in options){
        this.globalSetup[objName] = options[objName];
    }
    return this;
};


/*************************
 *
 * DETECT DOM SETUPED WITH POPMAN OPTION
 *
 *************************/
PopMan.prototype.detect = function(afterDetectFunc){
    var that = this;
    ready(function(){
    // getEl().ready(function(){
        var setupedElementList;
        /** 객체탐지 적용(팝창) **/
        setupedElementList = document.querySelectorAll('[data-pop]');
        for (var j=0; j<setupedElementList.length; j++){
            that.add(setupedElementList[j]);
        }
        /** 객체탐지 적용(미리볼 수 있는 객체) **/
        setupedElementList = document.querySelectorAll('[data-preview]');
        for (var j=0; j<setupedElementList.length; j++){
            that.addPreview(setupedElementList[j]);
        }
        /** Run Function After Detect **/
        if (afterDetectFunc)
            afterDetectFunc(that);
        if (that.hasEventListenerByEventName('afterdetect'))
            that.execEventListenerByEventName('afterdetect');
    });
    return this;
};
PopMan.prototype.afterDetect = function(func){
    this.addEventListenerByEventName('afterdetect', func);
    return this;
};
PopMan.prototype.beforeFirstPop = function(func){
    this.addEventListenerByEventName('beforefirstpop', func);
    return this;
};
PopMan.prototype.afterLastPop = function(func){
    this.addEventListenerByEventName('afterlastpop', func);
    return this;
};


/*************************
 * EVENT - RESIZE
 *************************/
PopMan.prototype.resize = function(){
    var that = this;
    for (var popmanId in that.popMap){
        var pop = that.getPopByManId(popmanId);
        if (that.isOn(pop.element))
            that.adjustPosition(pop.element);
    }
    // console.log('[POPMAN] RESIZE>>  resize event!');
};




/*************************
 *
 * EVENT
 *
 *************************/
PopMan.prototype.addEventListener               = function(element, eventName, eventFunc){ this.event.addEventListener(element, eventName, eventFunc); return this; };
PopMan.prototype.addEventListenerByEventName    = function(eventName, eventFunc){ this.event.addEventListenerByEventName(eventName, eventFunc); return this; };
PopMan.prototype.hasEventListener               = function(element, eventName, eventFunc){ return this.event.hasEventListener(element, eventName, eventFunc); };
PopMan.prototype.hasEventListenerByEventName    = function(eventName, eventFunc){ return this.event.hasEventListenerByEventName(eventName, eventFunc); };
PopMan.prototype.hasEventListenerByEventFunc    = function(eventFunc){ return this.event.hasEventListenerByEventFunc(eventFunc); };
PopMan.prototype.removeEventListener            = function(element, eventName, eventFunc){ return this.event.removeEventListener(element, eventName, eventFunc); };
PopMan.prototype.removeEventListenerByEventName = function(eventName, eventFunc){ return this.event.removeEventListenerByEventName(eventName, eventFunc); };
PopMan.prototype.removeEventListenerByEventFunc = function(eventFunc){ return this.event.removeEventListenerByEventFunc(eventFunc); };
PopMan.prototype.execEventListener              = function(element, eventName, event){ return this.event.execEventListener(element, eventName, event); };
PopMan.prototype.execEventListenerByEventName   = function(eventName, event){ return this.event.execEventListenerByEventName(eventName, event); };





/***************************************************************************
 *
 *  POP
 *
 ***************************************************************************/
PopMan.prototype.add = function(element){
    //ElEMENT 속성에 data-pop이 없으면 자동 추가
    if (element.getAttribute('data-pop') == null || element.getAttribute('data-pop') == undefined)
        element.setAttribute('data-pop', '');

    //ElEMENT 속성만 있고 값은 명시안할 경우 자동 명시
    if (element.getAttribute('data-closebyclickin') != null && element.getAttribute('data-closebyclickin') != undefined && element.getAttribute('data-closebyclickin') == '')
        element.setAttribute('data-closebyclickin', 'true');
    if (element.getAttribute('data-closebyclickout') != null && element.getAttribute('data-closebyclickout') != undefined && element.getAttribute('data-closebyclickout') == '')
        element.setAttribute('data-closebyclickout', 'true');
    if (element.getAttribute('data-closebyesc') != null && element.getAttribute('data-closebyesc') != undefined && element.getAttribute('data-closebyesc') == '')
        element.setAttribute('data-closebyesc', 'true');
    if (element.getAttribute('data-enterok') != null && element.getAttribute('data-enterok') != undefined && element.getAttribute('data-enterok') == '')
        element.setAttribute('data-enterok', 'true');

    this.set(element, {
        element:            element,
        exp:                element.getAttribute('data-exp'),
        expx:               element.getAttribute('data-expx'),
        expy:               element.getAttribute('data-expy'),
        modeDark:           getData(element.getAttribute('data-mode-dark')).parse(),
        okbyenter:          getData(element.getAttribute('data-enterok')).parse(),
        closebyesc:         getData(element.getAttribute('data-closebyesc')).parse(),
        closebyclickout:    getData(element.getAttribute('data-closebyclickout')).parse(),
        closebyclickin:     getData(element.getAttribute('data-closebyclickin')).parse(),
        add:                element.getAttribute('data-add'),
        pop:                element.getAttribute('data-pop'),
        afterpop:           element.getAttribute('data-afterpop'),
        close:              element.getAttribute('data-close'),
        afterclose:         element.getAttribute('data-afterclose'),
    });
    return element;
};
PopMan.prototype.new = function(infoObj){
    var newElement = newEl('div').attr('data-pop', 'true').returnElement();
    this.set(newElement, infoObj);
    return newElement;
};
PopMan.prototype.set = function(element, infoObj){
    var that = this;
    var popMap = this.popMap;
    element = getEl(element).returnElement();
    infoObj = (infoObj) ? infoObj : {};

    //이중적용 방지
    if (element.isAdaptedBox){
        return false;
    }else{
        element.isAdaptedBox = true;
        getEl(element).clas.add('sj-obj-box');
    }

    //MAN ID 적용
    var popmanId;
    var id = (infoObj.id) ? infoObj.id : element.id;
    if (id != null && id != "" && id !== undefined){
        popmanId = id;
        element.id = id;
        element.popmanId = id;
    }else{
        popmanId = (infoObj.popmanId) ? infoObj.popmanId : getEl(popMap).getNewSeqId('popmanId');
        element.id = popmanId;
        element.popmanId = popmanId;
    }

    infoObj.id = popmanId;
    infoObj.popmanId = popmanId;
    infoObj.element = element;
    infoObj.modeDark = (infoObj.modeDark == null) ? that.globalSetup.modeDark : infoObj.modeDark;
    infoObj.darkElement = null;
    infoObj.isPoped = false;

    if (infoObj.closebyclickin == undefined || infoObj.closebyclickin == null)
        infoObj.closebyclickin = false;

    if (infoObj.closebyclickout == undefined || infoObj.closebyclickout == null)
        infoObj.closebyclickout = true;

    if (infoObj.closebyesc == undefined || infoObj.closebyesc == null)
        infoObj.closebyesc = true;
    if (infoObj.okbyenter == undefined || infoObj.okbyenter == null)
        infoObj.okbyenter = true;

    //Set View
    infoObj.popContainerElement = this.setView(infoObj);
    this.setTestView(infoObj, that.globalSetup);

    //표현식이 숫자면 ==> 문자열로 변경
    if (typeof infoObj.exp == 'number')
        infoObj.exp = (''+ infoObj.exp);
    if (typeof infoObj.expx == 'number')
        infoObj.expx = (''+ infoObj.expx);
    if (typeof infoObj.expy == 'number')
        infoObj.expy = (''+ infoObj.expy);

    //컬렉션에 저장
    this.popMap[popmanId] = infoObj;
    this.popElementIdMap[element.id] = infoObj;

    //EVENT
    if (infoObj.pop)
        this.addEventListener(element, 'pop', infoObj.pop);
    if (infoObj.afterpop)
        this.addEventListener(element, 'afterpop', infoObj.afterpop);
    if (infoObj.add){
        if (infoObj.add instanceof Function){
            this.addEventListener(element, 'add', infoObj.add);
            infoObj.add(infoObj);
        }else if (typeof infoObj.add == 'string'){
            element.innerHTML = infoObj.add;
        }
    }
    if (infoObj.ok)
        this.addEventListener(element, 'ok', infoObj.ok);
    if (infoObj.close)
        this.addEventListener(element, 'close', infoObj.close);
    if (infoObj.afterclose)
        this.addEventListener(element, 'afterclose', infoObj.afterclose);
};

PopMan.prototype.setView = function(infoObj){
    var that = this;
    var popView = newEl('div')
        .style('display:inline-block; overflow:auto;')
        .setStyle('width', (infoObj.width) ? infoObj.width : '100%')
        .setStyle('height', (infoObj.height) ? infoObj.height : '100%')
        .hideDiv()
        .appendTo(document.body)
        .addEventListener('mousewheel', function(event){
            var scrollSizeX = (popView.scrollWidth - popView.clientWidth);
            var scrollSizeY = (popView.scrollHeight - popView.clientHeight);
            var x = (event.deltaX ? event.deltaX : event.wheelDeltaX) /5;
            var y = (event.deltaY ? event.deltaY : event.wheelDeltaY) /5;
            if (y < 0){
                if (0 >= popView.scrollTop){
                    event.preventDefault();
                    event.stopPropagation();
                }
            }else if (y > 0){
                if (scrollSizeY <= popView.scrollTop){
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
            if (x < 0){
                if (0 >= popView.scrollLeft){
                    event.preventDefault();
                    event.stopPropagation();
                }
            }else if (x > 0){
                if (scrollSizeX <= popView.scrollLeft){
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        })
        .returnElement();

    // popView - Event
    if (infoObj.closebyclickin){
        getEl(popView).addEventListener('click', function(event){
            event.preventDefault();
            event.stopPropagation();
            that.close(infoObj.element);
        });
    }else{
        getEl(popView)
            .addEventListener('click', function(event){
                // event.preventDefault();
                // event.stopPropagation();
            })
            .addEventListener('mousedown', function(event){
                // event.preventDefault();
                // event.stopPropagation();
            });
    }

    // popView <- Some Dom
    var element = infoObj.element;
    if (typeof element == 'function'){
        element = element(infoObj);
    }else if (typeof element == 'object'){
        element = element;
    }
    getEl(popView).add(
        getEl(element).setStyle('display', 'block').setStyle('width', '100%').setStyle('height', '100%')
    );

    if (infoObj.content){
        getEl(element).html(infoObj.content);
    }
    return popView;
};
PopMan.prototype.setTestView = function(infoObj, globalSetup){
    var element = infoObj.element;
    if (globalSetup.modeTest){
        if (globalSetup.testPopClass){
            getEl(element).addClass(globalSetup.testPopClass);
        }
        if (globalSetup.testPopBorderWidth){
            element.style.borderWidth = globalSetup.testPopBorderWidth;
        }
        if (globalSetup.testPopBorderColor){
            element.style.borderColor = globalSetup.testPopBorderColor;
        }
        if (globalSetup.testPopBackground){
            element.style.background = globalSetup.testPopBackground;
        }
    }
};



PopMan.prototype.removePop = function(element){
    var pop = this.getPop(element);
    element = pop.element;
    delete this.popMap[pop.id];
    delete this.popElementIdMap[pop.id];
    this.removeEventListener(element, 'pop');
    this.removeEventListener(element, 'afterpop');
    this.removeEventListener(element, 'add');
    this.removeEventListener(element, 'close');
    this.removeEventListener(element, 'afterclose');
    this.removeEventListener(element, 'ok');
};


PopMan.prototype.getPop = function(element){
    if (typeof element == 'string'){
        return this.getPopById(element);
    }else if (element instanceof Element){
        return this.getPopByEl(element);
    }else{
        var resultList = this.getPopsByCondition(element);
        if (resultList != null && resultList.length > 0)
            return resultList[0];
    }
    return;
};
PopMan.prototype.getPopById = function(id){
    return this.popElementIdMap[id];
};
PopMan.prototype.getPopByEl = function(el){
    var popMap = this.popMap;
    if (el && el.popmanId){
        var popmanId = el.popmanId;
        var popInfo = popMap[popmanId];
        return popInfo;
    }
};
PopMan.prototype.getPopByManId = function(manid){
    return this.popMap[manid];
};
PopMan.prototype.getPops = function(){
    return this.popMap;
};
PopMan.prototype.getPopsByCondition = function(condition){
    var resultList = [];
    var popMap = this.popMap;
    for (var popmanId in popMap){
        var popInfo = popMap[popmanId];
        var result = getEl(popInfo).find(condition);
        if (result)
            resultList.push(result);
    }
    return resultList;
};
PopMan.prototype.getPopsByDomAttributeCondition = function(condition){
    var resultList = [];
    var popMap = this.popMap;
    for (var popmanId in popMap){
        var popInfo = popMap[popmanId];
        var el = popInfo.element;
        var result = getEl(el).findDomAttribute(condition);
        if (result)
            resultList.push(result);
    }
    return resultList;
};


PopMan.prototype.has = function(element){
    var pop = this.getPop(element);
    return !!pop;
};

PopMan.prototype.isOn = function(element){
    var pop = this.getPop(element);
    return pop && pop.isPoped;
};

PopMan.prototype.toggle = function(element){
    (this.isOn(element)) ? this.close(element) : this.pop(element);
};

PopMan.prototype.pop = function(element, callback, force){
    if (this.modeSleep && !force)
        return false;

    var that = this;
    var pop = this.getPop(element);
    var userSetPopElement = element = pop.element;
    userSetPopElement.popIndex = (++this.lastPopIndex);
    userSetPopElement.setAttribute('data-pop-index', userSetPopElement.popIndex);
    //When pop is closed
    if (!pop.isPoped){
        if (this.hasEventListener(userSetPopElement, 'pop'))
            this.execEventListener(userSetPopElement, 'pop', pop);
        if (pop.modeDark){
            pop.darkElement = this.spreadDark(pop);
            this.pushStack(userSetPopElement);
        }
        //pop.popContainerElement은 경우에 따라서 adjustPostion 메소드 안에서 darkElement안으로 들어감.
        getEl(pop.popContainerElement).appendTo(document.body);
        this.adjustPosition(userSetPopElement);
        pop.isPoped = true;
        if (this.hasEventListener(userSetPopElement, 'afterpop'))
            this.execEventListener(userSetPopElement, 'afterpop', pop);
    }
    if (callback)
        callback(pop);
    //Animation - FadeIn
    if (this.modeAnimation && pop.modeAnimation){
        pop.animation = (pop.animation) ? pop.animation : this.generateDefaultAnimation(pop);
        pop.animation.fadeIn(function(){
            // getEl(pop.popContainerElement).setStyle('borderColor', 'red');
        });
    }
    return pop;
};

PopMan.prototype.popIfOff = function(element, callback, force){
    if (this.isOn(element))
        return;
    return this.pop(element, callback, force);
};

PopMan.prototype.popTemp = function(infoObj){
    return this.pop(this.add(this.new(infoObj)));
};



PopMan.prototype.ok = function(element, callback){
    var result = false;
    var pop = this.getPop(element);
    element = pop.element;
    if (pop.isPoped){
        if (this.hasEventListener(element, 'ok'))
            result = this.execEventListener(element, 'ok', pop);
    }
    return result;
};
PopMan.prototype.close = function(element, callback){
    var pop = this.getPop(element);
    if (!pop)
        return;
    var that = this;
    element = pop.element;
    if (pop.isPoped){
        //Animation - FadeOut
        if (pop.animation && !pop.animation.checkStatusFadeOutComplete()){
            pop.animation.fadeOut(function(){
                that.close(element, callback);
            });
            return;
        }
        //Close
        if (this.hasEventListener(element, 'close'))
            this.execEventListener(element, 'close', pop);
        getEl(pop.popContainerElement.parentNode).del(pop.popContainerElement);
        //Close DarkElement
        if (pop.modeDark)
            this.closeDark(pop.darkElement);
        //Close Status
        pop.isPoped = false;
        if (this.hasEventListener(element, 'afterclose'))
            this.execEventListener(element, 'afterclose', pop);
        this.removeStack(pop.element);
        if (callback)
            callback(pop.element);
    }
};



PopMan.prototype.sleep = function(){
    this.modeSleep = true;
};
PopMan.prototype.active = function(){
    this.modeSleep = false;
};





PopMan.prototype.generateDefaultAnimation = function(pop){
    var animation = new AnimationMan().setTime(300)
        .addEventListenerByEventName('fadeinstart', function(rate){
            animation.customData = {
                borderColor: getEl(pop.popContainerElement).getStyle('borderColor')
            };
        })
        .addEventListenerByEventName('fadeoutstart', function(rate){
            getEl(pop.popContainerElement).setStyle('borderColor', animation.customData.borderColor);
        })
        .addEventListenerByEventName('fadeinout', function(rate){
            getEl(pop.popContainerElement).setStyle('opacity', 0.85 *rate);
        });
    return animation;
};

PopMan.prototype.generateDefaultPreviewAnimation = function(previewer){
    var animation = new AnimationMan().setTime(300)
        .addEventListenerByEventName('fadeinstart', function(rate){
            animation.customData = {
                borderColor: getEl(previewer).getStyle('borderColor')
            };
        })
        .addEventListenerByEventName('fadeoutstart', function(rate){
            getEl(previewer).setStyle('borderColor', animation.customData.borderColor);
        })
        .addEventListenerByEventName('fadeinout', function(rate){
            getEl(previewer).setStyle('opacity', 0.85 *rate);
        });
    return animation;
};




/**************************************************
 * Temporary New Pop Instance to Confirm  (like alert('hello?');)
 * @param callbackForOk
 * @param callbackForCancel
 **************************************************/
PopMan.prototype.alert = function(content, callbackForOk){
    var that = this;
    var elementForPopAlert = this.new({
        exp: that.globalSetup.alertExp,
        expx: that.globalSetup.alertExpx,
        expy: that.globalSetup.alertExpy,
        closebyclickout:true,
        closebyesc:true,
        pop: function(data){
        },
        add:function(data){
            var popElement = data.element;

            if (!content && that.globalSetup.alertContent)
                content = that.globalSetup.alertContent;

            data.okbyenter = true;
            that.addEventListener(data.element, 'ok', function(pop){
                if (callbackForOk && !callbackForOk(pop))
                    return false;
                return true;
            });
            var divContextAlert = newEl('div').addClass('sj-popman-obj-context-alert')
                .style('display:block; width:100%; height:100%; text-align:center;')
                .returnElement();
            var divContentBox = newEl('div').addClass('sj-popman-obj-box-content')
                .style('display:block; width:100%; text-align:center;')
                .appendTo(divContextAlert)
                .returnElement();
            var btnForOk = newEl('button').addClass('sj-popman-obj-btn-alert')
                .style('display:inline-block;')
                .appendTo(divContextAlert)
                .html('O')
                .addEventListener('click', function(){
                    if (callbackForOk && !callbackForOk())
                        return;
                    that.close(popElement);
                })
                .returnElement();
            //User Set Content
            getEl(popElement).html('').add(divContextAlert);
            getEl(divContentBox).add(content);
        },
        afterpop:function(data){
        },
        close:function(data){
        },
        afterclose:function(data){
            that.removePop(data.element);
        }
    });
    this.add(elementForPopAlert);
    this.pop(elementForPopAlert, null, true);
    return elementForPopAlert;
};

/**************************************************
 * Temporary New Pop Instance to Confirm  (like confirm('hello?');)
 * @param callbackForOk
 * @param callbackForCancel
 **************************************************/
PopMan.prototype.confirm = function(content, callbackForOk, callbackForCancel){
    var that = this;
    var elementForPopConfirm = this.new({
        exp: that.globalSetup.confirmExp,
        expx: that.globalSetup.confirmExpx,
        expy: that.globalSetup.confirmExpy,
        closebyclickout:true,
        closebyesc:true,
        pop: function(data){
        },
        add:function(data){
            var popElement = data.element;

            if (!content && that.globalSetup.confirmContent)
                content = that.globalSetup.confirmContent;

            data.okbyenter = true;
            that.addEventListener(data.element, 'ok', function(pop){
                if (callbackForOk && !callbackForOk(pop))
                    return false;
                return true;
            });
            var divContextConfirm = newEl('div').addClass('sj-popman-obj-context-confirm')
                .style('display:block; width:100%; height:100%; text-align:center;')
                .returnElement();
            var divContentBox = newEl('div').addClass('sj-popman-obj-box-content')
                .style('display:block; width:100%; text-align:center;')
                .appendTo(divContextConfirm)
                .returnElement();
            var btnForOk = newEl('button').addClass('sj-popman-obj-btn-confirm')
                .style('display:inline-block;')
                .html('O')
                .appendTo(divContextConfirm)
                .addEventListener('click', function(){
                    if (callbackForOk && !callbackForOk())
                        return;
                    that.close(popElement);
                })
                .returnElement();
            var btnForCancel = newEl('button').addClass('sj-popman-obj-btn-cancel')
                .style('display:inline-block;')
                .html('X')
                .appendTo(divContextConfirm)
                .addEventListener('click', function(){
                    if (callbackForCancel && !callbackForCancel())
                        return;
                    that.close(popElement);
                })
                .returnElement();
            //User Set Content
            getEl(popElement).html('').add(divContextConfirm);
            getEl(divContentBox).add(content);
        },
        afterpop:function(data){
        },
        close:function(data){
        },
        afterclose:function(data){
            that.removePop(data.element);
        }
    });
    this.add(elementForPopConfirm);
    this.pop(elementForPopConfirm, null, true);
    return elementForPopConfirm;
};

/**************************************************
 * Temporary New Pop Instance to Confirm  (like alert('hello?');)
 * @param callbackForOk
 * @param callbackForCancel
 **************************************************/
PopMan.prototype.loading = function(content, callbackForPromise){
    var that = this;
    var elementForPopLoading = this.new({
        exp: that.globalSetup.loadingExp,
        expx: that.globalSetup.loadingExpx,
        expy: that.globalSetup.loadingExpy,
        // content: that.globalSetup.loadingContent,
        closebyclickout:false,
        closebyesc:false,
        pop: function(data){
        },
        add:function(data){
            var popElement = data.element;

            if (!content && that.globalSetup.loadingContent)
                content = that.globalSetup.loadingContent;

            //User Set Content
            if (content){
                getEl(popElement.parentNode)
                    .removeClass('sj-popman-obj-context-pop')
                    .addClass('sj-popman-obj-context-loading');
                var divContentBox = newEl('div')
                    .addClass('sj-popman-obj-box-content')
                    .style('display:block; width:100%; height:100%; text-align:center')
                    .add(content)
                    .returnElement();
                getEl(popElement).html('').add(divContentBox);
            }
        },
        afterpop:function(data){
        },
        close:function(data){
        },
        afterclose:function(data){
            that.removePop(data.element);
        }
    });
    this.add(elementForPopLoading);
    this.pop(elementForPopLoading, null, true);
    var promise = new Promise(function(resolve, reject){
        callbackForPromise(resolve, reject);
    }).then(function(value){
        that.close(elementForPopLoading);
    }).catch(function(error){
        alert(error);
        that.close(elementForPopLoading);
    });
    return promise;
};





/***************************************************************************
 *
 *  Preview
 *
 ***************************************************************************/
PopMan.prototype.addPreview = function(element){
    var that = this;
    this.setPreview(element, {
        content: element.getAttribute('data-preview')
    });
};
PopMan.prototype.setPreview = function(element, infoObj){
    var that = this;

    // /* 설명상자 생성 */
    // this.createPreviewer();

    getEl(element)
        .addClass('sj-boxman-obj-previewable')
        .addEventListener('mouseout', function(event){
            that.stopPreviewer();
        })
        .addEventListener('mouseover', function(event){
            that.startPreviewer(event, 12, 2, infoObj.content);
        })
        .addEventListener('mousemove', function(event){
            var checkNode;
            /* Mobile Control */
            if (event.touches != undefined){
                // if (timerTime >= 3)
                //     event.preventDefault();
                // checkNode = event.touches[0].target;
            }else{
                /* Web Control */
                event.preventDefault();
                //- Searching ParentNode
                checkNode = event.target;
                while ((!checkNode.classList || !checkNode.classList.contains('sj-boxman-obj-previewable')) && (checkNode = checkNode.parentNode)){ }
                if (!checkNode)
                    return;
            }
            that.movePreviewer(event,12, 2, infoObj.content);
        });
};


PopMan.prototype.createPreviewer = function(){
    if (this.previewer == undefined){
        this.previewer = newEl('div')
            .html('test')
            .addClass('sj-boxman-obj-previewer')
            .setStyle('display', 'none')
            .setStyle('position', 'absolute')
            .appendTo(document.body)
            .returnElement();
    }
    return this.previewer;
};
PopMan.prototype.startPreviewer = function(event, x, y, content, classes){
    //Start
    this.previewer = this.createPreviewer();
    getEl(this.previewer)
        .setStyle('display', 'block')
        .setStyle('zIndex', getData().findHighestZIndex(['div']) + 1)
        .setStyle('left', '-5555px')
        .setStyle('top', '-5555px');
    if (classes)
        getEl(this.previewer).addClass(classes);
    this.movePreviewer(event, x, y, content);
    //Animation - FadeIn
    if (this.modeAnimation){
        this.previewerAnimation = (this.previewerAnimation) ? this.previewerAnimation : this.generateDefaultPreviewAnimation(this.previewer);
        this.previewerAnimation.fadeIn(function(){
            // getEl(this.previewer).setStyle('borderColor', 'red');
        });
    }
    return this;
};
PopMan.prototype.stopPreviewer = function(){
    var that = this;
    //Animation - FadeOut
    if (this.previewerAnimation && !this.previewerAnimation.checkStatusFadeOutComplete()){
        this.previewerAnimation.fadeOut(function(){
            that.stopPreviewer();
        });
        return;
    }
    //Hide
    getEl(this.previewer).setStyle('display','none').removeFromParent();
    return this;
};
PopMan.prototype.movePreviewer = function(event, x, y, content){
    /*Web 적합 Position*/
    var scrollX = getEl().getBodyScrollX();
    var scrollY = getEl().getBodyScrollY();
    var left = (event.clientX +scrollX +x);
    var top = (event.clientY +scrollY +y);
    var delta = 5;
    //- Check Max Limit
    var windowWidth = window.innerWidth +scrollX;
    var windowHeight = window.innerHeight +scrollY;
    var boundingClientRect = getEl(this.previewer).getBoundingClientRect();
    if (windowWidth < left + boundingClientRect.width)
        left = windowWidth - boundingClientRect.width -delta;
    if (windowHeight < top + boundingClientRect.height)
        top = windowHeight - boundingClientRect.height -delta;
    // console.log( windowWidth, windowHeight, boundingClientRect );
    //- Do
    getEl(this.previewer)
        .setStyle('display', 'block')
        .setStyle('left', left+ 'px')
        .setStyle('top', top+ 'px')
        .appendTo(document.body);
    if (content !== null && content !== undefined)
        getEl(this.previewer).html(content?content:'');
    return this;
};







/***************************************************************************
 *
 *  Focus
 *
 ***************************************************************************/
PopMan.prototype.focusOn = function(el){
    if (!this.focusDarkMap.up && el){
        var that = this;
        var offset = (el.getBoundingClientRect) ? el.getBoundingClientRect() : this.getBodyOffset(el);
        var doc = el.ownerDocument;
        var win = doc.defaultView || doc.parentWindow;
        var frameOffset = this.getFrameOffset(win);
        var x = offset.left + frameOffset.left;
        var y = offset.top + frameOffset.top;
        var w = el.offsetWidth;
        var h = el.offsetHeight;

        if (w == 0) return false;  // there are cases that when display is not block, has height 0
        var camW = this.getDivCamSizeChecker().offsetWidth;
        var camH = this.getDivCamSizeChecker().offsetHeight;
        this.focusDarkMap = {
            up:     this.getDarkElement(0, 0, camW, y),
            down:   this.getDarkElement(0, y + h, camW, camH),
            left:   this.getDarkElement(0, y, x, y + h),
            right:  this.getDarkElement(x + w, y, camW, y + h),
            arrow:  this.getArrow(x -30, y -9, '>>>')
        };
        for (var darkElName in this.focusDarkMap){
            var darkElPart = this.focusDarkMap[darkElName];
            getEl(document.body).add(darkElPart);
            window.getComputedStyle(darkElPart).background;
            if (darkElName != 'arrow') this.setBackgroundColor(darkElPart, 'rgba(0,0,0,.7)');
        }
        return true;
    }
};

PopMan.prototype.focusOff = function(){
    var that = this;
    for (var darkElName in this.focusDarkMap){
        var darkElPart = this.focusDarkMap[darkElName];
        getEl(darkElPart.parentNode).del(darkElPart);
        delete this.focusDarkMap[darkElName];
    }
};





PopMan.prototype.getDivCamSizeChecker = function(){
    if (!this.divCamSizeChecker)
        this.divCamSizeChecker = newEl('div').style('width:100%; height:100%; position:absolute; left:-7777px; top:-7777px;').appendTo(document.body).returnElement();
    return this.divCamSizeChecker;
};

PopMan.prototype.spreadDark = function(pop){
    var that = this;
    // dark
    var darkElement = newEl('div').addClass('sj-popman-obj-dark').returnElement();
    // dark - event
    if (pop.closebyclickout){
        getEl(darkElement)
            .addEventListener('mousedown', function(event){
                if (event.target == darkElement){
                    event.preventDefault();
                    event.stopPropagation();
                    that.meta.nowClickControlPop = pop;
                }
            })
            .addEventListener('mouseup', function(event){
                if (that.meta.nowClickControlPop === pop && event.target == darkElement){
                    that.meta.nowClickControlPop = null;
                    that.close(pop.element);
                }
            });
    }
    this.darkElementList.push(darkElement);
    var color = 'rgba(0,0,0,.7)';
    try{
        darkElement.style.background = color;
    }catch(e){
        if (color.indexOf('rgba') != -1){
            color = color.replace('rgba', 'rgb');
            var endIdx = color.lastIndexOf(',');
            color = color.substring(0, endIdx) +')';
        }
        darkElement.style.background = color;
    }
    return darkElement;
};




PopMan.prototype.adjustPosition = function(element, callback){
    var pop = this.getPop(element);
    var darkElement = pop.darkElement;
    var popContainerElement = pop.popContainerElement;
    var target = pop.target;

    var parentX, parentY, parentW, parentH;
    var hasTarget =target && target !== window;
    if (hasTarget){
        var pageRect = getEl(target).getBoundingPageRect();
        parentX = pageRect.left;
        parentY = pageRect.top;
        parentW = pageRect.width;
        parentH = pageRect.height;
        getEl(popContainerElement)
            .setStyle('position', 'absolute')
            .addClass('sj-popman-obj-container');
        if (darkElement){
            getEl(darkElement)
                .setStyle('position', 'absolute')
                .setStyle('display', 'block')
                .setStyle('zIndex', getData().findHighestZIndex(['div']) + 1)
                .setStyle('left', parentX +'px')
                .setStyle('top', parentY +'px')
                .setStyle('width', parentW +'px')
                .setStyle('height', parentH +'px')
                // .appendTo(pop.target)
                .appendTo(document.body)
        }
    }else{
        parentX = 0;
        parentY = 0;
        parentW = window.innerWidth;
        parentH = (window.innerHeight == 0) ? this.getDivCamSizeChecker().offsetHeight : window.innerHeight;
        getEl(popContainerElement)
            .setStyle('position', 'fixed')
            .addClass('sj-popman-obj-container');
        if (darkElement){
            getEl(darkElement)
                .setStyle('left', 0 +'px')
                .setStyle('top', 0 +'px')
                .setStyle('width', '100%')
                .setStyle('height', '100%')
                .setStyle('position', 'fixed')
                .setStyle('display', 'block')
                .setStyle('zIndex', getData().findHighestZIndex(['div']) + 1)
                .add(popContainerElement)
                .appendTo(document.body)
        }
    }

    if (!getEl(popContainerElement).hasSomeClass(['sj-popman-obj-context-alert', 'sj-popman-obj-context-confirm', 'sj-popman-obj-context-loading'])){
        getEl(popContainerElement).addClass('sj-popman-obj-context-pop');
    }

    // popexp
    var popX, popY, popW, popH;
    if (pop.exp){
        var popExpMap = this.getSolved2DPopExpMap(pop.exp, parentW, parentH);
        popX = popExpMap.posX +parentX;
        popY = popExpMap.posY +parentY;
        popW = popExpMap.sizeX;
        popH = popExpMap.sizeY;
    }else{
        var popExpXMap = this.getSolvedPopExpMap(pop.expx, parentW);
        var popExpYMap = this.getSolvedPopExpMap(pop.expy, parentH);
        popX = popExpXMap.pos +parentX;
        popY = popExpYMap.pos +parentY;
        popW = popExpXMap.size;
        popH = popExpYMap.size;
    }
    getEl(popContainerElement)
        .setStyle('left', PopMan.nvlDan(popX, 'px'))
        .setStyle('top', PopMan.nvlDan(popY, 'px'))
        .setStyle('width', PopMan.nvlDan(popW, 'px'))
        .setStyle('height', PopMan.nvlDan(popH, 'px'))
    ;
};
PopMan.nvlDan = function(num, dan){
    var result;
    var allLeng = (num+'').length;
    var onlyNumLeng = (parseFloat(num)+'').length;
    if (onlyNumLeng == allLeng)
        result = num + dan;
    else
        result = num;
    return result;
};
PopMan.prototype.getSolvedPopExpMap = function(popexp, parentSize){
    var popExpMap;
    var expStart;
    var expSize;
    var expEnd;
    var start;
    var size;
    var end;
    var pos;
    var isPopExp;
    if (popexp){
        var idxL = popexp.indexOf('(');
        var idxR = popexp.indexOf(')');
        isPopExp = (idxL != -1 && idxR != -1);
        if (isPopExp){
            expStart = popexp.substring(0, idxL);
            expEnd = popexp.substring(idxR +1, popexp.length);
            expSize = popexp.substring(idxL +1, idxR);
        }else{
            expStart = '*';
            expSize = popexp;
            expEnd = '*';
        }
        start = this.getSize(parentSize, expStart, function(min, s, max) {
            if (s == '*')
                s =  0;
            return s;
        });
        end = this.getSize(parentSize, expEnd, function(min, s, max){
            if (s == '*')
                s =  0;
            return s;
        });
        size = this.getSize(parentSize, expSize, function(min, s, max){
            if (s == '*')
                s = parentSize - start - end;
            return s;
        });
        //- Position
        if (expStart == '*' && expEnd != '*'){
            pos = (parentSize - size) - end;
        }else if (expStart != '*' && expEnd == '*'){
            pos = 0;
        }else if (expStart == '*' && expEnd == '*'){
            pos = (parentSize - size) / 2;
        }else{
            pos = start;
        }
        popExpMap = {
            isPopExp:isPopExp,
            expStart:expStart,
            expEnd:expEnd,
            expSize:expSize,
            pos:pos,
            size:size
        };
    // Default Setting - If (popexp == '')
    }else{
        popExpMap = {
            isPopExp:false,
            expStart:expStart,
            expEnd:expEnd,
            expSize:expSize,
            pos:parentSize - (parentSize/2) - (parentSize/4),
            size:parentSize/2
        };
    }
    return popExpMap;
};
PopMan.prototype.getSolved2DPopExpMap = function(popexp, parentSizeX, parentSizeY){
    var expArray = popexp.split('/');
    var xPopExpMap;
    var yPopExpMap;
    if (expArray.length == 1){
        var exp = expArray[0].trim();
        xPopExpMap = this.getSolvedPopExpMap(exp, parentSizeX);
        yPopExpMap = this.getSolvedPopExpMap(exp, parentSizeY);
    }else{
        xPopExpMap = this.getSolvedPopExpMap(expArray[0].trim(), parentSizeX);
        yPopExpMap = this.getSolvedPopExpMap(expArray[1].trim(), parentSizeY);
    }

    return {
        posX: xPopExpMap.pos,
        sizeX: xPopExpMap.size,
        posY: yPopExpMap.pos,
        sizeY: yPopExpMap.size,
    }
};


PopMan.prototype.getSize = function(parentSize, num, callbackCalculateAsterisk){
    var numString = (num+''), minSize = null, size = num, maxSize = null;
    //- Min/Max Checker
    (function(numString){
        var arrayLogic = numString.match(/[><=]{1,2}/gi);
        if (!arrayLogic)
            return;
        // var arrayValue = numString.match(/[^><=]{1,2}/gi);
        if (arrayLogic.length == 1 && (numString.indexOf('%') != -1 || numString.indexOf('*'))){
            //TODO: 구현 고민중..
        }else if (arrayLogic.length == 2 && (numString.indexOf('%') != -1 || numString.indexOf('*'))){
            var beforeLogicIndex = numString.indexOf(arrayLogic[0]);
            var afterLogicIndex = numString.indexOf(arrayLogic[1], beforeLogicIndex +1);
            var leftValue = numString.substring(0, beforeLogicIndex).trim();
            var centerValue = numString.substring(beforeLogicIndex +1, afterLogicIndex).trim();
            var rightValue = numString.substring(afterLogicIndex +1, numString.length).trim();
            if (leftValue != ''){
                if ((leftValue.indexOf('%') != -1))
                    leftValue = parentSize * (parseFloat(leftValue)/100);
                if (arrayLogic[0].indexOf('<') != -1)
                    minSize = (arrayLogic[0].indexOf('=') != -1) ? leftValue : leftValue +1;
                else if (arrayLogic[0].indexOf('>') != -1)
                    maxSize = (arrayLogic[0].indexOf('=') != -1) ? leftValue : leftValue -1;
            }
            size = centerValue;
            if (rightValue != ''){
                if ((rightValue.indexOf('%') != -1))
                    rightValue = parentSize * (parseFloat(rightValue)/100);
                if (arrayLogic[1].indexOf('<') != -1)
                    maxSize = (arrayLogic[1].indexOf('=') != -1) ? rightValue : rightValue -1;
                else if (arrayLogic[1].indexOf('>') != -1)
                    minSize = (arrayLogic[1].indexOf('=') != -1) ? rightValue : rightValue +1;
            }
        }
    })(numString);
    //- Origin Extracter
    if (typeof num == 'undefined')
        size = 0;
    if (size.indexOf('%') != -1)
        size = parentSize * (parseFloat(size)/100);
    if (callbackCalculateAsterisk)
        size = callbackCalculateAsterisk(minSize, size, maxSize);
    //- Calculate Min/Max
    size = parseFloat(size);
    if (minSize != null)
        size = Math.max(minSize, size);
    if (maxSize != null)
        size = Math.min(maxSize, size);
    return size;
};






PopMan.prototype.closeDark = function(darkElement){
    var darkElementList = this.darkElementList;
    for (var i=0; i<darkElementList.length; i++){
        if (darkElementList[i] == darkElement){
            darkElementList.splice(i, 1);
            getEl(darkElement.parentNode).del(darkElement);
        }
    }
};


PopMan.prototype.pushStack = function(popElement){
    this.popElementStackList.push(popElement);
    if (this.popElementStackList.length == 1){
        this.execEventListenerByEventName('beforefirstpop');
    }
};
PopMan.prototype.removeStack = function(popElement){
    var popElementStackList = this.popElementStackList;
    for (var i=popElementStackList.length -1; i>-1; i--){
        if (popElementStackList[i] == popElement){
            popElementStackList.splice(i, 1);
        }
    }
    if (this.countStack() == 0){
        this.execEventListenerByEventName('afterlastpop');
    }
};
PopMan.prototype.countStack = function(){
    return this.popElementStackList.length;
};


PopMan.prototype.getDarkElement = function(sx, sy, ex, ey){
    var zIndex = 50;
    var color = 'rgba(0,0,0,.7)';
    var dan = 'px';
    function noMinus(val){
        return (val >= 0) ? val :  0;
    }
    var darkElement = newEl('div')
                        .style('display:block; position:fixed; transition:background-color .5s, transform .5s;')
                        .setStyle('zIndex', zIndex)
                        .setStyle('left', sx +dan)
                        .setStyle('top', sy +dan)
                        .setStyle('width', noMinus(ex - sx) +dan)
                        .setStyle('height', noMinus(ey - sy) + dan)
                        .returnElement();
    this.setBackgroundColor(darkElement, 'rgba(255,255,255,0)');
    return darkElement;
};
PopMan.prototype.getArrow = function(sx, sy, comment){
    var zIndex = 51;
    var color = 'rgba(0,0,0,.7)';
    var arrowEl = document.createElement('div');
    var dan = 'px';
    function noMinus(val){
        return (val >= 0) ? val :  0;
    }
    arrowEl.style.left = sx + dan;
    arrowEl.style.top = sy + dan;
    arrowEl.style.width = '30px';
    arrowEl.style.height = '30px';
    arrowEl.style.zIndex = zIndex;
    arrowEl.style.display = 'block';
    arrowEl.style.position = 'absolute';
    arrowEl.style.transition = "background-color .5s, transform .5s";
    arrowEl.style.color = "white";
    arrowEl.innerHTML = comment;
    return arrowEl;
};
PopMan.prototype.getBodyOffset = function(objTemp){
    var sumOffsetLeft = 0;
    var sumOffsetTop = 0;
    var thisObj = objTemp;
    var parentObj = objTemp.parentNode;
    while(parentObj){
        var scrollX = 0;
        var scrollY = 0;
        if (thisObj != document.body){
            scrollX = thisObj.scrollLeft;
            scrollY = thisObj.scrollTop;
        }
        if (parentObj.style){
            if (parentObj.style.position == 'absolute') {
                sumOffsetLeft += thisObj.offsetLeft - scrollX;
                sumOffsetTop += thisObj.offsetTop - scrollY;
            }else if(parentObj.style.position == 'fixed' || thisObj.style.position == 'fixed'){
                sumOffsetLeft += thisObj.offsetLeft + this.getBodyScrollX();
                sumOffsetTop += thisObj.offsetTop + this.getBodyScrollY();
                break;
            }else{
                sumOffsetLeft += (thisObj.offsetLeft - parentObj.offsetLeft) - scrollX;
                sumOffsetTop += (thisObj.offsetTop - parentObj.offsetTop) - scrollY;
            }
        }else{
            break;
        }
        thisObj = parentObj;
        parentObj = parentObj.parentNode;
    }
    var objBodyOffset = {left:sumOffsetLeft, top:sumOffsetTop, width:objTemp.offsetWidth, height:objTemp.offsetHeight};
    return objBodyOffset;
};
PopMan.prototype.getFrameOffset = function (win, dims){
    dims = (typeof dims === 'undefined')?{ top: 0, left: 0}:dims;
    if (win !== top) {
        var rect = win.frameElement.getBoundingClientRect();
        dims.left += rect.left;
        dims.top += rect.top;
        dims = this.getFrameOffset(win.parent, dims ); // recursion
    }
    return dims;
};
PopMan.prototype.setBackgroundColor = function(el, color){
    try{
        el.style.background = color;
    }catch(e){
        if (color.indexOf('rgba') != -1){
            color = color.replace('rgba', 'rgb');
            var endIdx = color.lastIndexOf(',');
            color = color.substring(0, endIdx) +')';
        }
        el.style.background = color;
    }
};




/***************************************************************************
 *
 *  AnimationMan
 *
 ***************************************************************************/
function AnimationMan(){
    this.event = new SjEvent();
    this.status;
    this.statusAnimationRunning = false;
    this.animationRate = -1;
    this.funcWhenCompleteFadeIn = null;
    this.funcWhenCompleteFadeOut = null;

    this.animationTime = 1000;
    this.delta = 16;
}
AnimationMan.STATUS_NONE = 0;
AnimationMan.STATUS_FADE_IN = 1;
AnimationMan.STATUS_FADE_OUT = 2;
AnimationMan.EVENT_FADEINSTART = 'fadeinstart';
AnimationMan.EVENT_FADEOUTSTART = 'fadeoutstart';
AnimationMan.EVENT_FADEIN = 'fadein';
AnimationMan.EVENT_FADEOUT = 'fadeout';
AnimationMan.EVENT_FADEINOUT = 'fadeinout';
AnimationMan.EVENT_FADEINCOMPLETE = 'fadeincomplete';
AnimationMan.EVENT_FADEOUTCOMPLETE = 'fadeoutcomplete';

/*************************
 *
 * EVENT
 *
 *************************/
AnimationMan.prototype.addEventListener               = function(element, eventName, eventFunc){ this.event.addEventListener(element, eventName, eventFunc); return this; };
AnimationMan.prototype.addEventListenerByEventName    = function(eventName, eventFunc){ this.event.addEventListenerByEventName(eventName, eventFunc); return this; };
AnimationMan.prototype.hasEventListener               = function(element, eventName, eventFunc){ return this.event.hasEventListener(element, eventName, eventFunc); };
AnimationMan.prototype.hasEventListenerByEventName    = function(eventName, eventFunc){ return this.event.hasEventListenerByEventName(eventName, eventFunc); };
AnimationMan.prototype.hasEventListenerByEventFunc    = function(eventFunc){ return this.event.hasEventListenerByEventFunc(eventFunc); };
AnimationMan.prototype.removeEventListener            = function(element, eventName, eventFunc){ return this.event.removeEventListener(element, eventName, eventFunc); };
AnimationMan.prototype.removeEventListenerByEventName = function(eventName, eventFunc){ return this.event.removeEventListenerByEventName(eventName, eventFunc); };
AnimationMan.prototype.removeEventListenerByEventFunc = function(eventFunc){ return this.event.removeEventListenerByEventFunc(eventFunc); };
AnimationMan.prototype.execEventListener              = function(element, eventName, event){ return this.event.execEventListener(element, eventName, event); };
AnimationMan.prototype.execEventListenerByEventName   = function(eventName, event){ return this.event.execEventListenerByEventName(eventName, event); };


AnimationMan.prototype.setTime = function(animationTime){
    this.animationTime = animationTime;
    return this;
};
AnimationMan.prototype.setDelta = function(delta){
    this.delta = delta;
    return this;
};

AnimationMan.prototype.fadeIn = function(callback){
    this.status = AnimationMan.STATUS_FADE_IN;
    this.funcWhenCompleteFadeIn = callback;
    if (this.animationRate == -1){
        this.animationRate = 0;
    }
    if (this.animationRate == 0){
        this.execEventListenerByEventName(AnimationMan.EVENT_FADEINSTART, this.animationRate);
    }
    if (this.checkStatusComplete()){
        (this.funcWhenCompleteFadeIn && this.funcWhenCompleteFadeIn());
        this.funcWhenCompleteFadeIn = null;
        return;
    }
    if (!this.statusAnimationRunning)
        this.run();
};
AnimationMan.prototype.fadeOut = function(callback){
    this.status = AnimationMan.STATUS_FADE_OUT;
    this.funcWhenCompleteFadeOut = callback;
    if (this.animationRate == -1){
        this.animationRate = 1;
    }
    if (this.animationRate == 1){
        this.execEventListenerByEventName(AnimationMan.EVENT_FADEOUTSTART, this.animationRate);
    }
    if (this.checkStatusComplete()){
        (this.funcWhenCompleteFadeOut && this.funcWhenCompleteFadeOut());
        this.funcWhenCompleteFadeOut = null;
        return;
    }
    if (!this.statusAnimationRunning)
        this.run();
};
AnimationMan.prototype.fadeOutWhenNotComplete = function(callback){
  if (!this.checkStatusFadeOutComplete()){
      this.fadeOut(callback);
      return true;
  }
  return false;
};
AnimationMan.prototype.run = function(){
    var that = this;
    this.statusAnimationRunning = true;
    var d = (this.delta / this.animationTime);
    if (this.status == AnimationMan.STATUS_FADE_IN){
        this.animationRate = Math.min(1, this.animationRate +d);
        this.execEventListenerByEventName(AnimationMan.EVENT_FADEIN, this.animationRate);
    }else if (this.status == AnimationMan.STATUS_FADE_OUT){
        this.animationRate = Math.max(0, this.animationRate -d);
        this.execEventListenerByEventName(AnimationMan.EVENT_FADEOUT, this.animationRate);
    }
    this.execEventListenerByEventName(AnimationMan.EVENT_FADEINOUT, this.animationRate);
    //Check Finish
    if (that.checkStatusComplete()){
        this.statusAnimationRunning = false;
        if (this.status == AnimationMan.STATUS_FADE_IN){
            (this.funcWhenCompleteFadeIn && this.funcWhenCompleteFadeIn());
            this.funcWhenCompleteFadeIn = null;
            this.execEventListenerByEventName(AnimationMan.EVENT_FADEINCOMPLETE, this.animationRate);
        }else if (this.status == AnimationMan.STATUS_FADE_OUT){
            (this.funcWhenCompleteFadeOut && this.funcWhenCompleteFadeOut());
            this.funcWhenCompleteFadeOut = null;
            this.execEventListenerByEventName(AnimationMan.EVENT_FADEOUTCOMPLETE, this.animationRate);
        }
    }else{
        //Animation Frame Engine
        setTimeout(function(){
            that.run();
        }, this.delta);
    }
};
AnimationMan.prototype.checkStatusComplete = function(){
    if (this.status == AnimationMan.STATUS_FADE_IN){
        if (this.animationRate == 1)
            return true;
    }else if (this.status == AnimationMan.STATUS_FADE_OUT){
        if (this.animationRate == 0)
            return true;
    }
    return false;
};
AnimationMan.prototype.checkStatusFadeOutComplete = function(){
    return (this.status == AnimationMan.STATUS_FADE_OUT) && this.checkStatusComplete();
};


