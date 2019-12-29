function Test1(){
    this.id = -1;
    this.name = 'noname';
    this.status = 'none';
}

Test1.prototype.run = function(param){
    console.log('run:' +this.name+ ' ' + (param?param:''));
    this.status = 'running';
};

Test1.prototype.stop = function(){
    console.log('stop:' +this.name);
    this.status = 'stoped';
};

Test1.prototype.exit = function(){
    console.log('exit:' +this.name);
    this.status = 'exited';
};