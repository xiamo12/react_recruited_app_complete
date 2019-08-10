// 测试使用mongoose操作mongodb数据库

const md5 = require("blueimp-md5");//md5加密函数

//1.连接数据库
//1.1 引入mongoose
const mongoose = require("mongoose");

//1.2 连接指定数据库(url只有数据库是变化的)
mongoose.connect("mongodb://localhost:27017/gzhipin_test",{ useNewUrlParser: true },function(err){
　　if(err){  
　　　　console.log('Connection Error:' + err)  
　　}else{   
　　　　console.log('Connection success!')}}) //最后一个ggzhaopin_test是数据库的名字


//1.3 获取连接对象
const conn = mongoose.connection //mongoose的connection属性的值，就是一个连接对象


//1.4 绑定连接完成的监听，用来提示连接成功
conn.on("connected", function(){ //此函数连接成功之后回调。
	console.log("数据库连接成功！")
});

//描述文档结构，用mongoose的schema方法。mongoose基于schema结构去定义数据模型
const userSchema = mongoose.Schema({ //定义属性名/属性值，是否是必须的，默认值是多少
	username: {type:String, required: true},//用户名
	password: {type:String, required: true},//密码
	type: {type:String, required: true}//用户类型：dashen/laoban
});

const UserModel = mongoose.model('user',userSchema)//第一个参数是我们最终确定的集合名称。集合名称为users，那么这个参数就写user
//用user进行增删改查【CRUD】的操作
//通过Model或者其实例对集合数据进行CRUD操作

//通过Model实例的save()方法添加数据
function testSave(){
	//创建UserModel的实例
	const userModel = new UserModel({username: "Amy", password: md5("123"), type: "laoban"})//注意：password要加密；type只能是前端两个type中的一个
	//调用save()保存
	userModel.save(function(error, user){
		console.log("save()",error,user)
	})
}
// testSave()

//通过Model的find()/findOne()方法查询多个或一个对象
//UserModel是一个函数

function testFind(){
	UserModel.find({_id:"5d411f5c10303cec184feda8"},function(error, users){//把UserModel当作一个对象使用，此时它是一个函数对象。通过find()方法去获得数据
		console.log("find()",error,users)
	});  //find()终端运行之后获得的是一个包含所有匹配项的数组，findOne()获得的是一个匹配的文档对象。如果没有匹配项则返回null
	UserModel.findOne({_id:"5d411f5c10303cec184feda8"},function(error,user){
		console.log("findOne()",error,user)
	})//第一个参数是查询的条件，封装在一个对象里；第二个是一个执行函数
}
// testFind();

//通过Model函数对象的findByIdAndUpdate()方法来通过id值更新某个对象
function testUpdate(){
	UserModel.findByIdAndUpdate({_id:"5d411f5c10303cec184feda8"},
		{username:"Jack"}, function(error,oldUser){
			console.log("findByIdAndUpdate()", error, oldUser)
		});
}
// testUpdate()

//通过Model的remove()方法来移除指定数据
function testDelete(){
	UserModel.remove({_id:"5d411f5c10303cec184feda8"},function(error,doc){
		console.log("remove()",error,doc);
	})
}

testDelete() //{ n: 1, ok: 1, deletedCount: 1 }，其中n：1表示删除了1条数据/文档；ok：1表示删除成功


