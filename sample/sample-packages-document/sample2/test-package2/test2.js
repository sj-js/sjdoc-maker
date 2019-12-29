function Test2(){
    this.id = -1;
    this.name = 'noname';
    this.status = 'none';
}

Test2.prototype.love = function(param){
    console.log('love:' +this.name+ ' ' + (param?param:''));
    this.status = 'loving';
};

Test2.prototype.cheer = function(){
    console.log('cheer:' +this.name);
    this.status = 'cheered';
};

Test2.prototype.donate = function(){
    console.log('donate:' +this.name);
    this.status = 'donated';
};