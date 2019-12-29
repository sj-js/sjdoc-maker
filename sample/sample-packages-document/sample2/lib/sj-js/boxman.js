function BoxMan(setupObj){
    var that = this;
    // var modeMobile = this.isMobile();
    var modeMobile = getData().isMobile;
    this.event = new SjEvent();
    this.event.setSpecialEventListener(function(element, eventName){
        if (eventName == 'external'){
            //Make Event
            getEl(element).clas.add('sj-obj-exbox');
            getEl(element).addEventListener('dragenter', that.handleDragEnter(that, element));
            getEl(element).addEventListener('dragover', that.handleDragOver(that, element));
            getEl(element).addEventListener('dragleave', that.handleDragOut(that, element));
            getEl(element).addEventListener('drop', that.handleDrop(that, element));
            var rect = getEl(element).getBoundingOffsetRect();
            //Make Cover
            var cover = newEl('div').returnElement();
            cover.style.width = rect.width;
            cover.style.height = rect.height;
            cover.style.background = "rgba(0,0,0,0.5)";
            cover.style.position = 'absolute';
            cover.style.top = rect.top;
            cover.style.left = rect.left;
            cover.parentElement = element;
            that.cover = cover;
            getEl(cover).clas.add('sj-obj-exbox');
            getEl(cover).addEventListener('dragenter', that.handleDragEnter(that, cover));
            getEl(cover).addEventListener('dragover', that.handleDragOver(that, cover));
            getEl(cover).addEventListener('dragleave', that.handleDragOut(that, cover));
            getEl(cover).addEventListener('drop', that.handleDrop(that, cover));
        }
    });
    this.keyboarder = new BoxManKeyboarder(this);

    this.objs = {};
    this.boxObjs = {};
    this.exBoxObjs = {};
    this.cover;

    /** Option to user setup **/
    this.globalSetup = {
        modeTest: false,
        modeResize: true,
        modeMouse: !modeMobile,
        modeTouch: modeMobile || 'ontouchstart' in document.documentElement,
        timeForReadyToDragOnMobile: 50,

        testBoxClass: null,
        testBoxBorderWidth: '1px',
        testBoxBorderColor: '#f8e',
        testObjClass: null,
        testObjBorderWidth: '1px',
        testObjBorderColor: '#7effb4',

        defaultBox: undefined,
        modeDefaultAbsolute: true,

        modeCopy: false,
        modeOnlyBoxToBox: true,
        modeRemoveOutOfBox: false,
        appendType: BoxMan.APPEND_TYPE_LAST
    };
    this.globalSetupForBox = {};
    this.globalSetupForObj = {};
    this.globalSetupForExBox = {};

    /** Meta Data **/
    this.metaObj = {
        mvObj:undefined,
        isOnDown:false,
        isOnMoving:false,
        lastPosX:0,
        lastPosY:0,
        mvObjPreviewClone:undefined,
        mvObjPreviewOriginalClone:undefined,
        mvObjStartBodyOffset:undefined,
        mvObjCloneList:[],

        mvObjAppendTypeBefore:undefined,
        mvObjOriginalBox:undefined,
        mvObjOriginalShelterList:[],

        testDivForCheckSize: null,
        cam:{
            w:window.innerWidth,
            h:window.innerHeight
        },
        limit:2,
        layerOnMove:undefined,  //TODO: defaultBox로 바꿀지 다른 목적으로 할지..
        mode:new BoxManMode(this.globalSetup)
    };
    if (setupObj)
        this.setup(setupObj);



    if (this.globalSetup.modeResize){
        window.addEventListener('resize', function () {
            that.resize();
        });
    }

    ready(function(){
        // document.addEventListener("DOMContentLoaded", function(){
        // getEl().ready(function(){
        /** 이벤트의 중원을 맡으실 분들 **/
        if (that.globalSetup.modeTouch){
            getEl(document).addEventListener('touchstart', function(event){ that.whenMouseDown(event); });
            getEl(document).addEventListener('touchmove', function(event){ that.whenMouseMove(event); });
            getEl(document).addEventListener('touchend', function(event){ that.whenMouseUp(event); });
        }
        if (that.globalSetup.modeMouse){
            getEl(document).addEventListener('mousedown', function(event){ that.whenMouseDown(event); });
            getEl(document).addEventListener('mousemove', function(event){ that.whenMouseMove(event); });
            getEl(document).addEventListener('mouseup', function(event){ that.whenMouseUp(event); });
        }
        that.resize();
    }, false);
    return this;
}

/*************************
 * Exports
 *************************/
try {
    module.exports = exports = BoxMan;
} catch (e) {}




BoxMan.APPEND_TYPE_LAST = 1;
BoxMan.APPEND_TYPE_FIRST = 2;
BoxMan.APPEND_TYPE_BETWEEN = 3;
BoxMan.APPEND_TYPE_OVERWRITE = 4;
BoxMan.APPEND_TYPE_SWAP = 5;
BoxMan.APPEND_TYPE_INVISIBLE = 6;


/*************************
 *
 * GLOBAL SETUP
 *
 *************************/
BoxMan.prototype.setup = function(options){
    for (var objName in options){
        this.globalSetup[objName] = options[objName];
    }
    return this;
};

/*************************
 *
 * COPY OBJECT
 *
 *************************/
BoxMan.prototype.clone = function(param){
    var element = getEl(param).returnElement();
    var copyElement = element.cloneNode(true);
    var originalInfo;
    var copyInfo = {};
    if (element.getAttribute('data-box') != null){
        originalInfo = this.getBoxByManId(element.manid);
    }else if (element.getAttribute('data-obj') != null){
        originalInfo = this.getObjByManId(element.manid);
    }
    for (var filedName in originalInfo){
        copyInfo[filedName] = originalInfo[filedName];
    }
    this.setObj(copyElement, copyInfo);
    return copyElement;
};

/*************************
 *
 * When document is ready
 *
 *************************/
BoxMan.prototype.ready = function(afterDetectFunc){
    var that = this;
    if (afterDetectFunc){
        ready(function(){
        // getEl().ready(function(){
            afterDetectFunc(that);
        });
    }
};

/*************************
 *
 * DETECT DOM SETUPED WITH BOXMAN OPTION
 *
 *************************/
BoxMan.prototype.detect = function(afterDetectFunc){
    var that = this;
    ready(function(){
    // getEl().ready(function(){
        var setupedElementList;
        /** 객체탐지 적용(담는 상자) **/
        setupedElementList = document.querySelectorAll('[data-box]');
        for (var j=0; j<setupedElementList.length; j++){
            that.addBox(setupedElementList[j]);
        }
        /** 객체탐지 적용(끌리는 객체) **/
        setupedElementList = document.querySelectorAll('[data-obj]');
        for (var j=0; j<setupedElementList.length; j++){
            that.addObj(setupedElementList[j]);
        }
        /** Run Function After Detect **/
        if (afterDetectFunc)
            afterDetectFunc(that);
        if (that.hasEventListenerByEventName('afterdetect'))
            that.execEventListenerByEventName('afterdetect');
    });
    return this;
};
BoxMan.prototype.afterDetect = function(func){
    var that = this;
    that.addEventListenerByEventName('afterdetect', func);
    return this;
};





/*************************
 *
 * EVENT
 *
 *************************/
BoxMan.prototype.addEventListener               = function(element, eventName, eventFunc){ this.event.addEventListener(element, eventName, eventFunc); return this; };
BoxMan.prototype.addEventListenerByEventName    = function(eventName, eventFunc){ this.event.addEventListenerByEventName(eventName, eventFunc); return this; };
BoxMan.prototype.hasEventListener               = function(element, eventName, eventFunc){ return this.event.hasEventListener(element, eventName, eventFunc); };
BoxMan.prototype.hasEventListenerByEventName    = function(eventName, eventFunc){ return this.event.hasEventListenerByEventName(eventName, eventFunc); };
BoxMan.prototype.hasEventListenerByEventFunc    = function(eventFunc){ return this.event.hasEventListenerByEventFunc(eventFunc); };
BoxMan.prototype.removeEventListener            = function(element, eventName, eventFunc){ return this.event.removeEventListener(element, eventName, eventFunc); };
BoxMan.prototype.removeEventListenerByEventName = function(eventName, eventFunc){ return this.event.removeEventListenerByEventName(eventName, eventFunc); };
BoxMan.prototype.removeEventListenerByEventFunc = function(eventFunc){ return this.event.removeEventListenerByEventFunc(eventFunc); };
BoxMan.prototype.execEventListener              = function(element, eventName, event){ return this.event.execEventListener(element, eventName, event); };
BoxMan.prototype.execEventListenerByEventName   = function(eventName, event){ return this.event.execEventListenerByEventName(eventName, event); };
BoxMan.prototype.execEvent                      = function(eventMap, eventNm, event){ return this.event.execEvent(eventMap, eventNm, event); };



/** Special Event **/
BoxMan.prototype.handleDragEnter = function(that, element){
    var element = getEl(element).returnElement();
    return function(event){
        console.log('enter', element, that.cover);
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        //- Append DragOver View
        if (element != that.cover)
            element.appendChild(that.cover);
    }
};
BoxMan.prototype.handleDragOver = function(that, element){
    var element = getEl(element).returnElement();
    return function(event){
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }
};
BoxMan.prototype.handleDragOut = function(that, element){
    var element = getEl(element).returnElement();
    return function(event){
        // console.log('out', element, that.cover);
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        //- Clear DragOver View
        if (element == that.cover){
            that.cover.parentNode.removeChild(that.cover);
        }
    }
};
BoxMan.prototype.handleDrop = function(that, element){
    var element = getEl(element).returnElement();
    return function(event){
        console.log('drop', element == that.cover, document.body == that.cover.parentElement);
        event.stopPropagation();
        event.preventDefault();
        //- Drop Event
        var files = (event.originalEvent) ? event.originalEvent.dataTransfer.files : (event.dataTransfer) ? event.dataTransfer.files : '';
        event.exbox = {files:files};
        //- Clear DragOver View
        if (element == that.cover){
            var eventElement = that.cover.parentElement;
            that.execEventListener(eventElement, 'external', event);
            getEl(that.cover).removeFromParent();
            // that.cover.parentNode.removeChild(that.cover);
        }
    }
};




/*************************
 *
 * BOX
 *
 *************************/
