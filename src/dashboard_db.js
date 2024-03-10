
const mysql = require('mysql');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'manager'
});
const conn0 = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
});

conn0.connect(error => {
    if (error) {
        console.log("error in connection");
    }
});

// 查询是否存在名为 `manager` 的数据库
conn0.query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?', ['manager'], (err, results) => {
    if (err) {
        console.error('查询数据库是否存在时出错：', err);
        return;
    }

    const databaseExists = results.length > 0;

    if (!databaseExists) {
        // 如果不存在 `manager` 数据库，则创建该数据库
        conn0.query('CREATE DATABASE manager', (err) => {
            if (err) {
                console.error('创建 `manager` 数据库时出错：', err);
                callback()
            } else {
                console.log('成功创建 `manager` 数据库');
                 callback()
            }
        });
    } else {
        console.log('`manager` 数据库已存在');
        callback()
    }
});




function callback(){

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'manager'
});


 // 查询是否存在名为`users`的表
 conn.query('SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_schema = ? AND table_name = ?', ['manager', 'users'], (err, results) => {
  if (err) {
    console.error('查询表是否存在时发生错误：', err);
    return;
  }

  const tableExists = results[0].table_exists === 1;

  if (!tableExists) {
    // 如果不存在 `users` 表，则创建该表
    conn.query('CREATE TABLE users (user_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), password VARCHAR(255))', (err) => {
      if (err) {
        console.error('创建`users`表时发生错误：', err);
      } else {
        console.log('成功创建`users`表');
      }
    });
  } else {
    console.log('`users`表已存在');
  }
});

}


module.exports = conn;