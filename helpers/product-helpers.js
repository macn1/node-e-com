var db = require('../config/connection')

const collections = require('../config/collections');
var objectId= require("mongodb").ObjectId

module.exports={
    addProduct:(product,cb)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
            cb(data.insertedId)
        })   
     },
     getProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products =  await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
                resolve(products)
            
        })
     },deleteProduct:(proId)=>{
        console.log('sssss',proId)
        return new Promise((resolve,reject)=>[
            

            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                

console.log(response);
                
                resolve(response)
            })
        ])
     },getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
     },updateProduct:(proId,ProductDetails)=>{
        return new Promise((resolve,reject)=>{

                db.get().collection(collections.PRODUCT_COLLECTION)
                .updateOne({_id:objectId(proId)},{
                    $set:{Name:ProductDetails.Name,
                    Category:ProductDetails.Category,
                Description:ProductDetails.Description,
                    Price:ProductDetails.Price}
                }).then((response)=>{
                    resolve()
                })
        })
     }
     
}