const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
// 1.2. 连接指定数据库(URL 只有数据库是变化的)
mongoose.connect('mongodb://localhost:27017/recruitment')
// 1.3. 获取连接对象
const conn = mongoose.connection
// 1.4. 绑定连接完成的监听(用来提示连接成功)
conn.on('connected', function () {
console.log('数据库连接成功')
})

const userSchema = mongoose.Schema({
  username: {type: String, required: true}, // 用户名
  password: {type: String, required: true}, // 密码
  type: {type: String, required: true}, // 用户类型: dashen/laoban
})

const UserModel = mongoose.model('user', userSchema)
function testSave() {
  // user 数据对象
  const user = {
  username: 'xfzhang',
  password: md5('1234'),
  type: 'dashen',
  }
  const userModel = new UserModel(user)
  // 保存到数据库
  userModel.save(function (err, user) {
  console.log('save', err, user)
  })
  }
//   testSave()


function testFind() {
  // 查找多个
  UserModel.find(function (err, users) { 
  console.log('find() ', err, users)
  })
  // 查找一个
  UserModel.findOne({_id: '5ae1d0ab28bd750668b3402c'}, function (err, user) { 
  console.log('findOne() ', err, user)
  })
}
  testFind()

function testUpdate() {
  UserModel.findByIdAndUpdate(
    {_id: '6014fd8751df1f455085827c'},
    {username: 'yyy'},
    function (err, user) {
      console.log('findByIdAndUpdate()', err, user);
    }
  )
}

// testUpdate()


function testDelete() {
  UserModel.remove(
    {_id: '601028fd47083625789fad60'},
    function(err, result) {
      console.log('remove()', err, result)
    }
  )
}

// testDelete()

  