BoxMan.prototype.addBox = function(element){
    if (element.getAttribute('data-box') == null && element.getAttribute('data-box') == undefined)
        element.setAttribute('data-box', '');
    this.setBox(element, {
        limit:element.getAttribute('data-limit'),
        acceptbox:getData(element.getAttribute('data-accept-box')).parse(),
        rejectbox:getData(element.getAttribute('data-reject-box')).parse(),
        acceptobj:getData(element.getAttribute('data-accept-obj')).parse(),
        rejectobj:getData(element.getAttribute('data-reject-obj')).parse(),
        start:element.getAttribute('data-event-start'),
        boxin:element.getAttribute('data-event-boxin'),
        boxout:element.getAttribute('data-event-boxout'),
        boxinout:element.getAttribute('data-event-boxinout'),
        beforeboxin:element.getAttribute('data-event-beforeboxin'),
        mustdo:element.getAttribute('data-event-mustdo'),
        swappedin:element.getAttribute('data-event-swappedin'),
        swappedout:element.getAttribute('data-event-swappedout'),
        external:element.getAttribute('data-event-external')
    });
};
BoxMan.prototype.newBox = function(infoObj){
    var newElement = newEl('div', {'data-box':'true'}, '').returnElement();
    var parentElement;
    if (!infoObj){
        infoObj = { parent: document.body };
    }
    if (infoObj.parent){
        if (typeof parent == 'string'){
            parentElement = document.getElementById(infoObj.parent);
        }else{
            parentElement = infoObj.parent;
        }
    }else{
        parentElement = (infoObj.parentEl) ? infoObj.parentEl : document.body;
    }
    this.setBox(newElement, infoObj, parentElement);
    return newElement;
};
BoxMan.prototype.setBox = function(element, infoObj, parentElement){
    var that = this;
    var boxObjs = this.boxObjs;
    element = getEl(element).returnElement();
    //Init
    infoObj = (infoObj) ? infoObj : {};
    infoObj.conditionbox = [];
    infoObj.conditionobj = [];
    //이중적용 방지
    if (element.isAdaptedBox){
        return false;
    }else{
        element.isAdaptedBox = true;
        getEl(element).clas.add('sj-obj-box');
    }
    //MAN ID 적용
    var manid = (infoObj.manid) ? infoObj.manid : getEl(boxObjs).getNewSeqId('tmpBox'); //TODO: manid에 대한 재정의 필요
    var id = (infoObj.id) ? infoObj.id : (element.id) ? element.id : manid;
    element.manid = manid;
    element.id = id;
    //컬렉션에 저장
    this.boxObjs[manid] = infoObj;
    this.boxObjs[manid].element = element;
    this.boxObjs[manid].id = id;
    this.boxObjs[manid].manid = manid;
    this.boxObjs[manid].mode = new BoxManMode();
    //Global & Local 설정
    var g = this.globalSetupForBox;
    var o = (infoObj) ? infoObj : {};
    for (var gNm in g){
        if (!o[gNm])
            o[gNm] = g[gNm];
    }
    //Set View
    this.setBoxView(o);
    this.setTestViewForBox(o, that.globalSetup);
    //부모 DOM에 추가
    if (parentElement)
        getEl(parentElement).add(element);
    //Set Event
    this.setBoxEvent(o);
    return manid;
};
BoxMan.prototype.setBoxView = function(infoObj){
    var element = infoObj.element;
    if (infoObj){
        console.log('set data check', infoObj);
        if (infoObj.imgURL) element.style.background = 'url("'+ infoObj.imgURL +'")';
        if (infoObj.width && infoObj.height) element.style.backgroundSize = infoObj.width+' '+infoObj.height;
        if (infoObj.width) element.style.width = infoObj.width;
        if (infoObj.height) element.style.height = infoObj.height;
        if (infoObj.minWidth) element.style.minWidth = infoObj.minWidth;
        if (infoObj.minHeight) element.style.minHeight = infoObj.minHeight;
        if (infoObj.class) getEl(element).clas.add(infoObj.class);
        if (infoObj.clazz) getEl(element).clas.add(infoObj.clazz);
        if (infoObj.content) element.innerHTML = infoObj.content;
    }
};
BoxMan.prototype.setTestViewForBox = function(infoObj, globalSetup){
    var element = infoObj.element;
    if (globalSetup.modeTest){
        if (globalSetup.testBoxClass){
            getEl(element).addClass(globalSetup.testBoxClass);
        }
        if (globalSetup.testBoxBorderWidth){
            element.style.borderWidth = globalSetup.testBoxBorderWidth;
        }
        if (globalSetup.testBoxBorderColor){
            element.style.borderColor = globalSetup.testBoxBorderColor;
        }
    }
};
BoxMan.prototype.setTestViewForObj = function(infoObj, globalSetup){
    var element = infoObj.element;
    if (globalSetup.modeTest){
        if (globalSetup.testObjClass){
            getEl(element).addClass(globalSetup.testObjClass);
        }
        if (globalSetup.testObjBorderWidth){
            element.style.borderWidth = globalSetup.testObjBorderWidth;
        }
        if (globalSetup.testObjBorderColor){
            element.style.borderColor = globalSetup.testObjBorderColor;
        }
    }
};
BoxMan.prototype.setBoxEvent = function(infoObj){
    var element = infoObj.element;
    //Event 추가
    if (infoObj.start){
        // this.addEventListener(element, 'start', new Function('event', infoObj.start));
        this.addEventListener(element, 'start', infoObj.start);
        this.execEventListener(element, 'start', {box:element, obj:undefined, boxSize:this.getMovableObjCount(element)});
    }
    if (infoObj.boxin){
        this.addEventListener(element, 'boxin', new Function('event', infoObj.boxin));
    }
    if (infoObj.boxout){
        this.addEventListener(element, 'boxout', new Function('event', infoObj.boxout));
    }
    if (infoObj.boxinout){
        this.addEventListener(element, 'boxinout', new Function('event', infoObj.boxinout));
    }
    if (infoObj.beforeboxin){
        this.addEventListener(element, 'beforeboxin', new Function('event', infoObj.beforeboxin));
    }
    if (infoObj.mustdo){
        this.addEventListener(element, 'mustdo', new Function('event', infoObj.mustdo));
    }
    if (infoObj.swappedin){
        this.addEventListener(element, 'swappedin', new Function('event', infoObj.swappedin));
    }
    if (infoObj.swappedout){
        this.addEventListener(element, 'swappedout', new Function('event', infoObj.swappedout));
    }
    if (infoObj.external){
        this.addEventListener(element, 'external', new Function('event', infoObj.external));
    }
};




BoxMan.prototype.delBox = function(param){
    var obj = this.getBox(param);
    var element = obj.element;
    var manid = element.manid;
    delete this.boxObjs[manid];
    element.parentNode.removeChild(element);
    return this;
};
BoxMan.prototype.getBox = function(element){
    if (typeof element == 'string'){
        return this.getBoxById(element);
    }else if (element instanceof Element){
        return this.getBoxByEl(element);
    }else{
        var resultList = this.getBoxesByCondition(element);
        if (resultList != null && resultList.length > 0)
            return resultList[0];
    }
    return;
};
BoxMan.prototype.getElementByBox = function(element){
    var boxObj = this.getBox(element);
    return boxObj.element;
};
BoxMan.prototype.setBoxMode = function(targetBoxCondition, infoObj){
    //Get Target
    var targetBoxList = this.getBoxesByCondition(targetBoxCondition);
    //Set Condition Data
    for (var i=0; i<targetBoxList.length; i++){
        var targetBox = targetBoxList[i];
        targetBox.mode.set(infoObj);
    }
    return this;
};

BoxMan.prototype.getBoxById = function(id){
    var boxElement = document.getElementById(id);
    return this.boxObjs[boxElement.manid];
};
BoxMan.prototype.getBoxByEl = function(element){
    var boxObjs = this.boxObjs;
    if (element && element.manid){
        var manid = element.manid;
        var boxObj = boxObjs[manid];
        return boxObj;
    }
};
BoxMan.prototype.getBoxByManId = function(manid){
    return this.boxObjs[manid];
};
BoxMan.prototype.getBoxes = function(){
    return this.boxObjs;
};
BoxMan.prototype.getBoxesByCondition = function(condition){
    var resultList = [];
    var boxObjs = this.boxObjs;
    for (var manid in boxObjs){
        var boxObj = boxObjs[manid];
        var result = getEl(boxObj).find(condition);
        if (result)
            resultList.push(result);
    }
    return resultList;
};
BoxMan.prototype.getBoxesByDomAttributeCondition = function(condition){
    var resultList = [];
    var boxObjs = this.boxObjs;
    for (var boxName in boxObjs){
        var boxObj = boxObjs[boxName];
        var boxElement = boxObj.element;
        var result = getEl(boxElement).findDomAttribute(condition);
        if (result)
            resultList.push(result);
    }
    return resultList;
};

BoxMan.prototype.clearBox = function(param){
    var boxElement = getEl(param).returnElement();
    if (boxElement)
        boxElement.innerHTML = "";
    return this;
};
BoxMan.prototype.addAcceptBox = function(targetBoxCondition, condition){
    //Get Target
    var targetBoxList = this.getBoxesByCondition(targetBoxCondition);
    //Set Condition Data
    for (var i=0; i<targetBoxList.length; i++) {
        var targetBox = targetBoxList[i];
        if (targetBox.acceptbox == undefined || targetBox.acceptbox == null){
            targetBox.acceptbox = [];
        }
        if (targetBox.acceptbox instanceof Array) {
            if (condition instanceof Array){
                targetBox.acceptbox = targetBox.acceptbox.concat(condition);
            }else{
                targetBox.acceptbox.push(condition);
            }
        } else {
            targetBox.acceptbox = [targetBox.acceptbox];
        }
    }
    return this;
};
BoxMan.prototype.addRejectBox = function(targetBoxCondition, condition){
    //Get Target
    var targetBoxList = this.getBoxesByCondition(targetBoxCondition);
    //Set Condition Data
    for (var i=0; i<targetBoxList.length; i++) {
        var targetBox = targetBoxList[i];
        if (targetBox.rejectbox == undefined || targetBox.rejectbox == null){
            targetBox.rejectbox = [];
        }
        if (targetBox.rejectbox instanceof Array) {
            if (condition instanceof Array)
                targetBox.rejectbox = targetBox.rejectbox.concat(condition);
            else
                targetBox.rejectbox.push(condition);
        } else {
            targetBox.rejectbox = [targetBox.acceptbox];
        }
    }
    return this;
};
BoxMan.prototype.addConditionWithBox = function(targetBoxCondition, conditionForBox, data){
    //Get Target
    var targetBoxList = this.getBoxesByCondition(targetBoxCondition);
    //Set Condition Data
    for (var i=0; i<targetBoxList.length; i++){
        var targetBox = targetBoxList[i];
        targetBox.conditionbox.push({
            condition:conditionForBox,
            data:data
        });
    }
    return this;
};
BoxMan.prototype.getConditionData = function(target, conditionDataList){
    var result = {};
    if (conditionDataList != null && conditionDataList.length > 0){
        for (var i=0; i<conditionDataList.length; i++){
            var conditionObj = conditionDataList[i];
            var condition = conditionObj.condition;
            var data = conditionObj.data;
            if (getEl(target).isAccepted(condition)){
                for (var filedName in data){
                    result[filedName] = data[filedName];
                }
            }
        }
    }
    return result;
};


