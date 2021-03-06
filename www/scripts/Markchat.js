window.onload = function () {
    var markchat = new Markchat();
    markchat.init();
};

var Markchat = function () {
    this.socket = null;
}

Markchat.prototype = {
    constructor : Markchat,
    init : function () {
        var that = this;
        this.socket = io.connect('http://47.94.201.41');
        this.socket.on('connect', function () {
            document.getElementById('info').textContent =
                'get yourself a nickname :';
            document.getElementById('nickWrapper').style.display
            = 'block';
            document.getElementById('nicknameInput').focus();
        });
        document.getElementById('loginBtn').addEventListener('click',function () {
            var nickName = document.getElementById('nicknameInput').value;
            if(nickName.trim().length != 0){
                /*Attention using that*/
                that.socket.emit('login', nickName);
            }else{
                document.getElementById('nicknameInput').focus();
            };
        },false);
        document.getElementById('sendBtn').addEventListener('click',
            function () {
                var messageInput = document.getElementById('messageInput'),
                    msg = messageInput.value,
                    color = document.getElementById('colorStyle').value;
                messageInput.value = '';
                messageInput.focus();
                if(msg.trim().length != 0){
                    that.socket.emit('postMsg', msg ,color);
                    that._displayNewMsg('me',msg, color);
                };
            });
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent =
                'Nickname is taken, choose another please';
        });
        this.socket.on('loginSuccess', function () {
            document.title = 'Markchat |' +
                document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        });
        this.socket.on('system',function (nickname, userCount, type) {
            var msg = nickname + (type == 'login' ? ' joined' : ' left');
            /*Attention: using that*/
            that._displayNewMsg('system', msg, 'red');
            document.getElementById('status').textContent = userCount +
                (userCount > 1 ? ' users' : ' user') + ' online';
        });
        this.socket.on('newMsg', function (user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });
        document.getElementById('sendImage').addEventListener('change',
            function () {
                if(this.files.length != 0){
                    var file = this.files[0],
                        reader = new FileReader();
                    if(!reader){
                        that._displayNewMsg('system', '!your browser do' +
                            'esn\'t support fileReader', 'red');
                        this.value = '';
                        return;
                    };
                    reader.onload = function(e){
                        //read successfully
                        this.value = '';
                        that.socket.emit('img', e.target.result);
                        that._displayImage('me', e.target.result);
                    };
                    reader.readAsDataURL(file);
                };
            }, false);
        this.socket.on('newImg', function (user, img) {
            that._displayImage(user,img);
        });
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click',
            function (e) {
                var emojiwrapper = document.getElementById('emojiWrapper');
                emojiwrapper.style.display = 'block';
                e.stopPropagation();
            },false);
        document.body.addEventListener('click',function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if(e.target != emojiwrapper){
                emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click',
            function (e) {
                var target = e.target;
                if(target.nodeName.toLowerCase() == 'img'){
                    var messageInput = document.getElementById('messageInput');
                    messageInput.focus();
                    messageInput.value = messageInput.value + '[emoji:' +
                        target.title + ']';
                };
            },false);
    },
    _displayNewMsg : function (user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            msg = this._convertEmoji(msg);
        /*if didn't pass color, op1(undef) get false and take op2*/
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' +
            date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function (user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0,8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date
            + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _initialEmoji: function () {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for(var i = 20; i > 0; i--){
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    _convertEmoji: function (msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while(match = reg.exec(msg)){
            emojiIndex = match[0].slice(7, -1);
            if(emojiIndex > totalEmojiNum){
                result = result.replace(match[0], '[attackFailed]');
            }else{
                result = result.replace(match[0], '<img' +
                    ' class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
            };
        };
        return result;
    }

}
