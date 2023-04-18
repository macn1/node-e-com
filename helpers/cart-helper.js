var db = require("../config/connection");

const collections = require("../config/collections");
const { response } = require("express");
var objectId = require("mongodb").ObjectId;

module.exports = {
    
    addtoCart:(proId,userId)=>{

        let proObj ={
            item:objectId(proId),
            quantity:1
        }

        return new Promise (async( resolve, reject)=>{

            let userdet = await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})

            if (userdet) {

                let proExist = userdet.products.findIndex(product=>product.item==proId)
                console.log(proExist);
                if (proExist!=-1) 
                {
                    db.get().collection(collections.CART_COLLECTION).updateOne({
                        user:objectId(userId),
                        'products.item':objectId(proId)},{

                            $inc:{'products.$.quantity':1}
                        }).then(()=>{
                            resolve()
                        })
                }else{


                db.get().collection(collections.CART_COLLECTION).updateOne({user:objectId(userId)},{

                    $push:{
                        products:proObj
                    }
                }).then(()=>{
                    resolve()
                })
                }                
            }else{
                cartObj={
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                }) 
            }
            
        })
    },
 getCartProduct:(userId)=>{

    return new Promise(async(resolve,reject)=>{

        let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([

            {
                $match:{
                    user:objectId(userId)
                }
            },{
                $unwind:'$products'
            },{
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },{
                $lookup:{
                    from:collections.PRODUCT_COLLECTION,
                    localField:"item",
                    foreignField:"_id",
                    as:'product'
                }
            },{
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}

                }
            }
           
        ]).toArray()
        resolve(cartItems)
    })

 }, getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let count = 0;
        let cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})

        if (cart) {

            count = cart.products.length

        }
        resolve(count)

    })
 },changeProductQuantity:(details)=>{

   details.count=parseInt(details.count)
   details.quantity= parseInt(details.quantity)
    return new Promise((resolve,reject)=>{
        if (details.count==-1 && details.quantity==1) {
            db.get().collection(collections.CART_COLLECTION).updateOne({
                _id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}

                }).then((response)=>{
                    // console.log(response);
                    resolve({removeProduct:true})
                })
        }else{

            db.get().collection(collections.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
            {
                $inc:{'prodcuts.$.quanity':details.count}
            }).then((response)=>{
                resolve({status:true})
            })
    

        }
       
    })
 },removeProduct:(det)=>{
//  console.log(det);
    return new Promise(async(resolve,reject)=>{

        let item = await  db.get().collection(collections.CART_COLLECTION).findOne({_id:objectId(det.cart)})
      if (item) {
        db.get().collection(collections.CART_COLLECTION).updateOne({
            _id:objectId(det.cart)},
            {
                $pull:{products:{item:objectId(det.product)}}

            }).then((response)=>{
              
                resolve({deleteProduct:true})
            })
        
      }

    })
 }, getTotalAmount:(userId)=>{

    return new Promise(async(resolve,reject)=>{
        
        let total = await db.get().collection(collections.CART_COLLECTION).aggregate([

            {
                $match:{
                    user:objectId(userId)
                }
            },{
                $unwind:'$products'
            },{
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },{
                $lookup:{
                    from:collections.PRODUCT_COLLECTION,
                    localField:"item",
                    foreignField:"_id",
                    as:'product'
                }
            },{
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}

                }
            },
            
               
            
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity',{ $toInt:'$product.Price'}]}
                }
                }
            }
           
        ]).toArray()
        // console.log(total);
        resolve(total[0].total)

    })
 }

}

