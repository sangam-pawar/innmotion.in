const express = require("express")
const app = express()
var con = require("./database.js");

app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"));

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'YogA8hppjtG7AkABVRpDjyLyyEhgoF5O',
  issuerBaseURL: 'https://dev-t42orpastoaad3st.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router

app.get('/profile', (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
  });

app.get("/", (req,res) => {
    console.log('Here')
    if (req.oidc.isAuthenticated()) {
        
    
    user = JSON.stringify(req.oidc.user["nickname"], null, 2).replace(/"/g, "");
    res.render("Home", {name : user  , isAuthenticated :req.oidc.isAuthenticated()} )
}else{
res.render("Home", {isAuthenticated :req.oidc.isAuthenticated()}  )
}
    
})

app.get('/Dashboard', (  req , res) =>{
  res.render("Dashboard")
} )


// app.post('/Dashboard', (  req , res) =>{
//     console.log(req.body);
//   } )

app.post('/Dashboard' , ( req,res) => {
    console.log(req.body);
    user = JSON.stringify(req.oidc.user["nickname"], null, 2).replace(/"/g, "");
    const {name ,contact , item , fragile ,big, vehicle , from , to ,plan} = req.body

    con.query(
        `INSERT INTO orders ( name ,contact , item , fragile ,big, vehicle , destination , droppoint ,plan) VALUES ('${name}','${contact}' ,'${item}' ,'${fragile}','${big}' ,'${vehicle}','${from}','${to}','${plan}')`,
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
          res.redirect('/')
        }
      );
    
})
app.get('/Order',(req,res)  =>{
    res.render("Order")
})

app.listen(3000)