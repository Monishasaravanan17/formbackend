const express = require('express');
const app = express();
const mySql = require("mysql");
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const db = mySql.createConnection({
    user: "root",
    host: "localhost",
    password: "password",
    database: "login",

});
console.log(db, "hshedh");
db.connect(function (err) {
    if (err) throw err;
    console.log("Connected successfully!");
});
app.use(cors());
app.use(express.json());


app.post("/api/register", (req, res) => {
    console.log("register app hitted");

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const salt = 10;
    const encryptedPassword = bcrypt.hashSync(password, salt);
    console.log(encryptedPassword, ".......encrpted")
    const sqlInsert = "INSERT INTO loginform (firstname,lastname,email,password) VALUES (?,?,?,?)"
    const checkEmail = "SELECT * FROM loginform WHERE email = ?"
    db.query(checkEmail, [email], (err, result) => {
        if (err) {
            return res.send(err)
        }

        if (result.length > 0) {
            return res.send({ message: "user already exist,please login " });
        }
    })

    db.query(sqlInsert, [firstname, lastname, email, encryptedPassword], (err, result) => {
        if (err) {
            return res.send(err)
        } else {
            return res.send({ message: "registered successfully" })
        }


    })

})



app.post("/api/login", (req, res) => {
    console.log("hitted");
    const email = req.body.email;
    const password = req.body.password;

    db.query("SELECT * FROM loginform WHERE email = ? ", [email], (err, result) => {
        if (err) {
            console.log(err, "err occur");
            return res.send(err)

        }
        console.log(result);
        if (result[0]) {
            console.log("result");
            bcrypt.compare(password, result[0].password).then((success) => {
                console.log(success, 'success');
                const id = result[0].id
                console.log(id, "jwt start here...");
                const token = jwt.sign({ id }, "jwtsecret", {
                    expiresIn: "300s"
                })
                console.log(token, "jwt token");
                if (success) {
                    console.log(success, "password is right");
                    db.query(
                        "INSERT INTO tokentable (token) VALUES (?)",
                        [token], (err, autherisation) => {
                            if (err) {
                                console.log(err, "error occured");
                                return res.send(err)

                            }
                            console.log("response", res);
                            if (res) {
                                console.log("token created");
                                return res.send({ message: "login successful", token, result })
                            }

                        }
                    );
                    console.log("..session.....");
                } else {
                    res.send({ message: "wrong password" })
                }
            }).catch((failed) => {
                console.log(failed, "err occur");
                return res.send(failed)
            });
        } else {
            return res.send({ message: "wrong Email address" });
        }
    }
    )
});
app.post("/api/dashboard", (req, res) => {
    const token = req.body.token
    db.query(
        "SELECT * FROM tokentable WHERE token = ? ", [token], (err, result) => {
            if (err) {
                return res.send(err);
            }
            if (result[0]) {
                console.log(result, "result of dashboard");
                const rowdata = result[0].token;
                jwt.verify(token, "jwtsecret", function (err, decode) {
                    if (err) {

                        db.query("DELETE FROM tokentable WHERE token = ?", [token], (err, remove) => {
                            if (err) {
                                return res.send(err)
                            }
                            res.send({ message: "token was expired , login again" })
                        })

                    } else {
                        return res.send({ message: "WELCOME" });

                    }
                });
            }
        }
    );
    console.log(db, "dashboard db");
});
// app.get("/api/dashboard", (req, res) => {
// // const param = req.params
//     console.log(req, "get is hitted");``
//     console.log(req.headers.token,"token");
//     console.log (req.params.id,"param");
//     // db.query(

//     //     "SELECT * FROM session ",
//     //     [ req.header.userid,req.header.token],
//     //     (err, result) => {
//     //         if (err) {
//     //             res.send(err)
//     //             console.log(err, "err occur");
//     //         }

//             // const variable = jwt.verify(userid,result[0].id);
//             // console.log(variable,"..variable..");
//     //         // res.send(result)
//     //         console.log("changeddetails", login)
//     //         console.log("result", result);
//     //     }
//     // )
//     res.send("working")
// });
// app.get('/', function (req, res) {
//     res.send('Hello World');

//     const persons =  [{firstName:"Jo", lastName:"Do", age:46},
//     {firstName:"Josh", lastName:"Dosh", age:46},
//     {firstName:"Joshua", lastName:"arav", age:46}];
//     const Changeddetails = persons.map((person) =>{
//         person.firstName = "MONISHA"  

//     });
//     console.log("changeddetails",Changeddetails)
//     console.log(persons);
//  })
app.listen(3001, () => {
    console.log("port running...")
});