var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports ={
    doLogin:(userData)=>{

        return new Promise(async(resolve,reject)=>{
            let status =false
            let response = {}

            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Name:userData})
                if (admin) {
                    response.admin=admin
                    response.status=true
                    resolve(response)
                    console.log("admin-login success");
                    
                }else{
                    console.log("login failed");
                    resolve({status:false})

                }

            })
            
            
        }


}