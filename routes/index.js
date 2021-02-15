const express = require('express');
const router = express.Router();
const {UserModel, ChatModel} = require('../db/models.js')
const md5 = require('blueimp-md5')

function success(data, msg='ok', code=200) {
  return {code, msg, data}
}
function error(msg='请重新登录', code=401) {
  return {code, msg, data: null}
}

/* GET home page. */

//注册
router.post('/register', (req, res)=>{
  const {username, password, type} = req.body
  UserModel.findOne({username}, (err, user)=>{
    if(user) {
      res.send(error('此用户已存在', 400))
    }else {
      new UserModel({username, password: md5(password), type}).save(function(err, user){
        res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
        user.password = ''
      res.send(success(user, '注册成功'))
      })
    }
  })
})

//登录
router.post('/login', (req, res)=>{
  const {username, password} = req.body
  UserModel.findOne({username}, (err, user)=>{
    if(user) {
      if(user.password === md5(password)) {
        res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
        user.password = ''
        res.send(success(user, '登陆成功'))
      }else {
        res.send(error('密码错误',400))
      }
    }else {
      res.send(error('该账号不存在,请先注册',400))
    }
  })
})


//保存
router.post('/save', (req, res)=>{
  const userid = req.cookies.userid
  if(!userid) {
    return res.send(error())
  }
  const user = req.body
  UserModel.findByIdAndUpdate({_id: userid}, user, (err, oUser)=>{
    if(!oUser) {
      res.clearCookie('userid')
      res.send(error())
    }else {
      res.send(success(user))
    }
  })
})

// 获取信息列表
router.get('/userList', (req, res) => {
  const {type} = req.query
  UserModel.find({type}, (err, users) => {
    if (type === 'dashen') {
      res.send(success(users))
    } else {
      let temp = []
      users.map(obj=>{
        obj.jobs.map(obk=>{
          if (obk.post && obk.salary && obk.info) {
            temp.push({
              _id: obj._id,
              username: obj.username,
              header: obj.header,
              company: obj.company,
              post: obk.post,
              salary: obk.salary,
              info: obk.info,
            })
          }
        })
      })
      res.send(success(temp))
    }
  })
})

//获取当前用户所有相关聊天信息列表
router.get('/msglist', function (req, res) {
  // 获取 cookie 中的 userid
  const userid = req.cookies.userid
  // 查询得到所有 user 文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有 user 信息: key 为 user 的_id, val 为 name 和 header 组成的 user 对象
    const users = {} // 对象容器
    userDocs.forEach(doc => {
      users[doc._id] = {username: doc.username, header: doc.header}
    })
    /*查询 userid 相关的所有聊天信息
    参数 1: 查询条件
    参数 2: 过滤条件
    参数 3: 回调函数
    */
    ChatModel.find({'$or': [{from: userid}, {to: userid}]}, function (err,chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send(success({users, chatMsgs}))
    })
  })
})

  
//修改指定消息为已读
router.post('/readmsg', function (req, res) {
  // 得到请求中的 from 和 to
  const from = req.body.from
  const to = req.body.to
  /*更新数据库中的 chat 数据
  参数 1: 查询条件
  参数 2: 更新为指定的数据对象
  参数 3: 是否 1 次更新多条, 默认只更新一条
  参数 4: 更新完成的回调函数
  */
  ChatModel.updateMany({from, to, read: false}, {$set: {read: true}}, function (err, doc) {
    console.log('/readmsg', doc)
    res.send(success(doc.nModified)) // 更新的数量
  })
})
module.exports = router;
