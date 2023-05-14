const express = require("express")
const app = express()
var con = require("./database.js");
var {model , tf ,xsTensor , ysTensor} = require("./model.js");
var isWin = process.platform === "win32";

var baseurl = 'http://localhost:3000'

app.set('view engine','ejs')
app.use(express.urlencoded({extended:false}))
app.use(express.static("public"));

const { auth } = require('express-openid-connect');
if (!isWin) {
  baseurl = 'https://innmotion.in'
  
}
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: baseurl,
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
  res.render("Dashboard",{isAuthenticated:req.oidc.isAuthenticated()})
} )


// app.post('/Dashboard', (  req , res) =>{
//     console.log(req.body);
//   } )

app.post('/Dashboard' , ( req,res) => {
    console.log(req.body);
    user = JSON.stringify(req.oidc.user["nickname"], null, 2).replace(/"/g, "");
    userid = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");
    const {name ,contact ,email, item , fragile ,big,distance, vehicle , from , to ,plan} = req.body

    con.query(
        `INSERT INTO orders (  userid,name ,contact ,email, item , fragile ,big, vehicle ,distance, destination , droppoint ,plan) VALUES ('${userid}','${name}','${contact}' , '${email}', '${item}' ,'${fragile}','${big}' ,'${vehicle}','${distance}','${from}','${to}','${plan}')`,
        function (err, result, fields) {
          if (err) {
            console.log(err);
          }
        }
      );

      
    const truckcost = 11;
    const tempocost = 4.4;
    const autocost = 3.3;
    

    con.query(
      `SELECT * FROM orders WHERE userid='${userid}'`,
      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
        cost = 0;
        console.log(result[0].vehicle + "this");
        if (result[0].vehicle === 'truck') {
          

          model.fit(xsTensor, ysTensor, {epochs: 1000}).then(async() => {
            const prediction = model.predict(tf.tensor2d([[(result[0].distance - 100) / 50, (truckcost - 3) / 1.5]])); 
            price = prediction.dataSync()[0] * 100 + 200;
            console.log('Predicted price:', price);

            cost = price
            res.render("Order",{info:req.body  ,isAuthenticated:req.oidc.isAuthenticated(),cost:cost})

          });
          // cost = (parseFloat(truckcost)*parseFloat(result[0].distance))+80 +50

          
          // console.log(cost);
        }

        if (result[0].vehicle === 'tempo') {
          model.fit(xsTensor, ysTensor, {epochs: 1000}).then(async() => {
            const prediction = model.predict(tf.tensor2d([[(result[0].distance - 100) / 50, (tempocost - 3) / 1.5]])); 
            price = prediction.dataSync()[0] * 100 + 200;
            console.log('Predicted price:', price);

            cost = price
            res.render("Order",{info:req.body  ,isAuthenticated:req.oidc.isAuthenticated(),cost:cost})

          });
          
          // cost = (parseFloat(tempocost)*parseFloat(result[0].distance))+80 +50
          
          
          // console.log(cost);
        }

        if (result[0].vehicle === 'auto') {
          
          model.fit(xsTensor, ysTensor, {epochs: 1000}).then(async() => {
            const prediction = model.predict(tf.tensor2d([[(result[0].distance - 100) / 50, (autocost - 3) / 1.5]])); 
            price = prediction.dataSync()[0] * 100 + 200;
            console.log('Predicted price:', price);

            cost = price
            res.render("Order",{info:req.body  ,isAuthenticated:req.oidc.isAuthenticated(),cost:cost})

          });

          // cost = (parseFloat(autocost)*parseFloat(result[0].distance))+80 +50
          
          
          // console.log(cost);
        }

        
      }
    );
    
})
app.get('/Order',(req,res)  =>{


   
    userid = JSON.stringify(req.oidc.user["sub"], null, 2).replace(/"/g, "");

    con.query(
      `SELECT * FROM orders WHERE userid='${userid}`,
      function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        console.log(result);
       

        
        res.render("Order",{info:req.body  ,isAuthenticated:req.oidc.isAuthenticated()})
      }
    );


 
    res.render("Order",{isAuthenticated:req.oidc.isAuthenticated()})
})

app.listen(3060)