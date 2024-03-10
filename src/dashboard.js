const express = require('express')
const path = require('path')
const conn = require('./dashboard_db')
// const collection = require('./config')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');

const session = require('express-session');



const app = express()

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended: true}))

app.use(bodyParser.json())


app.set('view engine','ejs')

app.use(express.static(path.join(__dirname,'../public')));

app.set('views', path.join(__dirname, '../views'));

// // 中间件：当访问根路径时重定向到登录页面(leads to firefox redireting loop)
// app.use('/', (req, res, next) => {
//     res.redirect('/login'); // 重定向到登录页面
// });

app.get('/',(req,res) =>{
    res.redirect('/login'); 
})





app.get("/login",function(req,res){

    res.render("login.ejs")
})

app.post("/login", async (req,res) =>{
    try {
        // const userData = await conn.query('SELECT * FROM users WHERE name = ?',[req.body.login_name])
        // console.log('aaaaaaaaaaaaaaaaaaaaaa'+userData);
        // console.log('bbbbb'+console.log(userData[0]) ); // 将对象转换为字符串并打印

        conn.query('SELECT * FROM users WHERE name = ?', [req.body.login_name], async (error, result) => {
            if (error) {
                console.error(error);
                res.send("Error");
            } else {
                console.log(result);
                const userData = result;

                if (!userData ||userData.length === 0 ){
                    res.send(`
                    <div style="text-align: center; padding: 20px;">
                    <div style="margin-bottom: 300px;"></div> <!-- 添加的空白元素 -->
                        <h1 style="color: #007bff; margin-bottom: 20px;">User not found!</h1>
                        <div style="margin-bottom: 150px;"></div> <!-- 添加的空白元素 -->
                        <button onclick="redirectToLogin()" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Return to Login</button>
                    </div>
                    <script>
                        function redirectToLogin() {
                            window.location.href = '/login'; // 重定向到登录页面的URL
                        }
                    </script>
                `)
                }
                else{
                const isPasswordMatch = req.body.login_password === userData[0].password
                if (isPasswordMatch){
                      const structureName = userData[0].name + '_device'; // 结构名称
                      conn.query('SELECT * FROM ??', [structureName], (structureError, structureResult) => {
                          if (structureError) {
                              console.error('Error fetching user structure:', structureError);
                              res.send("Error fetching user structure");
                          } else {

                              //console.log("structureResult"+structureResult)
                              //console.log(JSON.stringify(structureResult))
                             const userStructure = structureResult
                            req.session.userStructure = userStructure; // 将数据存储在会话中
                            req.session.database_name = structureName
                            req.session.login_name = req.body.login_name
                            req.session.hideButtons = false
                    res.redirect('/dashboard?loginName=' + encodeURIComponent(req.body.login_name))

                }})
                }else{
                    res.send(`
                    <div style="text-align: center; padding: 20px;">
                    <div style="margin-bottom: 300px;"></div> <!-- 添加的空白元素 -->
                        <h1 style="color: #007bff; margin-bottom: 20px;">Wrong password</h1>
                        <div style="margin-bottom: 150px;"></div> <!-- 添加的空白元素 -->
                        <button onclick="redirectToLogin()" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Return to Login</button>
                    </div>
                    <script>
                        function redirectToLogin() {
                            window.location.href = '/login'; // 重定向到登录页面的URL
                        }
                    </script>
                `)
                }
            
                }

            }
        });

        
    }catch (err){
        console.error('Error during login' + err.stack)
        res.send("Error during login" + err.message)
    }
    
})


app.get("/signup",function(req,res){

    res.render("signup.ejs")
})

