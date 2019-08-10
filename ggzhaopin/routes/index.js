var express = require('express');
var router = express.Router();
const filter = { password:0, __v:0 };//指定过滤的属性

/* GET home page. */
router.get('/', function(req, res, next) {//注册一个路由，路由的path是"/"，
  res.render('index', { title: 'ManyTime' });//res.render表示渲染views->index.jade模版，并给这个模版传递一个值为something的title
});

//编写一个后台接口：注册一个路由，用于用户注册

/*
path为/register；
请求方式为POST【复习一下GET/POST的区别】
接收username和password参数
admin是已注册用户
注册成功返回一组数据{code:0, data:{_id:"abc", username:"xxx", password:"123"}}
注册失败返回一组数据{code:1, msg:"此用户已存在"}
*/

/*
1)获取请求参数
2)处理请求
3)返回响应
*/
// router.post('/register',function(req,res){ //req代表处理请求，res代表返回响应
	
// 		console.log("reagisrer()")
// 	//1、获取请求参数
// 	const { username,password } = req.body //解构以便快速取出参数，在req.body里取出username和password
// 	//2、处理请求
// 	if (username === "admin") { //注册失败
// 		res.send({code:1, msg:"此用户已存在"})
// 	}else{//注册成功
// 		res.send({code:0, data: {id: "abc123", username, password}}) //username的数据用data存储。
// 	}
// });

const { UserModel, ChatModel } = require("../db/models"); //基于schema结构定义的数据模型，用model进行数据操作，model返回数据处理函数
const md5 = require("blueimp-md5");

//注册路由
router.post("/register",function(req,res){
	//获取请求参数数据
	const { username, password, type } = req.body;
	//处理请求
		//判断用户是否已经存在，如果存在，返回错误提示信息；如果不存在，保存信息。
		//通过userModel查询(根据username)，

		UserModel.findOne({username}, function(err,user){
			if (user) {
				res.send({code: 1, msg: "此用户已存在！"});//用户存在则通过res返回响应
			}else{
				//password是解构过来的数据，因此需要写成键值对的形式：password:md5(password)
				new UserModel({username, password:md5(password), type}).save(function(err,user){
					//返回包含user的json格式数据
					//响应数据中不要携带密码
					const data = { username, type, id: user._id };
					console.log(username);
					//生成cookie(userid: user._id)来交给浏览器保存
					res.cookie('userid', user._id, {maxAge: 1000*60*60*24});

					res.send({code:0, data })
				}); //如果用户不存在则保存数据
			}
		})

	//返回响应数据
});


//登陆路由
router.post("/login",function(req,res){
	const { username, password } = req.body;
	//根据username和password查询数据库users，如果没有返回提示错误的信息
	//如果有则返回成功信息【包含user、头像、个人信息等】
	UserModel.findOne({username, password:md5(password)}, filter, function(error, user){ //findOne()方法的第二个参数传入了一个过滤属性，表示查询时过滤掉该属性
		if (user) { //登陆成功
		//生成cookie(userid: user._id)来交给浏览器保存
		res.cookie('userid', user._id, {maxAge: 1000*60*60*24});
		res.send({code:0, data: user});
		}else{//登陆失败
			res.send({code: 1, msg: "用户名或密码不正确！"});
		}
	})
});

//更新用户信息的路由
//此接口有两种可能。成功：返回user，失败返回msg，并提供登陆界面
router.post('/update',function(req,res){
	//得到提交的用户数据
	//前面我们将user._id以userid的形式存储在浏览器里了。当发送请求的时候。浏览器会自动携带userid
	const userid = req.cookies.userid;
	//如果不存在，直接返回一个提示信息的结果
	if (!userid) {
		return res.send({code:1, msg: "请先登陆"})
	}
	//如果存在，则根据userid更新对应的user文档数据
	const user = req.body; //没有_id
	UserModel.findByIdAndUpdate({_id: userid},user,function(error,oldUser){//user是根据id值找到对应的项以后，要更新的属性
		if(!oldUser){
			//如果不存在user的值，通知浏览器删除userid cookie：
			res.clearCookie("userid");
			//返回一个提示信息
			res.send({code:1, msg: "请先登陆"});
		}else{
			//准备一个返回的user数据对象
			const { _id, username, type } = oldUser;
			// 此时user里没有id\username\type，olduser里有这三个数据
			const data = Object.assign(user, { _id, username, type });//对象拷贝。将后者的属性拷贝到前者中去。如果前后对象有相同的属性，那么后面覆盖前面的；否则两者属性合并成一个对象的属性
			//返回
			res.send({code: 0, data});
		}
	})
})

//获取用户信息的路由，根据userid获取
router.get('/user', function(req,res){
	const userid = req.cookies.userid;
	if (!userid) {
		return res.send({code:1, msg:"请先登陆"})
	}
	//根据userid查询对应的user
	UserModel.findOne({_id: userid},filter,function(error,user){
		res.send({code:0, data:user});
	})
});

//根据type获取对应的用户列表
router.get('/userlist',function(req,res){
	const { type } = req.query;
	UserModel.find({type}, filter, function(error, users){
		res.send({code: 0, data: users});
	})
});


//获取当前用户所有相关聊天信息列表
/*返回的数据包括code、data两个属性；data包括"users"和"chatMsgs",
其中users是对象{_id1:{},_id2:{},_id3:{}...}，使用对象的优点是可以根据对象属性名立刻得到属性值。
chatMsgs是数组[{},{}]*/
router.get('/msglist',function(req,res){ 
	const userid = req.cookies.userid;//查询得到所有的user文档数组
	UserModel.find(function(err,userDocs){
		//用对象存储所有user信息：key为user的_id，val为name和header组成的user对象
		// const users = {};
		// userDocs.forEach(doc => {
		// 	users[doc._id] = {username: doc.username, header:doc.header}
		// })
		//可以用数组的递归写法,进行累加
		const users = userDocs.reduce((users,user) => {
			users[user._id] = {username: user.username, header: user.header}
			return users;
		}, {})

		/*查询userid相关的所有聊天信息：
		参数1: 查询条件
		参数2: 过滤条件
		参数3: 回调函数
		*/
		ChatModel.find({'$or':[{from: userid}, {to: userid}]}, filter, function(error,chatMsgs){
			res.send({code:0, data:{users, chatMsgs}}) //data的值是一个对象，此对象有两个属性，一个users是对象类型，一个chatMsgs是数组类型
		})
		//此处的"$or"表示查询条件是from: userid或者to: userid;filter表示过滤掉password；chatMsgs表示得到聊天消息的数组
	})
})

//修改指定消息为已读
router.post('/readmsg',function(req,res){ //需要修改数据库的数据。所有用post请求
	//得到请求中的from和to
	const from = req.body.from; //对方发送数据
	const to = req.cookies.userid; //要修改的是对方发过来的消息显示已读，所以从cookies里提取自己的userid
	/*更新数据库中的chat数据
	参数1: 查询条件
	参数2: 更新为指定的数据对象
	参数3: 是否1次更新多条，默认值更新一条
	参数4: 更新完成的回调函数*/
	ChatModel.update({from, to, read:false}, {read:true}, {multi:true}, function(err,doc){
		// update默认将查询结果只更新一次，如果查询到多条匹配项，只更新一条。{multi:true}指定所有匹配项都执行更新操作。
	console.log('/readMsg', doc);
	res.send({code:0, data: doc.nModified}); //更新的数量
	})
})


module.exports = router;
