BoxMan.prototype.addAcceptObj = function(targetBoxCondition, condition){
    //Get Target
    var targetBoxList = this.getBoxesByCondition(targetBoxCondition);
    //Set Condition Data
    for (var i=0; i<targetBoxList.length; i++) {
        var targetBox = targetBoxList[i];
        if (targetBox.acceptobj == undefined || targetBox.acceptobj == null){
            targetBox.acceptobj = [];
        }
        if (targetBox.acceptobj instanceof Array) {
            if (condition instanceof Array)
                targetBox.acceptobj = targetBox.acceptobj.concat(condition);
            else
                targetBox.acceptobj.push(condition);
        } else {
            targetBox.acceptobj = [targetBox.acceptobj];
        }
    }
    return this;
};
BoxMan.prototype.addRejectObj = function(targetBoxCondition, condition){
    //Get Target
    var targetBoxList = this.getBoxesByCondition(targetBoxCondition);
    //Set Condition Data
    for (var i=0; i<targetBoxList.length; i++) {
        var targetBox = targetBoxList[i];
        if (targetBox.rejectobj == undefined || targetBox.rejectobj == null){
            targetBox.rejectobj = [];
        }
        if (targetBox.rejectobj instanceof Array) {
            if (condition instanceof Array)
                targetBox.rejectobj = targetBox.rejectobj.concat(condition);
            else
                targetBox.rejectobj.push(condition);
        } else {
            targetBox.rejectobj = [targetBox.rejectobj];
        }
    }
    return this;
};
BoxMan.prototype.addConditionWithObj = function(targetBoxCondition, conditionForObj, data){
    //Get Target
    var targetBoxList = this.getBoxesByCondition(targetBoxCondition);
    //Set Condition Data
    for (var i=0; i<targetBoxList.length; i++){
        var targetBox = targetBoxList[i];
        targetBox.conditionobj.push({
            condition:conditionForObj,
            data:data
        });
    }
    return this;
};
BoxMan.prototype.suspendBox = function(suspendedBox, suspenderBox){
    var suspendedEl = getEl(suspendedBox).returnElement();
    var suspenderEl = getEl(suspenderBox).returnElement();
    var top = suspenderEl.offsetTop + suspenderEl.offsetHeight;
    var left = suspenderEl.offsetLeft;
    suspendedEl.style.position = 'absolute';
    suspendedEl.style.top = top + 'px';
    suspendedEl.style.left = left + 'px';
};




/*************************
 *
 * OBJ
 *
 *************************/
BoxMan.prototype.addObj = function(element){
    var infoObj = {
        manid:element.getAttribute('data-obj-id')
    };
    this.setObj(element, infoObj);
};
BoxMan.prototype.newObj = function(infoObj, attributes){
    //Create New Element
    if (!attributes)
        attributes = {};

    attributes['data-obj'] = 'true';
    var newElement = newEl('div', attributes, '').returnElement();
    //Check Parent Element
    var parentElement;
    if (!infoObj){
        infoObj = { parent: document.body };
    }
    if (infoObj.id){
        newElement.id = infoObj.id;
    }
    if (infoObj.parent){
        if (typeof parent == 'string'){
            parentElement = document.getElementById(infoObj.parent);
        }else{
            parentElement = infoObj.parent;
        }
    }else{
        parentElement = (infoObj.parentEl) ? infoObj.parentEl : document.body;
    }
    this.setObj(newElement, infoObj, parentElement);
    return newElement;
};
BoxMan.prototype.newObjToPointer = function(infoObj, attribute){
    var element = this.newObj(infoObj, attribute);
    var event = {clientX:300, clientY:300};
    newEl('div').add(element); //숨기기
    this.objStartMove(event, element);
    return element;
};
BoxMan.prototype.setObj = function(element, infoObj, parentElement){
    infoObj = (infoObj)? infoObj:{};
    if (element.isAdaptedMovable){
        return false;
    }else{
        element.isAdaptedMovable = true;
        getEl(element).clas.add('sj-obj-movable');
    }
    // 적용시작
    var that = this;
    var objs = this.objs;
    var meta = this.metaObj;
    // ID 적용
    var manid = (infoObj.manid)? infoObj.manid : getEl(objs).getNewSeqId('tmpObj');
    // var manid = getEl(objs).getNewSeqId('tmpObj');
    var id = (infoObj.id) ? infoObj.id : (element.id) ? element.id : manid;
    element.manid = manid;
    element.id = id;
    this.objs[manid] = infoObj;
    this.objs[manid].element = element;
    this.objs[manid].id = element.id;
    this.objs[manid].manid = manid;

    // Element 설정
    var g = this.globalSetupForObj;
    var o = (infoObj)? infoObj:{};
    for (var gNm in g){
        if (!o[gNm]) o[gNm] = g[gNm];
    }
    if (o){
        if (o.imgURL) element.style.background = 'url("'+ o.imgURL +'")';
        if (o.width && o.height) element.style.backgroundSize = o.width+' '+o.height;
        if (o.width) element.style.width = o.width;
        if (o.height) element.style.height = o.height;
        if (o.minWidth) element.style.minWidth = o.minWidth;
        if (o.minHeight) element.style.minHeight = o.minHeight;
        if (o.class) getEl(element).addClass(o.class);
        if (o.clazz) getEl(element).addClass(o.clazz);
        if (o.content) element.innerHTML = o.content;
    }
    element.style.left = element.offsetLeft + 'px';
    element.style.top = element.offsetTop + 'px';
    //For Chrome - https://developers.google.com/web/updates/2017/01/scrolling-intervention
    element.style.touchAction = 'none';
    this.setTestViewForObj(o, that.globalSetup);

    // DOM에 추가
    if (parentElement)
        getEl(parentElement).add(element);
    // Event 추가
    if (that.globalSetup.modeTouch){
        getEl(element).addEventListener('touchstart', function(event){ that.objStartMove(event, element); });
    }
    if (that.globalSetup.modeMouse){
        getEl(element).addEventListener('mousedown', function(event){ that.objStartMove(event, element); });
    }
    getEl(element).addEventListener('click', function(){});
    return manid;
};
BoxMan.prototype.delObj = function(param){
    var obj = this.getObj(param);
    if (!obj)
        return this;
    var element = obj.element;
    var manid = element.manid;
    delete this.objs[manid];
    element.parentNode.removeChild(element);
    return this;
};
BoxMan.prototype.delObjByBox = function(box){
    var resultObj = {};
    var boxObj = this.getBox(box);
    if (boxObj){
        var boxElement = boxObj.element;
        for (var i=0; i<boxElement.children.length; i++){
            var child = boxElement.children[i];
            if (child.getAttribute('data-obj') != null){
                this.delObj(child);
            }
        }
    }
    return this;
};


BoxMan.prototype.getObj = function(param){
    if (typeof param == 'string'){
        return this.getObjById(param);
    }else if (param instanceof Element){
        return this.getObjByEl(param);
    }else{
        var resultList = this.getObjsByCondition(param);
        if (resultList != null && resultList.length > 0)
            return resultList[0];
    }
    return;
};
BoxMan.prototype.getElementByObj = function(param){
    var objObj = this.getObj(param);
    return objObj.element;
};
BoxMan.prototype.getObjs = function(){
    return this.objs;
};
BoxMan.prototype.getObjsByCondition = function(condition){
    var resultList = [];
    var objs = this.objs;
    for (var manid in objs){
        var obj = objs[manid];
        var result = getEl(obj).find(condition);
        if (result)
            resultList.push(result);
    }
    return resultList;
};
BoxMan.prototype.getObjById = function(id){
    var objElement = document.getElementById(id);
    return this.objs[objElement.manid];
};
BoxMan.prototype.getObjByManId = function(manid){
    return this.objs[manid];
};
BoxMan.prototype.getObjByEl = function(element){
    var objs = this.objs;
    if (element && element.manid){
        var manid = element.manid;
        var obj = objs[manid];
        return obj;
    }
};
BoxMan.prototype.getObjsByBox = function(element){
    var resultObj = {};
    var boxObj = this.getBox(element);
    var boxElement = boxObj.element;
    for (var i=0; i<boxElement.children.length; i++){
        var child = boxElement.children[i];
        if (child.getAttribute('data-obj') != null){
            var manid = child.manid;
            var objObj = this.objs[manid];
            resultObj[manid] = objObj;
        }
    }
    return resultObj;
};
BoxMan.prototype.getObjListByBox = function(element){
    var resultList = [];
    var boxObj = this.getBox(element);
    var boxElement = boxObj.element;
    for (var i=0; i<boxElement.children.length; i++){
        var child = boxElement.children[i];
        if (child.getAttribute('data-obj') != null){
            var manid = child.manid;
            var objObj = this.objs[manid];
            resultList.push(objObj);
        }
    }
    return resultList;
};
BoxMan.prototype.getObjAttributeListByBox = function(element){
    var resultList = [];
    var boxObj = this.getBox(element);
    var boxElement = boxObj.element;
    for (var i=0; i<boxElement.children.length; i++){
        var child = boxElement.children[i];
        if (child.getAttribute('data-obj') != null){
            var manid = child.manid;
            var objObj = this.objs[manid];
            resultList.push(objObj.attribute);
        }
    }
    return resultList;
};



BoxMan.prototype.moveAllToOtherBox = function(fromBox, toBox){
    var elementFromBox = getEl(fromBox).returnElement();
    var elementToBox = getEl(toBox).returnElement();
    var objs = this.getObjsByBox(elementFromBox);
    for (var objName in objs){
        var elementObj = objs[objName].element;
        elementToBox.appendChild(elementObj);
    }
}
BoxMan.prototype.shellterToBox = function(toBox){
    var mvObjOriginalShelterList = this.metaObj.mvObjOriginalShelterList;
    var elementToBox = getEl(toBox).returnElement();
    for (var i=0; i<mvObjOriginalShelterList.length; i++){
        var element = mvObjOriginalShelterList[i];
        elementToBox.appendChild(element);
    }
}




/*************************************************************
 *  WHEN you start draging movable object
 *************************************************************/
BoxMan.prototype.whenMouseDown = function(event){
    console.log('mousedown> ');
    var meta = this.metaObj;
    meta.isOnMoving = false;
    meta.statusTouch = !!(event.touches);
    return true;
};

