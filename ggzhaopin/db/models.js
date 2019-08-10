// 包含n个操作数据库集合数据的Model模块。

// 1、连接数据库
	// 引入mongoose
	// 连接指定数据库（url只有数据库是变化的）
	// 获取链接对象
	// 绑定完成的监听【用来提示连接成功】
// 2、定义出对应特定集合的Model并向外暴露
	// 字义schema【描述文档结构】
	// 定义Model【与集合对应，可以操作集合】
	// 向外暴露Model。


	// 引入mongoose
	const mongoose = require("mongoose");
	// 连接指定数据库（url只有数据库是变化的）
	mongoose.connect("mongodb://localhost:27017/gzhipin2", { useNewUrlParser: true }) 
	// 获取连接对象
	const conn = mongoose.connection;
	// 绑定完成的监听【用来提示连接成功】
	conn.on('connected',()=>{
		console.log("db connect success!")
	});

	// 字义schema【描述文档结构】
	const userSchema = mongoose.Schema({
		username: {type: String, required: true}, //用户名
		password: {type: String, required: true},//密码
		type: {type:String, required: true}, //用户类型
		header: {type: String}, //头像名称
		post: {type: String}, //职位
		info: {type: String}, //个人或职位简介
		company: {type: String}, //公司名称
		salary: {type: String} //工资
	})
	// 定义Model【与集合对应，可以操作集合】
	const UserModel = mongoose.model('user',userSchema); //文档为user，集合为users
	// 向外暴露Model。
	//暴露方式：module.exports = xxx : 合并暴露，只暴露一次
			//exports.xxx = value 
			//exports.xxx = value  ：这种形式可以一次次向外暴露。此处用分别暴露
	exports.UserModel = UserModel;



//定义chat集合的文档结构：基于schema结构定义数据模型
const chatSchema = mongoose.Schema({
	from: {type: String, required: true}, //发送用户的id
	to: {type: String, required:true}, //接收用户的id
	chat_id: {type: String, required:true}, //from和to组成的字符串
	content: {type:String, required: true}, //内容
	read: {type: Boolean, default: false}, //标识是否已读
	create_time: {type: Number} //创建时间
});
//定义能操作chat集合数据的Model
const ChatModel = mongoose.model('chat',chatSchema);
//向外暴露ChatModel
exports.ChatModel = ChatModel
























