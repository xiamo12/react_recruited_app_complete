 //此处的server是bin/www中声明的，var server = http.createServer(app);

module.exports = function(server){
	const io = require('socket.io')(server);
	//监视客户端与服务器的链接
	io.on('connection',function(socket){
		console.log('有一个客户端连接上了服务器。')
	
		//绑定监听，接收客户端发送过来的数据，并且处理数据
		socket.on('sendMsg', function(data){
			console.log('服务器接收到客户端发送的消息,',data)
			data.name = data.name.toUpperCase(); //服务器处理客户端发过来的数据
			socket.emit('receiveMsg',data) //服务器向客户端发送消息,data是处理过后的数据
		// io.emit('receiveMsg',data) 也可以用io.emit来向客户端分发消息
		console.log('服务器向客户端发送消息',data)
		});
	})
}