BoxMan.prototype.objStartMove = function(event, selectedObj){
    console.log('objstartmove> ');
    var meta = this.metaObj;
    if (meta.statusTouch && !event.touches)
        return true;

    var mvObj;
    /*sjHelper.cross.stopPropagation(event);*/ //잠시

    //있으면 MIE에서 이미지저장 덜 뜸
    //있으면 MFirefox에서 위아래 이동시 스크롤 되는 것 방지, 객체 이동이 원할, 대신 스크롤로직도 안됨
    //없으면 MChrome에서 스크롤판정로직이 자연스럽게 됨.  ==> 그래서 이미지는 DIV의 backgorund로 설정시키는 data-img 속성 추가로 MIE에서는 없어도 이미지저장이 안뜨게 함
    // 임시방편 : 파이어폭스에서 스크롤로직이 안되더라도  preventDefault를 실행하기
    // 파이어폭스의 특수성 때문에 따로 이벤트 처리 / ★현재 파이어폭스에서만 무빙객체의 이동취소 후 스크롤 시키는 로직이 안됨!!!ㅠ
    if (navigator.userAgent.indexOf('Firefox') != -1)
        event.preventDefault();
    /* ★ IE8에서 이벤트 넣어줄때 this라고 쓴 부분에서 윈도우 객체를 잡아다 보낸다. 그럼 NONO 할 수 없이 srcElement를 쓰고 부모님에게 묻고 물어서 data-obj가능하신지 여쭈어서 찾는다.*/
    if (selectedObj != window){
        mvObj = selectedObj;
    }else{
        var searchMovableObj = getEl(event.target).getParentEl('data-obj');
        if (searchMovableObj)
            mvObj = searchMovableObj;
    }
    meta.mvObj = mvObj;
    /*** 갈 곳 미리보기 클론 ***/
    var previewClone = this.createPreviewer(mvObj);
    getEl(previewClone).addClass('sj-preview-going-to-be-in-box');
    meta.mvObjPreviewClone = previewClone;
    meta.mvObjCloneList.push(previewClone);/* ie브라우저를 벗어나서 mouseup이벤트가 발생하지 않는 것 때문에 클론이 지워지지 않는 것 방지 */
    /*** 카피시 원본 위치도 계속 표시하기 위한 클론 ***/
    var previewOriginalClone = this.createPreviewer(mvObj);
    meta.mvObjPreviewOriginalClone = previewOriginalClone;
//    meta.mvObjCloneList.push(previewOriginalClone);
    /*** Swap, Overwrite 용 정리 ***/
    meta.mvObjOriginalShelterList = [];
    /*** 이동 전 정보 저장 ***/
    this.saveInfoBeforeMove(mvObj, event);
};

BoxMan.prototype.whenMouseMove = function(event){
    var that = this;
    var meta = this.metaObj;
    var mvObj = meta.mvObj;
    // 현재 마우스/터치 위치를 전역에 저장
    // this.setLastPos(event);
    // 모바일 터치 이벤트 시행 중... 영역에서 벗어나면 드래그 카운터 취소
    if (meta.timerObj && !this.isInBox(meta.timerObj, meta.lastPosX, meta.lastPosY))
        this.removeTimer();
    if (meta.isOnDown){
        console.log('mousemove (down)> ');
        // console.error(mvObj, meta);
        this.setLastPos(event);
        event.preventDefault();
        /*** 객체 갈 곳 미리보기 ***/
      	this.setPreviewer(mvObj, event);
        /** mvObj 이동하여 표시하기 **/
        this.setMovingState(mvObj)
    }
};
BoxMan.prototype.whenMouseUp = function (event){
    console.log('mouseup> ');
    var meta = this.metaObj;
    var mvObj = meta.mvObj;
    /* 객체이동 준비 취소 */
    this.removeTimer();
    /* 이동객체 상태 취소 */
    if (meta.isOnDown){
        console.log('mouseup (down)> ');
        getEl(mvObj).removeClass('sj-obj-is-on-moving');
        meta.isOnDown = false;
    }
    /*** 아래는 이동중이던 객체에게 적용 ***/
    if (meta.isOnMoving){
        console.log('mouseup (moving)> ');
        // mvObj가 이동할 박스객체 하나 선정
        var objInfo = this.getObj(mvObj);
        var decidedBox = this.getDecidedBox(mvObj, this.boxObjs, meta.lastPosX, meta.lastPosY);
        decidedBox = (decidedBox) ? decidedBox : (this.globalSetup.defaultBox) ? this.globalSetup.defaultBox : document.body;
        /*** 객체 갈 곳 미리보기 지우기 ***/
        this.deletePreviewer();
        this.deleteOriginalClonePreviewer();
        // 결정된 박스에 mvObj넣기
        this.moveObjTo(mvObj, decidedBox);
        mvObj.style.zIndex = meta.mvObjBeforeIndex;

        //- 무조건박스모드시, 박스결정 안나면 지워
        if (objInfo.modeRemoveOutOfBox && decidedBox == document.body)
            this.delObj(mvObj);

        // if (meta.additionalStartPosLeft != 0 || meta.additionalStartPosTop != 0){
        //     mvObj.style.left = (parseInt(mvObj.style.left) - meta.additionalStartPosLeft) +'px';
        //     mvObj.style.top = (parseInt(mvObj.style.top) - meta.additionalStartPosTop) +'px';
        // }

        // init
        mvObj = null;
    }

    meta.statusTouch =  false;
    // window.blockMenuHeaderScroll = false;
    return;
};







BoxMan.prototype.getDecidedBox = function(mvObj, boxObjs, lastPosX, lastPosY){
    var mvObjOnThisBoxObjs = [];
    var decidedBox;
    var decidedBoxLevel = 0;
    var decidedFixedBox;
    var decidedFixedBoxLevel = 0;
    var decidedPopManIndex = 0;
    /** 현재 마우스 위치의 박스객체 모으기 **/
    lastPosX -= getEl().getBodyScrollX();
    lastPosY -= getEl().getBodyScrollY();
    for (var boxNm in boxObjs){
        var element = boxObjs[boxNm].element;
        // console.error('>>', element.id, element);
        if(this.isInBox(element, lastPosX, lastPosY) && mvObj != element){
            mvObjOnThisBoxObjs.push(element);
        }
    }
    // console.error('>>>>>', mvObjOnThisBoxObjs);

    // console.log('get boxes: ', mvObjOnThisBoxObjs);
    /** 들어갈 박스 선정 **/
    for (var i=0; i<mvObjOnThisBoxObjs.length; i++){
        var parentElement = mvObjOnThisBoxObjs[i].parentNode;
        var domLevel = 0;
        var stopFlag = false;
        var flagIsFixed = false;
        var popManIndex = 0; //POPMAN과 연계
        /* 자신이  fixed이면 flagIsFixed=true */
        if (mvObjOnThisBoxObjs[i].style.position=='fixed')
            flagIsFixed = true;

        /* 상자의 domtree단계?? 파악하기 */
        while (parentElement){
            // 박스가 mvObj의 자식이면 건너뛰기
            if (parentElement == mvObj){
                stopFlag=true;
                // console.log('뭣???');
                break;
            }
            // 부모의 영역에 가려진 부분이면 건너뛰기
            if (!this.isInBox(parentElement, lastPosX, lastPosY)
            && parentElement != document.body
            && parentElement != document.body.parentNode
            && parentElement != document.body.parentNode.parentNode){
                stopFlag=true;
                // console.debug('뭣???!!!!', parentElement, lastPosX, lastPosY);
                // console.debug(parentElement, parentElement.scrollTop +'<'+ lastPosY +'<'+ (parentElement.offsetHeight + parentElement.scrollTop) );
                // var a = getEl(parentObj).getBoundingClientRect();
                // console.debug(a.left, a.top);
                break;
            }
            // 조상 중에  fixed가 있다면 flagIsFixed=true
            if (parentElement.style && parentElement.style.position=='fixed'){
                flagIsFixed = true;
                break;
            }
            // POPMAN과 연계
            if (this.isPropManObj(parentElement)){
                popManIndex = parentElement.popIndex;
            }
            parentElement = parentElement.parentNode;
            domLevel++;
            // POPMAN과 연계
            if (parentElement && parentElement.getAttribute && parentElement.getAttribute('data-pop') != null){
                popManIndex = parentElement.popIndex;
            }
        }

        /* 박스가 mvObj의 자식이면 건너뛰기 */
        if (stopFlag){
            // console.debug('스탑', parentElement, this.isInBox(parentElement, lastPosX, lastPosY));
            continue;
        }

        /* POPMAN연계*/
        if (decidedPopManIndex < popManIndex) {
            decidedPopManIndex = popManIndex;
            decidedBoxLevel = domLevel;
            decidedBox = mvObjOnThisBoxObjs[i];
        }else if (decidedPopManIndex == popManIndex){
            // console.debug('같네', decidedPopManIndex, popManIndex)
        }else{
            // console.debug('뭐디', decidedPopManIndex, popManIndex)
            continue;
        }
        // console.debug('AAAAA', decidedBox, parentElement, domLevel, stopFlag);

        /* 중첩된 상자들 중에서 domtree단계가 가장 깊은 것으로 결정하기 */
        /* fixed된 객체에 우선권을 주기위해 fixed객체이거나 그의 자손일 때 따로 저장 */
        if (flagIsFixed){
            if (decidedFixedBoxLevel < domLevel){
                decidedFixedBoxLevel = domLevel;
                decidedFixedBox = mvObjOnThisBoxObjs[i];
            }
        /* 일반의 경우 저장 */
        }else{
            if (decidedBoxLevel < domLevel){
                decidedBoxLevel = domLevel;
                decidedBox = mvObjOnThisBoxObjs[i];
            }
        }
        // console.debug('OKOKOK', decidedBox, parentElement, domLevel, stopFlag);
    }
    return (decidedFixedBox) ? decidedFixedBox : decidedBox;
};
BoxMan.prototype.getMovableObjCount = function(box){
    var objCount = 0;
    if (box){
        for (var j=0; j<box.children.length; j++){
            var isMovableObj = box.children[j].getAttribute('data-obj');
            if (isMovableObj != null && isMovableObj != undefined && isMovableObj != 'false'){
                objCount++;
            }
        }
    }
    return objCount;
};
BoxMan.prototype.getMovableObj = function(box, event){
    var meta = this.metaObj;
    if (box){
        for (var j=0; j<box.children.length; j++){
            var obj = box.children[j];
            var isMovableObj = obj.getAttribute('data-obj');
            var isMovablePreviewer = obj.getAttribute('data-obj-previewer');
            if (isMovablePreviewer != null || (isMovableObj != null && isMovableObj != undefined && isMovableObj != 'false')){
                // var offset = getEl(obj).getBoundingClientRect();
                // console.log(offset, meta.lastPosY);
                if (this.isInBox(obj, meta.lastPosX, meta.lastPosY)){
                    return obj;
                }
            }
        }
    }
    return;
};