//Register User
app.post("/signup",async(req,res) => {

    const data = {
        name: req.body.signup_name,
        password: req.body.signup_password
    }

    try {
        conn.query('SELECT * FROM users WHERE name = ?',[data.name],(error, results) => {
            if (error) {
                console.error(error);
                res.send("Error occurred while checking user existence");
            } else 
            {
                console.log(results)
                const existingUser = results
                if (existingUser.length > 0){
                res.send("User already exists. Please choose a different username")
                }else
                  {
                    conn.query('INSERT INTO users SET ?',data)


                     // Create structure in the database based on username + sampleData
                    const structureName = data.name + '_device'; // Create structure name
                    const structureName_history = data.name + '_device_history'

                    const createStructureQuery = `CREATE TABLE ${structureName} ( 
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        device_name VARCHAR(255),
                        device_code VARCHAR(255),
                        device_number VARCHAR(255),
                        operating_data VARCHAR(255))`; // Define structure creation query
                            
                    


                        const createStructureQuery_history = `CREATE TABLE ${structureName_history} ( 
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            device_name VARCHAR(255),
                            device_code VARCHAR(255),
                            device_number VARCHAR(255),
                            operating_data VARCHAR(255))`; // Define structure creation query



                     // Execute the structure creation query
                     try {
                        conn.query(createStructureQuery, (structureError, structureResults) => {
                            if (structureError) {
                                console.error('Error creating table:', structureError);
                                res.status(500).send('Error creating table: ' + structureError.message);
                            } else {
                                //console.log('Table created successfully:');
                                
                            }
                        });       // correspond user's history table



                        conn.query(createStructureQuery_history, (structureError, structureResults) => {
                            if (structureError) {
                                console.error('Error creating table:', structureError);
                                res.status(500).send('Error creating table: ' + structureError.message);
                            } else {
                                //console.log('Table created successfully:');
                                res.send(`
                                <div style="text-align: center; padding: 20px;">
                                <div style="margin-bottom: 300px;"></div> <!-- 添加的空白元素 -->
                                    <h1 style="color: #007bff; margin-bottom: 20px;">User signed up successfully!</h1>
                                    <div style="margin-bottom: 150px;"></div> <!-- 添加的空白元素 -->
                                    <button onclick="redirectToLogin()" style="background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Return to Login</button>
                                </div>
                                <script>
                                    function redirectToLogin() {
                                        window.location.href = '/login'; // 重定向到登录页面的URL
                                    }
                                </script>
                            `);
                            }
                        });
                    } catch (error) {
                        console.error('Error in query execution:', error);
                        res.status(500).send('Error in query execution: ' + error.message);
                    }










                }
            } 
        }  
        )
   
        }catch (err){
        console.error('Error signing up' + err.stack)
        res.status(500).send('Error signing up'+err.message)
    }




 







 
})



app.get("/dashboard",function(req,res){
    const userStructure = req.session.userStructure; // 从会话中检索数据
    const database_name = req.session.database_name
    const login_name = req.session.login_name
    const hideButtons = req.session.hideButtons
    res.render("dashboard.ejs",{ userStructure: userStructure ,database_name: database_name,login_name: login_name,hideButtons: hideButtons})
    return; // 加上这一行

})

















// delete current account standard

app.post("/deleteUser",(req,res) =>{
    const userIdToDelete = req.body.login_name;
    console.log("Deleting user: " + userIdToDelete);

    // Define the table name to delete (based on user's name)
    const tableNameToDelete = userIdToDelete + '_device';
    const tableNameToDelete_history = userIdToDelete + '_device_history';

    // Construct the SQL query to delete the user from 'users' table
    const deleteUserSQL = 'DELETE FROM users WHERE name = ?';

    // Construct the SQL query to drop the related data table
    const dropTableSQL = 'DROP TABLE IF EXISTS ' + tableNameToDelete;
    const dropTableSQL_history = 'DROP TABLE IF EXISTS ' + tableNameToDelete_history
   // Delete user from 'users' table
conn.query(deleteUserSQL, [userIdToDelete], function (deleteUserErr, deleteUserResult) {
    if (deleteUserErr) {
        console.error('Error deleting user: ' + deleteUserErr.stack);
        conn.rollback(function () {
            res.status(500).send('Error deleting user: ' + deleteUserErr.message);
        });
        return;
    }
})
conn.query(dropTableSQL, function (dropTableErr, dropTableResult) {
    if (dropTableErr) {
        console.error('Error dropping table: ' + dropTableErr.stack);
        conn.rollback(function () {
            res.status(500).send('Error dropping table: ' + dropTableErr.message);
        });
        return;
    }

    conn.query(dropTableSQL_history, function (dropTableErr, dropTableResult) {
        if (dropTableErr) {
            console.error('Error dropping table: ' + dropTableErr.stack);
            conn.rollback(function () {
                res.status(500).send('Error dropping table: ' + dropTableErr.message);
            });
            return;
        }
    
    })

    console.log('User deleted successfully');
    res.status(200).send('User deleted successfully');
})
    



})








