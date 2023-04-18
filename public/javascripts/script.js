function addToCart(proId){
  $.ajax({
      url:'/add-to-cart/'+proId,
      method:'get',
      success:(response)=>{
        console.log(response.status,"dfghjklkjhgcfgbnm");
        if (response.status ) {
          let count =$('#cart-count').html()
          console.log(count);
          count = parseInt(count)+1
          // console.log(count);
          $('#cart-count').html(count)
        
          console.log(count);
        }
        
      }

  })
}
