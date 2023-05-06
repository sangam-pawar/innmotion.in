const express = require("express")
const app = express()

app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"));


app.get("/", (req,res) => {
    console.log('Here')
    res.render("Home", {text : 'World'} )
    
})

app.get('/Dashboard', (  req , res) =>{
  res.render("Dashboard")
} )


// app.post('/Dashboard', (  req , res) =>{
//     console.log(req.body);
//   } )

app.post('/Dashboard' , ( req,res) => {
    console.log(req.body);
    res.render("Order" , {Info:req.body})
})
app.get('/Order',(req,res)  =>{
    res.render("Order")
})

app.listen(3000)