//change password
app.post("/updatePassword",(req,res)=>{


     // 准备更新密码的用户名和新密码
        const usernameToUpdate = req.body.login_name; // 要更新密码的用户名
        const newPassword = req.body.password; // 用户的新密码
        console.log("name: "+usernameToUpdate+"newpassword: "+newPassword)
    // 执行更新密码的 SQL 查询
        const sql = 'UPDATE users SET password = ? WHERE name = ?';
         conn.query(sql, [newPassword, usernameToUpdate], (err, result) => {
        if (err) {
        console.error('Error updating password: ' + err.stack);
        return;
        }
     console.log('Password updated successfully');
});


})







// Route to handle adding device
app.post('/addDevice', async (req, res) => {
    const { deviceName, deviceCode, deviceNumber, operatingData ,login_name} = req.body;
    const tablename = login_name+"_device"
   // console.log(tablename)
    const tablename_history = login_name+"_device_history"

    try {
        
        
        conn.query(
            `INSERT INTO ${tablename} (device_name, device_code, device_number, operating_data) VALUES (?, ?, ?, ?)`,
            [deviceName, deviceCode, deviceNumber, operatingData]
        );
       
        conn.query(
            `INSERT INTO ${tablename_history} (device_name, device_code, device_number, operating_data) VALUES (?, ?, ?, ?)`,
            ["add:"+deviceName, deviceCode, deviceNumber, operatingData]
        );

        const structureName = tablename; // 结构名称
        conn.query('SELECT * FROM ??', [structureName], (structureError, structureResult) => {
            if (structureError) {
                console.error('Error fetching user structure:', structureError);
                res.send("Error fetching user structure");
            } else {

               // console.log("structureResult"+structureResult)
               // console.log(JSON.stringify(structureResult))
               const userStructure = structureResult
               req.session.userStructure = userStructure;

               res.status(200).json({ userStructure })
            //    req.session.userStructure = userStructure; // 将数据存储在会话中
            //         req.session.database_name = structureName
            //         req.session.login_name = req.body.login_name
            //   res.render("dashboard.ejs",{ userStructure: userStructure ,database_name: structureName,login_name: login_name})

  }})


  

  


    } catch (error) {
        console.error('Error adding device:', error);
        res.status(500).send('Failed to add device');
    }
}
);














app.post('/deleteDevice', (req, res) => {
   // console.log("Received delete request:", req.body); // 输出收到的请求数据

    const deviceIdToDelete = req.body.deviceId;
  //  console.log("Deleting device: " + deviceIdToDelete);

    const dbname = req.body.dbname+"_device"
    const dbname_history = req.body.dbname+"_device_history"
    conn.query(`SELECT * FROM ${dbname} WHERE id = ?`, [deviceIdToDelete], (selectError, selectResults) => {
        if (selectError) {
            console.error('Error selecting device:', selectError);
            return;
        }
    
        if (selectResults.length === 0) {
            console.error('Device not found');
            return;
        }
    
        const deviceToDelete = selectResults[0]; // 获取要删除的设备数据

               

          // 在这里执行从数据库中删除设备的操作，根据设备ID进行删除
    conn.query(`DELETE FROM ${dbname} WHERE id = ?`, [deviceIdToDelete], (error, result) => {
        if (error) {
            console.error('Error deleting device: ' + error.stack);
            return;
        }
        console.log('Device deleted successfully');
        callback()
        //add data to history
        conn.query(
            `INSERT INTO ${dbname_history} (device_name, device_code, device_number, operating_data) VALUES (?, ?, ?, ?)`,
            ["delete:"+deviceToDelete.device_name, deviceToDelete.device_code, deviceToDelete.device_number, deviceToDelete.operating_data]
        )
   
    })

    })



    // 设备表名为login_name+'device'，并且设备表中有一个名为'id'的字段作为设备的唯一标识符。
    function callback(){
    const structureName = dbname; // 结构名称
    conn.query('SELECT * FROM ??', [structureName], (structureError, structureResult) => {
        if (structureError) {
            console.error('Error fetching user structure:', structureError);
            res.send("Error fetching user structure");
        } else {

          //  console.log("structureResult"+structureResult)
           // console.log(JSON.stringify(structureResult))
           const userStructure = structureResult
           req.session.userStructure = userStructure;

           res.status(200).json({ userStructure })
        //    req.session.userStructure = userStructure; // 将数据存储在会话中
        //         req.session.database_name = structureName
        //         req.session.login_name = req.body.login_name
        //   res.render("dashboard.ejs",{ userStructure: userStructure ,database_name: structureName,login_name: login_name})

}})}




});