BoxMan.prototype.saveInfoBeforeMove = function(mvObj, event){
    var that = this;
    var meta = this.metaObj;
    meta.mvObjBeforeBox = mvObj.parentNode;
    meta.mvObjBeforeIndex = mvObj.style.zIndex;
    meta.mvObjBeforePosition = mvObj.style.position;
    meta.mvObjBeforeNextSibling = mvObj.nextSibling;
    meta.mvObjStartBodyOffset = getEl(mvObj).getBoundingOffsetRect(); // body관점에서 대상객체의 offset
    mvObj.style.zIndex = getData().findHighestZIndex(['div']) + 1; // 이동객체에 가장 높은 zIndex 설정
    meta.lastGoingToBeInThisBox = meta.mvObjBeforeBox;


    meta.mode.clear().merge(this.globalSetup);
    var beforeBox = this.getBox(meta.mvObjBeforeBox);
    if (beforeBox)
        meta.mode.merge(beforeBox.mode);

    // meta.mode.clear()
    //     .merge(this.globalSetup)
    //     .merge(this.getBox(meta.mvObjBeforeBox).mode);

    //TODO: 이거 왜 하고 있는거냐?
    if (mvObj.parentNode != document.body){
        var o = this.findAbsoluteParentEl(mvObj);
        var offset = getEl(o).getBoundingOffsetRect();
        meta.additionalStartPosLeft = offset.left;
        meta.additionalStartPosTop = offset.top;
        // console.debug(offset.left, offset.top, mvObj, o, offset);
    }else{
        meta.additionalStartPosLeft = 0;
        meta.additionalStartPosTop = 0;
    }

    this.setLastPos(event); // 현재 마우스/터치 위치를 전역에 저장

    /* Mobile Control */
    if (event.touches != undefined){
        meta.timerObj = event.touches[0].target;
        this.removeTimer();
        meta.timer = setInterval(function(){
            meta.timerTime += 100; /* 100밀리세컨드 단위로 흐르는 시간 */
            if (meta.timerTime >= that.globalSetup.timeForReadyToDragOnMobile){
                event.preventDefault(event);       //MCHROME에서 이게 있어야함. MIE에선 이게 있으면 안됨... 아 모르겠다.
                // window.blockMenuHeaderScroll = true;
                getEl(meta.mvObj).addClass('sj-obj-is-on-moving');
                meta.isOnDown = true;
                meta.isOnMoving = false;
                clearTimeout(meta.timer);
                meta.timerTime = 0;
                // console.error('check setTimer', meta.isOnDown, meta.isOnMoving);
            }
        }, 100);
        /* mvObj.adjust = mouseDown을 시작한 곳과 대상객체의 offset과의 거리 */
        mvObj.adjustX = event.touches[0].pageX - meta.mvObjStartBodyOffset.left;
        mvObj.adjustY = event.touches[0].pageY - meta.mvObjStartBodyOffset.top;
    /* Web Control */
    }else{
        /* mvObj.adjust = mouseDown을 시작한 곳과 대상객체의 offset과의 거리 */
        // mvObj.adjustX = event.clientX - meta.mvObjStartBodyOffset.left + getEl().getBodyScrollX();
        // mvObj.adjustY = event.clientY - meta.mvObjStartBodyOffset.top + getEl().getBodyScrollY();
        mvObj.adjustX = event.clientX - meta.mvObjStartBodyOffset.left;
        mvObj.adjustY = event.clientY - meta.mvObjStartBodyOffset.top;
        /* mvObj의 이동을 허가하는  표시와 설정 */
        // getEl(mvObj).addClass('sj-obj-is-on-moving'); //TODO: 이동을 시작할 때 붙여보자.
        meta.isOnDown = true;
        meta.isOnMoving = false;
    }
    // mvObj.adjustX -= meta.additionalStartPosLeft;
    // mvObj.adjustY -= meta.additionalStartPosTop;
};
BoxMan.prototype.setMovingState = function(mvObj){
    var meta = this.metaObj;
    var lastPosX = meta.lastPosX;
    var lastPosY = meta.lastPosY;
    this.resize();
    var cam = meta.cam;
    var dan = 'px';
    /** X축 이동하기 **/
    if (lastPosX - mvObj.adjustX >= 1 && lastPosX - mvObj.adjustX + mvObj.offsetWidth <= cam.w){
        mvObj.style.left = (lastPosX - mvObj.adjustX) + dan;
    }else{
        /* X축 이동 제한*/
        if (lastPosX - mvObj.adjustX < 1)
            mvObj.style.left = 0 + dan;
        if (lastPosX - mvObj.adjustX + mvObj.offsetWidth > cam.w)
            mvObj.style.left = (cam.w - mvObj.offsetWidth) + dan;
    }
    /** Y축 이동하기 **/
    if (lastPosY - mvObj.adjustY >= 1 && lastPosY - mvObj.adjustY + mvObj.offsetHeight <= cam.h){
        mvObj.style.top = (lastPosY - mvObj.adjustY) + dan;
    }else{
        /* Y축 이동 제한 */
        if (lastPosY - mvObj.adjustY < 1)
            mvObj.style.top = 0 + dan;
        if (lastPosY - mvObj.adjustY + mvObj.offsetHeight > cam.h){
            mvObj.style.top = (cam.h - mvObj.offsetHeight) + dan;
        }
    }

    /** mvObj 이동중인 상태를 적용 **/
    mvObj.style.position = 'absolute';
    mvObj.style.float = '';
    getEl(mvObj).addClass('sj-obj-is-on-moving');
    // getEl(meta.mvObjBeforeBox).add(mvObj);
    getEl(document.body).add(mvObj);

    /* 이동시 크기변이 또는 해당Layout의 scroll계산의 까다로움으로 인하여 mvObj의 영역에 마우스가 위치하지 않는 경우 마우스를 0점 위치로 */
    if (!meta.isOnMoving) {
        if (mvObj.adjustX > mvObj.offsetWidth || mvObj.adjustX < 0)
            mvObj.adjustX = mvObj.offsetWidth;
        if (mvObj.adjustY > mvObj.offsetHeight || mvObj.adjustY < 0)
            mvObj.adjustY = mvObj.offsetHeight;
    }

    /* 이동중 확정 */
    meta.isOnMoving = true;
};
BoxMan.prototype.moveObjTo = function(mvObj, boxEl){
    var meta = this.metaObj;
    var mode = meta.mode;
    var copyEl;
    var mvObjBeforeBox = meta.mvObjBeforeBox;
//    var mvObjBeforeNextSibling = meta.mvObjBeforeNextSibling;
//    var mvObjBeforePosition = meta.mvObjBeforePosition;
//    var mvObjStartBodyOffset = meta.mvObjStartBodyOffset;
    var mvObjPreviewClone = meta.mvObjPreviewClone;
    var previewOriginalClone = meta.mvObjPreviewOriginalClone;
    var bfBoxInfo = this.getBox(mvObjBeforeBox);
    var afBoxInfo = this.getBox(boxEl);
    var objInfo = this.getObj(mvObj);

    var isFromBox = (bfBoxInfo != undefined);
    var isToBox = (afBoxInfo != undefined);
    var isSameBox = ( bfBoxInfo == afBoxInfo );
    var canEnter = false;
    // Set Mode (Global Set < BeforeBox Set < AfterBoxCondition Set < AfterObjCondition Set)
    if (isToBox){
        var boxConditionData = this.getConditionData(bfBoxInfo, afBoxInfo.conditionbox);
        var objConditionData = this.getConditionData(objInfo, afBoxInfo.conditionobj);
        mode.merge(boxConditionData);
        mode.merge(objConditionData);
        canEnter = ( afBoxInfo.limit > this.getMovableObjCount(boxEl) || afBoxInfo.limit == undefined );
    }
    var appendType = mode.get('appendType');
    var modeRemoveOutOfBox = mode.get('modeRemoveOutOfBox');
    var modeOnlyBoxToBox = mode.get('modeOnlyBoxToBox');
    var modeCopy = mode.get('modeCopy');

    var isTypeBetween = ( appendType == BoxMan.APPEND_TYPE_BETWEEN );
    var isRollback = ( !isTypeBetween && (isSameBox || !canEnter) );
    var isRollback2 = ( isTypeBetween && !canEnter && !isSameBox );
    // var isRollbackWithEvent = (isToBox && boxEl.executeEventBeforeboxin && !boxEl.executeEventBeforeboxin(boxEl, mvObj, this.getMovableObjCount(mvObjBeforeBox)));
    // var isRollbackWithEvent = (isToBox && boxEl.executeEventBeforeboxin && !boxEl.executeEventBeforeboxin( {box:boxEl, obj:mvObj, boxSize:this.getMovableObjCount(mvObjBeforeBox)} ));
    var isRollbackWithEvent = (isToBox && this.hasEventListener(boxEl, 'beforeboxin') && !this.execEventListener(boxEl, 'beforeboxin', {box:boxEl, obj:mvObj, boxSize:this.getMovableObjCount(mvObjBeforeBox)} ));
    var isRemoveOutOfBox = ( modeRemoveOutOfBox && !isToBox && !isSameBox);
    var isNotOnlyToBox = ( modeOnlyBoxToBox && !isToBox && isFromBox);
    var isAcceptedBox = ( !isToBox || getEl(bfBoxInfo).isAccepted(afBoxInfo.acceptbox, afBoxInfo.rejectbox) );
    var isAcceptedObj = ( !isToBox || getEl(objInfo).isAccepted(afBoxInfo.acceptobj, afBoxInfo.rejectobj) );

    var flagBeforeBoxEvent = false;
    var flagAfterBoxEvent = false;
    var isMoved = false;

    // 다시 같은 상자면 원위치, 이동을 허가하지 않은 상자면 원위치
    if ( isRollback || isRollbackWithEvent || isNotOnlyToBox || !isAcceptedBox || !isAcceptedObj){
        if (!isToBox){
            if (isRemoveOutOfBox){ //TODO: modeRemoveOutOfBox = true일 때
                this.delObj(mvObj);
                return;

            }else if (!modeOnlyBoxToBox){ //TODO: 임시로 여기서 ==> modeOnlyBoxToBox = false일 때
                // console.error('Go to Out ??22');
                //Move Moment
                this.goTo(mvObj, boxEl, appendType, mvObjPreviewClone);
                if (mode.get('modeDefaultAbsolute')){
                    mvObj.style.position = 'absolute';
                }
                flagBeforeBoxEvent = true;
                flagAfterBoxEvent = true;
                isMoved = true;
            }else{
                this.backToBefore(mvObj, mvObjBeforeBox, appendType);
            }
        }else{
            this.backToBefore(mvObj, mvObjBeforeBox, appendType);
        }

    // 이동전 수행 펑션 true면 통과
    }else{
        // 다른 박스로 이동
        if (boxEl){
            //Back Up Moment
            if (isRollback2){
                this.backToBefore(mvObj, mvObjBeforeBox, appendType);
                return;
            }
            //Copy Moment
            var mvTarget;
            if (modeCopy && appendType != BoxMan.APPEND_TYPE_SWAP && !isSameBox){
                copyEl = this.clone(mvObj);
                mvTarget = copyEl;
                this.backToBefore(mvObj, mvObjBeforeBox, appendType);
            }else{
                mvTarget = mvObj;
            }
            //Before Move Moment
            if (appendType == BoxMan.APPEND_TYPE_OVERWRITE && !isSameBox){
                this.clearBox(boxEl);
            }else if (appendType == BoxMan.APPEND_TYPE_SWAP && !isSameBox && canEnter){
//                this.moveAllToOtherBox(boxEl, mvObjBeforeBox);
                this.shellterToBox(mvObjBeforeBox);
            }else{
            }
            //Move Moment
            this.goTo(mvTarget, boxEl, appendType, mvObjPreviewClone);
            flagBeforeBoxEvent = true;
            flagAfterBoxEvent = true;
            isMoved = true;
        // 허공에서 허공으로 이동
        }else{
            // console.error('Go to Out ??');
            meta.mvObjBeforeBox.appendChild(mvObj);

        }
    }

    // 결정된 박스에 mvObj넣기 (밖 허가 안되면 위치 원상 복구, 허가면 이전 박스의 박스아웃 이벤트 발생)
    // 이벤트 실행(박스객체, 이동객체, 박스안 이동객체 수)
    if ( flagBeforeBoxEvent || (!isNotOnlyToBox && isToBox) ){
        var bBoxCnt = this.getMovableObjCount(mvObjBeforeBox);
        // if (mvObjBeforeBox.executeEventMustDo) mvObjBeforeBox.executeEventMustDo();
        // if (mvObjBeforeBox.executeEventBoxinout) mvObjBeforeBox.executeEventBoxinout( {boxel:boxEl, obj:mvObj, boxSize:bBoxCnt, boxBefore:mvObjBeforeBox} );
        // if (mvObjBeforeBox.executeEventBoxout) mvObjBeforeBox.executeEventBoxout( {boxel:boxEl, obj:mvObj, boxSize:bBoxCnt, boxBefore:mvObjBeforeBox} );
        if (this.hasEventListener(mvObjBeforeBox, 'mustdo'))
            this.execEventListener(mvObjBeforeBox, 'mustdo');
        if (this.hasEventListener(mvObjBeforeBox, 'boxinout'))
            this.execEventListener(mvObjBeforeBox, 'boxinout', {boxel:boxEl, obj:mvObj, copyObj:copyEl, boxSize:bBoxCnt, boxBefore:mvObjBeforeBox, data:objInfo});
        if (this.hasEventListener(mvObjBeforeBox, 'boxout'))
            this.execEventListener(mvObjBeforeBox, 'boxout', {boxel:boxEl, obj:mvObj, copyObj:copyEl, boxSize:bBoxCnt, boxBefore:mvObjBeforeBox, data:objInfo});
        if (this.hasEventListener(mvObjBeforeBox, 'swappedin') && this.metaObj.mvObjOriginalShelterList.length > 0)
            this.execEventListener(mvObjBeforeBox, 'swappedin', {boxel:mvObjBeforeBox, obj:this.metaObj.mvObjOriginalShelterList, boxBefore:boxEl});
    }
    if ( flagAfterBoxEvent ){
        var boxCnt = this.getMovableObjCount(boxEl);
        // if (boxEl.executeEventMustDo) boxEl.executeEventMustDo();
        // if (boxEl.executeEventBoxinout) boxEl.executeEventBoxinout( {boxel:boxEl, obj:mvObj, boxSize:boxCnt, boxBefore:mvObjBeforeBox} );
        // if (boxEl.executeEventBoxin) boxEl.executeEventBoxin( {boxel:boxEl, obj:mvObj, boxSize:boxCnt, boxBefore:mvObjBeforeBox} );
        if (this.hasEventListener(boxEl, 'mustdo'))
            this.execEventListener(boxEl, 'mustdo');
        if (this.hasEventListener(boxEl, 'boxinout'))
            this.execEventListener(boxEl, 'boxinout', {boxel:boxEl, obj:mvObj, copyObj:copyEl, boxSize:boxCnt, boxBefore:mvObjBeforeBox, data:objInfo});
        if (this.hasEventListener(boxEl, 'boxin')){
            this.execEventListener(boxEl, 'boxin', {boxel:boxEl, obj:mvObj, copyObj:copyEl, boxSize:boxCnt, boxBefore:mvObjBeforeBox, data:objInfo});
        }
        if (this.hasEventListener(boxEl, 'swappedout'))
            this.execEventListener(boxEl, 'swappedout', {boxel:mvObjBeforeBox, obj:this.metaObj.mvObjOriginalShelterList, boxBefore:boxEl});
    }
    /* 초기화 */
    mvObj = null;
    return isMoved;
};
BoxMan.prototype.goTo = function(mvObj, boxEl, appendType, mvObjPreviewClone){
    //APPEND_TYPE_LAST
    if (appendType == BoxMan.APPEND_TYPE_LAST){
        boxEl.appendChild(mvObj);
    //APPEND_TYPE_FIRST
    }else if (appendType == BoxMan.APPEND_TYPE_FIRST){
        boxEl.insertBefore(mvObj, boxEl.firstChild);
    //APPEND_TYPE_BETWEEN
    }else if (appendType == BoxMan.APPEND_TYPE_BETWEEN){
        var mousePosObj = this.getMovableObj(boxEl, event);
        if (mousePosObj){
            if (mousePosObj == mvObjPreviewClone.nextSibling){
                boxEl.insertBefore(mvObj, mousePosObj.nextSibling);
            } else if (mousePosObj != mvObjPreviewClone){
                boxEl.insertBefore(mvObj, mousePosObj);
            }
        }else{
            boxEl.appendChild(mvObj);
        }
    //APPEND_TYPE_OVERWRITE
    }else if (appendType == BoxMan.APPEND_TYPE_OVERWRITE){
        boxEl.appendChild(mvObj);
    //APPEND_TYPE_SWAP
    }else if (appendType == BoxMan.APPEND_TYPE_SWAP){
        boxEl.appendChild(mvObj);
    //APPEND_TYPE_INVISIBLE
    }else if (appendType == BoxMan.APPEND_TYPE_INVISIBLE){
    }
    mvObj.style.position = '';
};
BoxMan.prototype.backToBefore = function(mvObj, boxEl, appendType, modeCopy){
    if (modeCopy && appendType != BoxMan.APPEND_TYPE_SWAP)
        return;
    var meta = this.metaObj;
    var mvObjBeforeNextSibling = meta.mvObjBeforeNextSibling;
    var mvObjBeforePosition = meta.mvObjBeforePosition;
    var mvObjStartBodyOffset = meta.mvObjStartBodyOffset;
    boxEl.insertBefore(mvObj, mvObjBeforeNextSibling);
    mvObj.style.position = (mvObjBeforePosition == 'absolute') ? 'absolute':'';
    if (mvObjBeforePosition == 'absolute'){
        mvObj.style.left = mvObjStartBodyOffset.x +'px';
        mvObj.style.top = mvObjStartBodyOffset.y +'px';
        mvObj.style.float = ''; //??왜 플롯을??
    }
};
BoxMan.prototype.originalCopyBackToBefore = function(mvObj, boxEl, appendType, modeCopy){
    if (modeCopy && appendType != BoxMan.APPEND_TYPE_SWAP){
        if (mvObj.parentNode != boxEl){
            if (!modeCopy || appendType == BoxMan.APPEND_TYPE_SWAP)
                return;
            var meta = this.metaObj;
            var mvObjBeforeNextSibling = meta.mvObjBeforeNextSibling;
            var mvObjBeforePosition = meta.mvObjBeforePosition;
            var mvObjStartBodyOffset = meta.mvObjStartBodyOffset;
            boxEl.insertBefore(mvObj, mvObjBeforeNextSibling);
            mvObj.style.position = (mvObjBeforePosition == 'absolute') ? 'absolute' : '';
            if (mvObjBeforePosition == 'absolute'){
                mvObj.style.left = mvObjStartBodyOffset.x +'px';
                mvObj.style.top = mvObjStartBodyOffset.y +'px';
                mvObj.style.float = ''; //??왜 플롯을??
            }
        }
    }else{
        if (mvObj.parentNode)
            mvObj.parentNode.removeChild(mvObj);
    }
};





