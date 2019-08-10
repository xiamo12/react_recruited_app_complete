 //此处的server是bin/www中声明的，var server = http.createServer(app);
//引入对数据的处理模块Model：
const { ChatModel } =require("../db/models");


module.exports = function(server){
	const io = require('socket.io')(server);
	//监视客户端与服务器的链接
	io.on('connection',function(socket){
		console.log('有一个客户端连接上了服务器。')
	
		//绑定监听，接收客户端发送过来的数据，并且处理数据
		socket.on('sendMsg', function({from, to, content}){
			//处理数据【保存消息】
			//准备chatmessage对象的相关数据
			const chat_id = [from, to].sort().join('_') //希望from_to或者to_from的结果一样。可以用排序。两个字符串的排序结果一致
			const create_time = Date.now() //创建对话的事件
			new ChatModel({from, to, content, chat_id, create_time}).save(function(error, chatMsg){
				 io.emit('receiveMsg',chatMsg) //用io表示向所有连接的客户端发送消息。效率不高，但简单。然后再从浏览器端屏蔽掉和自己无关的消息
			//此处发送的是chatMsg，那么客户端actions.js里的initIO()- - >io.socket.on()里的函数接收的也应该是chatMsg
			//"我"的这一端没有_id，没有chat_id,没有create_time
			})
			
		});
	})
}