//modified data
// 新增一个路由来处理编辑请求
app.post('/editDevice', async (req, res) => {
    const { deviceName, deviceCode, deviceNumber, operatingData } = req.body;




    const deviceId = req.body.deviceId/* 从请求中获取设备ID */;
    const login_name = req.body.login_name
    const tablename = login_name+"_device"



    try {
        // 更新数据库中相应设备的数据
        conn.query(
            `UPDATE ${tablename} SET device_name = ?, device_code = ?, device_number = ?, operating_data = ? WHERE id = ?`,
            [deviceName, deviceCode, deviceNumber, operatingData, deviceId],
            (error, result) => {
                if (error) {
                    console.error('Error editing device:', error);
                    res.status(500).send('Failed to edit device');
                } else {
                    console.log('Device edited successfully');
                }
            }
        )

        const structureName = tablename; // 结构名称
        conn.query('SELECT * FROM ??', [structureName], (structureError, structureResult) => {
            if (structureError) {
                console.error('Error fetching user structure:', structureError);
                res.send("Error fetching user structure");
            } else {

              //  console.log("structureResult"+structureResult)
              //  console.log(JSON.stringify(structureResult))
               const userStructure = structureResult
               req.session.userStructure = userStructure;

               res.status(200).json({ userStructure })
            //    req.session.userStructure = userStructure; // 将数据存储在会话中
            //         req.session.database_name = structureName
            //         req.session.login_name = req.body.login_name
            //   res.render("dashboard.ejs",{ userStructure: userStructure ,database_name: structureName,login_name: login_name})

  }})



    } catch (error) {
        console.error('Error editing device:', error);
        res.status(500).send('Failed to edit device');
    }
    
    


});






//history
app.post('/history', (req, res) => {
    const login_name = req.body.login_name
    const structureName = req.body.login_name+"_device_history"
    const database_name = req.body.login_name+"_device"
   // console.log(structureName)

    

conn.query('SELECT * FROM ??', [structureName], (structureError, structureResult) => {
    if (structureError) {
        console.error('Error fetching user structure:', structureError);
        res.send("Error fetching user structure");
    } else {

      //  console.log("structureResult"+structureResult)
      //  console.log(JSON.stringify(structureResult))
       const userStructure = structureResult
       req.session.userStructure = userStructure
        req.session.database_name = structureName
        req.session.hideButtons = true
       res.status(200).json({ userStructure })
    //    req.session.userStructure = userStructure; // 将数据存储在会话中
    //         req.session.database_name = structureName
    //         req.session.login_name = req.body.login_name
    //   res.render("dashboard.ejs",{ userStructure: userStructure ,database_name: structureName,login_name: login_name})

}})




})








//datamanager render
app.post('/datamanager', (req, res) => {
    const login_name = req.body.login_name
    const structureName = req.body.login_name+"_device"
    const database_name = req.body.login_name+"_device"
   // console.log(structureName)
   req.session.hideButtons = false


    

conn.query('SELECT * FROM ??', [structureName], (structureError, structureResult) => {
    if (structureError) {
        console.error('Error fetching user structure:', structureError);
        res.send("Error fetching user structure");
    } else {

      //  console.log("structureResult"+structureResult)
      //  console.log(JSON.stringify(structureResult))
       const userStructure = structureResult
       req.session.userStructure = userStructure
        req.session.database_name = structureName
       res.status(200).json({ userStructure })
    //    req.session.userStructure = userStructure; // 将数据存储在会话中
    //         req.session.database_name = structureName
    //         req.session.login_name = req.body.login_name
    //   res.render("dashboard.ejs",{ userStructure: userStructure ,database_name: structureName,login_name: login_name})

}})




})



app.listen(5000)