BoxMan.prototype.createPreviewer = function(mvObj){
    var meta = this.metaObj;
    var mvObjPreviewClone = mvObj.cloneNode(true);
    mvObjPreviewClone.setAttribute('data-obj', 'false'); //undefined, null, true, false를 지정하면 조건식에서 정상적으로 작동을 안함. 스트링으로
    mvObjPreviewClone.setAttribute('data-obj-previewer', 'true');
    mvObjPreviewClone.style.position = "";
    return mvObjPreviewClone;
};
BoxMan.prototype.setPreviewer = function(mvObj, event){
    var meta = this.metaObj;
    var mode = meta.mode.clone();
    var lastGoingToBeInThisBox = meta.lastGoingToBeInThisBox;
    var mvObjPreviewClone = meta.mvObjPreviewClone;
    var previewOriginalClone = meta.mvObjPreviewOriginalClone;
    var mvObjBeforeBox = meta.mvObjBeforeBox;
    /** 가는 위치 미리 보여주기 **/
    var goingToBeInThisBox = this.getDecidedBox(mvObj, this.boxObjs, meta.lastPosX, meta.lastPosY);
    var boxEl = (goingToBeInThisBox) ? goingToBeInThisBox : (this.globalSetup.defaultBox) ? this.globalSetup.defaultBox : document.body;
    var bfBoxInfo = this.getBox(mvObjBeforeBox);
    var afBoxInfo = this.getBox(boxEl);
    var objInfo = this.getObj(mvObj);

    var isFromBox = (bfBoxInfo != undefined);
    var isToBox = (afBoxInfo != undefined);
    var isSameBox = ( bfBoxInfo == afBoxInfo );
    var canEnter = false;
    // Set Mode (Global Set < BeforeBox Set < AfterBoxCondition Set < AfterObjCondition Set)
    if (isToBox){
        var boxConditionData = this.getConditionData(bfBoxInfo, afBoxInfo.conditionbox);
        var objConditionData = this.getConditionData(objInfo, afBoxInfo.conditionobj);
        mode.merge(boxConditionData);
        mode.merge(objConditionData);
        canEnter = ( afBoxInfo.limit > this.getMovableObjCount(boxEl) || afBoxInfo.limit == undefined );
    }
    var appendType = mode.get('appendType');
    meta.mvObjAppendTypeBefore = appendType;
    var modeRemoveOutOfBox = mode.get('modeRemoveOutOfBox');
    var modeOnlyBoxToBox = mode.get('modeOnlyBoxToBox');
    var modeCopy = mode.get('modeCopy');

    var isTypeBetween = ( appendType == BoxMan.APPEND_TYPE_BETWEEN );
    var isRollback = ( !isTypeBetween && (isSameBox || !canEnter) );
    var isRollback2 = ( isTypeBetween && !canEnter && !isSameBox );
    // var isRollbackWithEvent = (isToBox && boxEl.executeEventBeforeboxin && !boxEl.executeEventBeforeboxin(boxEl, mvObj, this.getMovableObjCount(mvObjBeforeBox)));
    // var isRollbackWithEvent = (isToBox && boxEl.executeEventBeforeboxin && !boxEl.executeEventBeforeboxin( {box:boxEl, obj:mvObj, boxSize:this.getMovableObjCount(mvObjBeforeBox)} ));
    // var isRollbackWithEvent = (isToBox && this.hasEventListener(boxEl, 'beforeboxin') && !this.execEventListener(boxEl, 'beforeboxin', {box:boxEl, obj:mvObj, boxSize:this.getMovableObjCount(mvObjBeforeBox)} ));
    var isRemoveOutOfBox = ( modeRemoveOutOfBox && !isToBox && !isSameBox);
    var isNotOnlyToBox = ( !isTypeBetween && modeOnlyBoxToBox && !isToBox && isFromBox);
    var isAcceptedBox = ( !isToBox || getEl(bfBoxInfo).isAccepted(afBoxInfo.acceptbox, afBoxInfo.rejectbox) );
    var isAcceptedObj = ( !isToBox || getEl(objInfo).isAccepted(afBoxInfo.acceptobj, afBoxInfo.rejectobj) );

    // 갈 곳 미리보기 효과 (클론 효과)
    /** 원위치로 지정 **/
    if (isRollback || isNotOnlyToBox || !isAcceptedBox || !isAcceptedObj){
        // console.log(isRollback, isNotOnlyToBox, 'ACCPETBOX:'+isAcceptedBox, 'ACCPETOBJ:'+isAcceptedObj, 'TOBOX:'+isToBox, 'FROMBOX:'+isFromBox, modeRemoveOutOfBox, isSameBox, isToBox);
        if (!isToBox){
            if (!isSameBox){
                if (modeRemoveOutOfBox){ //TODO: modeRemoveOutOfBox = true일 때
                    if (mvObjPreviewClone.parentNode)
                        mvObjPreviewClone.parentNode.removeChild(mvObjPreviewClone);
                    this.originalCopyBackToBefore(previewOriginalClone, mvObjBeforeBox, appendType, modeCopy);
                    this.overWriteAndSwapPreview(goingToBeInThisBox, appendType);
                    meta.lastGoingToBeInThisBox = goingToBeInThisBox;
                    // console.log('Back!!! Remove OBJECT Out Of Box');
                    return;
                }
                if (!modeOnlyBoxToBox){ //TODO: 임시로 여기서 ==> modeOnlyBoxToBox = false일 때
                    // console.log('Out Of Box', mode.get('modeDefaultAbsolute'), mvObjPreviewClone.style.position, mvObjPreviewClone.style.left, mvObjPreviewClone.style.top);
                    if (mode.get('modeDefaultAbsolute')){
                        this.deletePreviewer()
                    }else{
                        this.goTo(mvObjPreviewClone, boxEl, appendType, mvObjPreviewClone, mvObjPreviewClone.style.position);
                    }
                    meta.lastGoingToBeInThisBox = boxEl;
                    return;
                }
            }
        }
        //
        if (!isAcceptedBox || !isAcceptedObj){
            // meta.lastGoingToBeInThisBox = goingToBeInThisBox;
            this.originalCopyBackToBefore(previewOriginalClone, mvObjBeforeBox, appendType, modeCopy);
            this.overWriteAndSwapPreview(goingToBeInThisBox, appendType);
            meta.lastGoingToBeInThisBox = goingToBeInThisBox;
            this.backToBefore(mvObjPreviewClone, mvObjBeforeBox, appendType, modeCopy);
            // console.log('Back!!! Rejected');
            return;
        }
        this.originalCopyBackToBefore(previewOriginalClone, mvObjBeforeBox, appendType, modeCopy);
        this.overWriteAndSwapPreview(goingToBeInThisBox, appendType);
        meta.lastGoingToBeInThisBox = goingToBeInThisBox;
        this.backToBefore(mvObjPreviewClone, mvObjBeforeBox, appendType, modeCopy);
        // console.log('Back!!!');
        return;
    }

    /** 갈 예정인 박스안 지정 **/
    if (boxEl){
        // console.log('Box In ');
        //Back Up Moment
        if (isRollback2){
            this.backToBefore(mvObjPreviewClone, mvObjBeforeBox, appendType, modeCopy);
            meta.lastGoingToBeInThisBox = goingToBeInThisBox;
            return;
        }
        var mvTarget;
        //Before Move Moment
        if (appendType == BoxMan.APPEND_TYPE_OVERWRITE && !isSameBox){
            this.originalCopyBackToBefore(previewOriginalClone, mvObjBeforeBox, appendType, modeCopy);
            if (modeCopy && mvObjPreviewClone.parentNode)
                mvObjPreviewClone.parentNode.removeChild(mvObjPreviewClone);
            this.overWriteAndSwapPreview(goingToBeInThisBox, appendType);
        }else if (appendType == BoxMan.APPEND_TYPE_SWAP && !isSameBox && canEnter){
            this.originalCopyBackToBefore(previewOriginalClone, mvObjBeforeBox, appendType, modeCopy);
            this.overWriteAndSwapPreview(goingToBeInThisBox, appendType);
        }else{
            this.originalCopyBackToBefore(previewOriginalClone, mvObjBeforeBox, appendType, modeCopy);
        }
        //Move Moment
        this.goTo(mvObjPreviewClone, goingToBeInThisBox, appendType, mvObjPreviewClone);
        // 박스 밖으로 갈 예정
    }else{
        // console.log('Out Of Box ');
        if (lastGoingToBeInThisBox)
            getEl(lastGoingToBeInThisBox).removeClass('sj-tree-box-to-go');
        if (mvObjPreviewClone.parentNode)
            mvObjPreviewClone.parentNode.removeChild(mvObjPreviewClone);
        this.overWriteAndSwapPreview(goingToBeInThisBox, appendType);
    }
    meta.lastGoingToBeInThisBox = goingToBeInThisBox;

};
BoxMan.prototype.deletePreviewer = function(){
    // var getEl = this.getEl;
    var meta = this.metaObj;
    var mvObjPreviewClone = meta.mvObjPreviewClone;
    var mvObjCloneList = meta.mvObjCloneList;
    /** 미리보기를 위한 mvObj클론 없애기 **/
    if (mvObjPreviewClone && mvObjPreviewClone.parentNode) {
        mvObjPreviewClone.parentNode.removeChild(mvObjPreviewClone);
        mvObjPreviewClone = undefined;
    }
    /** IE브라우저 밖에서 mouseup해도 이벤트 발생이 되지 않아서 클론이 안 지워지는 것 방지 **/
    for (var pp=0; pp<mvObjCloneList.length; pp++){
        if (mvObjCloneList[pp].parentNode){
            mvObjCloneList[pp].parentNode.removeChild(mvObjCloneList[pp]);
        }
    }
    /** 다시 정의하면 기존 메모리에 할당된건 지워주게지? **/
    if (mvObjCloneList.length > 10)
        meta.mvObjCloneList = [];
};
BoxMan.prototype.deleteOriginalClonePreviewer = function(){
    var meta = this.metaObj;
    var mvObjPreviewOriginalClone = meta.mvObjPreviewOriginalClone;
    if (mvObjPreviewOriginalClone.parentNode)
        mvObjPreviewOriginalClone.parentNode.removeChild(mvObjPreviewOriginalClone);
};



