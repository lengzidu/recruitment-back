const express = require('express');
const router = express.Router();
const {UserModel} = require('../db/models.js')
const md5 = require('blueimp-md5')

const filter = {__v: 0}
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
module.exports = router;
