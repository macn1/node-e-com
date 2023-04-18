var express = require('express');
const { doLogin } = require('../helpers/user-helper');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const { response } = require('express');
const productHelpers = require('../helpers/product-helpers');
const userhelper =require('../helpers/user-helper')
const collections = require('../config/collections');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/signin',{admin:true,sig:true})

});

router.post('/',(req,res)=>{
  
  adminHelpers.doLogin(req.body.Name).then((response)=>{
    if (response) {
      req.session.logedIn = true
      req.session.admin = response.admin
      res.redirect('/admin/home')
      
    }else
    {
      req.session.loginEr="admin not exist"
      res.redirect('/admin')

    }


    
  })
  
})

router.get('/home',(req,res)=>{

  res.render('admin/home',{admin:true})
  

})



router.get('/products',(req,res)=>{

  productHelpers.getProduct().then((products)=>{
    
console.log(products);

res.render('admin/products',{admin:true,products:products})


  })
 

})

router.get('/add',(req,res)=>{

  res.render('admin/add',{admin:true,sig:true})
  
})

router.post('/add',(req,res)=>{
  // console.log("SDFGHJKL");
  // console.log(req.body);
let image = req.files.Image
console.log(image);

productHelpers.addProduct(req.body,(result)=>{
  image.mv("./public/product-images/" + result + ".jpg", (err, done) => {
    if (!err) {
      res.render("admin/add");
    }else{
      console.log(err);
    }
  });
})

})


router.get('/delete-product/:id',(req,res)=>{
  
  let prodId = req.params.id
  console.log(prodId)
 productHelpers.deleteProduct(prodId).then((resp)=>{
  console.log(resp);
  res.redirect('/admin/products')
 })

})

router.get('/edit-products/:id',(async(req,res)=>{

  let product = await productHelpers.getProductDetails(req.params.id)
  
  console.log(product);

  res.render('admin/edit-products',{admin:true,sig:true,product})


}))
router.post('/edit-products/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    let result =req.params.id
    res.redirect('/admin/home')
   
    if(req.files.Image){
      let image =req.files.Image
      image.mv("./public/product-images/" + result + ".jpg")

    }
  })

})

router.get('/users',async(req,res)=>{

  userhelper.getAllusers().then((users)=>{
  
// console.log(users,"xcvbnbvc")

  res.render('admin/users',{admin:true,users})
}
  )

})



module.exports = router;
