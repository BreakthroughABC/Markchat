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
                    msg = messageInput.value;
                messageInput.value = '';
                messageInput.focus();
                if(msg.trim().length != 0){
                    that.socket.emit('postMsg', msg);
                    that._displayNewMsg('me',msg);
                };
            })
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
        this.socket.on('newMsg', function (user, msg) {
            that._displayNewMsg(user, msg);
        });

    },
    _displayNewMsg : function (user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        /*if didn't pass color, op1(undef) get false and take op2*/
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' +
            date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
}