BoxMan.prototype.overWriteAndSwapPreview = function(goingToBeInThisBox, appendType){
    var meta = this.metaObj;
    if (meta.lastGoingToBeInThisBox != goingToBeInThisBox){
        //1.기존toBox에서 백업되었던 것 원위치
        for (var i = 0; i < meta.mvObjOriginalShelterList.length; i++) {
            var el1 = meta.mvObjOriginalShelterList[i];
            meta.mvObjOriginalBox.appendChild(el1);
            // console.log(meta.mvObjOriginalBox, el1);
        }
        //2.미리보기 지우기
        this.deletePreviewer();
        if (meta.mvObjAppendTypeBefore != BoxMan.APPEND_TYPE_SWAP && meta.mvObjAppendTypeBefore  != BoxMan.APPEND_TYPE_OVERWRITE)
            return;
        //3.새toBox가 상자이면, 안의 OBJECT들을 백업하여 fromBox에 미리보기로 보여주기.
        if (goingToBeInThisBox && goingToBeInThisBox != meta.mvObjBeforeBox) {
            meta.mvObjOriginalBox = goingToBeInThisBox;
            meta.mvObjOriginalShelterList = [];
            var objs = this.getObjsByBox(goingToBeInThisBox);
            if (objs){
                //-새toBox원본 백업
                for (var objName in objs){
                    var obj = objs[objName];
                    if (obj)
                        meta.mvObjOriginalShelterList.push(obj.element);
                }
                //-새toBox원본 지우기
                this.clearBox(goingToBeInThisBox);

                if (appendType == BoxMan.APPEND_TYPE_SWAP) {
                    //fromBox에 toBox백업본으로 미리보기
                    for (var i = 0; i < meta.mvObjOriginalShelterList.length; i++) {
                        var objElement = meta.mvObjOriginalShelterList[i];
                        var previewOriginalClone = this.createPreviewer(objElement);
                        meta.mvObjCloneList.push(previewOriginalClone);
                        meta.mvObjBeforeBox.appendChild(previewOriginalClone);
                    }
                }else if (appendType == BoxMan.APPEND_TYPE_OVERWRITE) {
                }
            }
        }
    }
};



