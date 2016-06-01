var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = {};

server.listen(3000);

console.log('Server started on localhost port 3000...')

app.get('/',function(req,res){
	res.sendFile(__dirname+'/templates/index.html');
});

io.sockets.on('connection',function(socket){
	
	socket.on('new user',function(data,callback){
		if (data in users){
			callback(false);
		}
		else{
			callback(true);
			socket.nickname = data;	//property of a socket
			users[socket.nickname] = socket;
			updateNickNames();
		}
	});

	function updateNickNames(){
		io.sockets.emit('usernames',Object.keys(users)) ;
	}

	socket.on('send-public-message',function(data){
		var msg = data.trim();
		if (msg!='') io.sockets.emit('new message',{msg:data,nick:socket.nickname});
	});

	socket.on('send-public-code',function(data){
		var msg = data.trim();
		if (msg!='') io.sockets.emit('code message',{msg:msg,nick:socket.nickname});
	});

	socket.on('send-private-message',function(data){
		var msg = data.trim();
		msg = msg.substr(2);
		var ind = msg.indexOf(' ');
		if (ind!=-1){
			var name = msg.substr(0,ind);
			msg = msg.substr(ind+1);
			//console.log(msg);
			if (name in users && name!=socket.nickname){
				console.log('Private Message.');
				users[name].emit('new message',{msg:msg,nick:socket.nickname});
				socket.emit('new message',{msg:msg,nick:socket.nickname});
			}
			else console.log('Error!');
		}
		else console.log('Error!');
	});

	socket.on('send-private-code',function(data){
		var msg = data.trim();
		msg = msg.substr(2);
		var ind = msg.indexOf(' ');
		if (ind!=-1){
			var name = msg.substr(0,ind);
			msg = msg.substr(ind+1);
			//console.log(msg);
			if (name in users && name!=socket.nickname){
				console.log('Code snippet Message.');
				users[name].emit('code message',{msg:msg,nick:socket.nickname});
				socket.emit('code message',{msg:msg,nick:socket.nickname});
			}
			else console.log('Error!');
		}
		else console.log('Error!');
	});

	socket.on('disconnect',function(data){
		delete users[socket.nickname];
		updateNickNames();
	});
});
