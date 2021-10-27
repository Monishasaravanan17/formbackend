const express = require('express');
const app = express();
const mySql = require("mysql");
const cors = require('cors');
// const bodyParser = require('body-parser');


const db = mySql.createConnection({
    user: "root",
    host: "localhost",
    password: "password",
    database: "login",

});
console.log(db,"hshedh");
db.connect(function(err) {
    if (err) throw err;

    console.log("Connected successfully!");
  });
app.use(cors());
app.use(express.json());
// app.use(bodyParser.urlencoded({extended: true}));


app.post("/api/register", (req, res) => {

    const firstname = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    const password = req.body.password
  const sqlInsert = "INSERT INTO loginform (firstname,lastname,email,password) VALUES (?,?,?,?)"
    db.query(sqlInsert,[firstname,lastname,email,password] ,(err,result) =>{
        console.log(err, "++++error++++");
        console.log(result, "++++result++++");
    })
    res.send("hello")
})


app.post("/api/login" , (req,res) => {
    console.log("hitted");
    const email = req.body.email;
    const password = req.body.password;

    db.query(
        "SELECT * FROM loginform WHERE email = ? AND password = ?" ,
        [email,password],
        (err,result) => {
            if(err) {
                res.send(err)
                console.log(err,"err occur");
            }
            console.log(result);
            if(result.length > 0) {
                console.log("result");
                res.send({message:'success',result});
            }else {
                console.log("wrong");
                res.send({message:"wrong username/password"});
            }
        }
    )
})                                
 app.get("/", (req,res) => {
     res.send("hello world");
 });

app.listen(3001, () => {
    console.log("port running...")
});