/*****
 * 기타 공통 모듈
 *****/
// /* 모바일여부 확인 */
// BoxMan.prototype.isMobile = function(force){
//     if (force)
//         return true;
//     var mFilter = "win16|win32|win64|mac";
//     var mCheck = (navigator.platform && mFilter.indexOf(navigator.platform.toLowerCase()) < 0) ? true : false;
//     return mCheck;
// };
BoxMan.prototype.resize = function(event){
    var meta = this.metaObj;
    if (!meta.testDivForCheckSize){
        meta.testDivForCheckSize = document.createElement('div');
        var testDiv = meta.testDivForCheckSize;
        testDiv.style.display = 'block';
        testDiv.style.position = 'absolute';
        testDiv.style.top = '-7777px';
        testDiv.style.left = '-7777px';
        testDiv.style.width = '100%';
        testDiv.style.height = '100%';
        testDiv.style.border = '0px solid';
        testDiv.style.padding = '0px';
        testDiv.style.margin = '0px';
        getEl(document.body).add(testDiv);
    }

    var test = meta.testDivForCheckSize;
    var body = document.body
    var html = document.documentElement;
    var width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth, test.offsetWidth );
    var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight, test.offsetHeight );

    var beforeWidth = meta.cam.w;
    var beforeHeight = meta.cam.h;
    meta.cam.w = width;
    meta.cam.h = height;
    // console.log('[BOXMAN] RESIZE>>  MAX:'+ beforeWidth +'/'+ beforeHeight +'   ==> '+ meta.cam.w +'/'+ meta.cam.h);
};
BoxMan.prototype.setLastPos = function(event){
    var meta = this.metaObj;
    /* Mobile Control */
    if (event.touches != undefined){
        meta.lastPosX = event.touches[0].pageX;
        meta.lastPosY = event.touches[0].pageY;
    /* Web Control */
    }else{
        meta.lastPosX = event.clientX + getEl().getBodyScrollX();
        meta.lastPosY = event.clientY + getEl().getBodyScrollY();
    }
    // console.debug(meta.lastPosX, meta.additionalStartPosLeft, meta.mvObj.adjustX);
    // meta.lastPosX -= meta.additionalStartPosLeft;
    // meta.lastPosY -= meta.additionalStartPosTop;
};
/* X,Y가 영역 안에 존재하는지 확인
 * 의존 : getBoundingClientRect()  */
BoxMan.prototype.isInBox = function (target, objX, objY){
    // var targetBodyOffset = getEl(target).getBoundingClientRect();
    var targetBodyOffset = getEl(target).getBoundingOffsetRect();
    var targetBodyOffsetX = targetBodyOffset.left;
    var targetBodyOffsetY = targetBodyOffset.top;

    // console.error(targetBodyOffsetX, targetBodyOffsetY, objX+'/'+objY);

    /* 상자 안인지 판정 */
    if (targetBodyOffsetX < objX && targetBodyOffsetX + target.offsetWidth > objX
    && targetBodyOffsetY < objY && targetBodyOffsetY + target.offsetHeight > objY){
        return true;
    }
    return false;
};

BoxMan.prototype.isPropManObj = function(element){
    return (element && element.getAttribute && element.getAttribute('data-pop') != null);
}

BoxMan.prototype.removeTimer = function(){
    var meta = this.metaObj;
    /* 객체 길게 누름 관련 */
    clearTimeout(meta.timer);
    meta.timerTime = 0;
};





BoxMan.prototype.findAbsoluteParentEl = function(element){
    var searchSuperObj = element.parentNode;
    while(searchSuperObj){
        if (searchSuperObj.style && searchSuperObj.style.position && searchSuperObj.style.position == 'absolute') break;
        searchSuperObj = searchSuperObj.parentNode;
    }
    return searchSuperObj ? searchSuperObj : document.body;
};

BoxMan.prototype.getKeyboarder = function(){
    return this.keyboarder;
};


/*************************************************************
 *  BOX
 *************************************************************/
function BoxManBox(setupObj){
    this.limit;
    this.acceptbox = [];
    this.rejectbox = [];
    this.acceptobj = [];
    this.rejectobj = [];
    this.conditionbox = [];
    this.conditionobj = [];
    this.beforeboxin;
    this.boxinout;
    this.start;
    this.boxin;
    this.boxout;
    this.mode = new BoxManMode();
}

/*************************************************************
 *  OBJ
 *************************************************************/
function BoxManObj(setupObj){
}

/*************************************************************
 *  EXBOX
 *************************************************************/
function BoxManExBox(setupObj){
}


/*************************************************************
 *  MODE
 *************************************************************/
function BoxManMode(modes){
    this.modes = {};
    this.set(modes);
}
BoxManMode.prototype = {
    set: function(param){
        if (param instanceof Object){
            for (var modeName in param){
                this.modes[modeName] = param[modeName];
            }
        }else if (typeof param == 'string'){
            this.modes[param] = true;
        }
        return this;
    },
    get: function(modeName){
        return this.modes[modeName];
    },
    del: function(modeName){
        delete this.modes[modeName];
        return this;
    },
    toggle: function(modeName){
        var mode = this.modes[modeName];
        if (this.modes[modeName] != undefined && this.modes[modeName] != null){
            if (typeof mode == 'boolean')
                this.modes[modeName] = !mode;
        }
        return this;
    },
    clear:function(){
        this.modes = {};
        return this;
    },
    clone: function(){
        return new BoxManMode(this.modes);
    },
    merge: function(mode){
        if (mode instanceof BoxManMode){
            var targetModes = mode.modes;
            for (var modeName in targetModes){
                this.modes[modeName] = targetModes[modeName];
            }
        }else{
            this.set(mode);
        }
        return this;
    }
};


/*************************************************************
 *
 *  KEYBOARDER
 *
 *************************************************************/
function BoxManKeyboarder(boxMan){
    var that = this;
    this.boxMan = boxMan;
    this.selectorBox;
    this.targetBox;

    this.meta = {
        goingToBeInThisBox:null,
        isEventStarted: false,
        keborderStatus: that.STATUS_NONE
    };
}
BoxManKeyboarder.prototype = {
    STATUS_NONE:0,
    STATUS_MOVE:1,
    STATUS_DROP:2,
    setSelectorBox: function(box){
        var that = this;
        var meta = this.meta;
        // Del
        this.delSelectorBox();
        // Set
        var box = this.boxMan.getBox(box);
        var boxElement = box.element;
        this.selectorBox = box;
        // Set Attribute
        boxElement.setAttribute('data-status', 'selected');
        // Set Event
        if (!meta.isEventStarted){
            meta.isEventStarted = true;
            getEl(document).addEventListener('keydown', function(event){
                if (that.selectorBox != null && that.selectorBox != undefined){
                    if (event.keyCode == 38) //UP
                        that.selectPrevObjInBox(that.selectorBox.element);
                    if (event.keyCode == 40) //DOWN
                        that.selectNextObjInBox(that.selectorBox.element);
                    if (event.keyCode == 17) //CTRL
                        that.handleKeyborderControler(that.selectorBox.element);
                }
            });
        }
    },
    delSelectorBox: function(box){
        var boxObj;
        if (box != null && box != '')
            boxObj = this.boxMan.getBox(box);
        else
            boxObj = this.selectorBox;

        if (boxObj != null && boxObj != undefined){
            var boxElement = boxObj.element;
            // Remove Attribute
            if (boxElement != null && boxElement != undefined && boxElement.getAttribute('data-status') == 'selected') {
                boxElement.removeAttribute('data-status');
                this.selectorBox = undefined;
                var objObj = this.getSelectedObjInBox(boxElement);
                if (objObj && objObj.element){
                    objObj.element.removeAttribute('data-status');
                }
            }
        }
    },
    setTargetBox: function(box){

    },
    handleKeyborderControler: function(box){
        if (this.keborderStatus == this.STATUS_NONE){
            this.keborderStatus = this.STATUS_MOVE;
        }else if(this.keborderStatus == this.STATUS_MOVE){
            this.keborderStatus = this.STATUS_DROP;
            this.keborderStatus = this.STATUS_NONE;
        }
    },
    selectNextObjInBox: function(box){
        var selectedObjIndex = this.getSelectedObjIndexInBox(box);
        this.deselectObjAllInBox(box);
        this.selectObjInBoxByIndex(box, selectedObjIndex + 1);
        return this;
    },
    selectPrevObjInBox: function(box){
        var selectedObjIndex = this.getSelectedObjIndexInBox(box);
        this.deselectObjAllInBox(box);
        this.selectObjInBoxByIndex(box, selectedObjIndex - 1);
        return this;
    },
    deselectObjAllInBox: function(box){
        var boxObj = this.boxMan.getBox(box);
        var boxElement = boxObj.element;
        for (var i=0; i<boxElement.children.length; i++){
            var child = boxElement.children[i];
            if (child.getAttribute('data-obj') != null && child.getAttribute('data-status') != null)
                child.removeAttribute('data-status');
        }
        return this;
    },
    selectObjInBoxByIndex: function(box, index){
        var boxObj = this.boxMan.getBox(box);
        var boxElement = boxObj.element;
        var boxElSize = boxElement.children.length;
        var objIndex = -1;
        index = (index > 0) ? index : 0;
        index = (index < boxElSize) ? index : boxElSize -1;
        for (var i=0; i<boxElement.children.length; i++){
            var child = boxElement.children[i];
            if (child.getAttribute('data-obj') != null){
                if ((++objIndex) == index){
                    child.setAttribute('data-status', 'selected');
                    break;
                }
            }
        }
        return this;
    },
    getSelectedObjInBox: function(box){
        var boxObj = this.boxMan.getBox(box);
        var boxElement = boxObj.element;
        var objIndex = -1;
        var resultElement;
        for (var i=0; i<boxElement.children.length; i++){
            var child = boxElement.children[i];
            if (child.getAttribute('data-obj') != null){
                objIndex++;
                if (child.getAttribute('data-status') != null){
                    resultElement = child;
                    break;
                }
            }
        }
        return this.boxMan.getObj(resultElement);
    },
    getSelectedObjIndexInBox: function(box){
        var boxObj = this.boxMan.getBox(box);
        var boxElement = boxObj.element;
        var objIndex = -1;
        var result = objIndex;
        for (var i=0; i<boxElement.children.length; i++){
            var child = boxElement.children[i];
            if (child.getAttribute('data-obj') != null){
                objIndex++;
                if (child.getAttribute('data-status') != null){
                    result = objIndex;
                    break;
                }
            }
        }
        return result;
    }
};



