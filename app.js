const express = require('express');
const app = express();
const path = require('path');

const userModel = require('./models/user');
const postModel = require('./models/post');
const upload = require('./config/multerconfig');

const multer = require('multer');
const multerconfig = require('./config/multerconfig');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const crypto = require('crypto');
const user = require('./models/user');

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

async function inLoggedIn(req,res,next){
    const myObject = Object.create(null);
    if(req.cookies.token === myObject.Object || req.cookies.token === ""){
        res.redirect("/login");
    }else{
        let data = jwt.verify(req.cookies.token, "tonmoy");
        let user = await userModel.findOne({email: data.user.email}).populate('post');
        req.user = user;
        next();
    }
}

function LoggedIn(req,res,next){
    const myObject = Object.create(null);
    if(req.cookies.token === myObject.Object || req.cookies.token === ""){
        next();
    }else{
        res.redirect('/profile'); 
    }
}


app.set('view engine', 'ejs');
app.get('/', LoggedIn,(req,res) => {
    res.render('index');
})
app.post('/register', async (req,res) =>{
    let {name, age, username, email, password} = req.body;
    let userE = await userModel.findOne({email});
    let userU = await userModel.findOne({username});
    if(!userE && !userU) {

        bcrypt.genSalt(10, (err,salt) => {
            bcrypt.hash(password, salt, async(err,hash) => {
                const data = await userModel.create({
                    name,
                    age,
                    username,
                    email,
                    password : hash
                })
                res.redirect('/login');
            })
        })
    }else{
        res.send('Already Registerd')
    }
})

app.get('/login',LoggedIn,(req,res) => {
    res.render('login');
})

app.post('/login', async(req,res) => {
    let {email,password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) {
        res.redirect('/login');
    }else{
    bcrypt.compare(password, user.password,(err,result)=>{
        if(result){
            let token = jwt.sign({user}, "tonmoy");
            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // Set to true in production with HTTPS
                sameSite: 'Strict',
                expires: new Date(Date.now() + 8 * 3600000), // 8 hours
              });
            res.redirect('/profile');


        }else{
            res.redirect('/login');
        }
    })
    }
})

app.get('/logout', (req,res) => {
    res.cookie('token', "");
    res.redirect("/login");
})

app.get('/profile',inLoggedIn, (req,res) => {
    res.render('profile', {user: req.user});
})

app.post('/post',inLoggedIn, async(req,res) => {
    let user = await userModel.findOne({email : req.user.email})
    let post = await postModel.create({
        userid: req.user._id, 
        comment: req.body.comment
    })
    user.post.push(post._id);
    await user.save();
    res.redirect('/profile');
    // res.send(user);
})

app.get('/like/:id',inLoggedIn, async(req,res) => {
    let post = await postModel.findOne({_id : req.params.id});
    if(post.likes.indexOf(req.user._id) === -1){
        
        post.likes.push(req.user._id); 
        
    }else{
        post.likes.splice(post.likes.indexOf(req.user._id), 1);

    }
    await post.save();
    res.redirect('/newsfeed');    

})

app.get('/edit/:id',inLoggedIn, async(req,res) => {
    let post = await postModel.findOne({_id : req.params.id});
    res.render("edit", {post});
})

app.post('/update/:id', inLoggedIn, async(req,res) => { 
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {comment: req.body.comment});
    res.redirect('/profile');
})

app.get('/newsfeed',inLoggedIn, async(req,res) => {
    let user = await userModel.find({}).populate('post');
    res.render("newsfeed", {user});
})

// for test on multer
app.get('/test', (req,res) => {
    res.render('test');
})
app.post('/upload', upload.single('photo'),(req,res, next) => {
    res.send('Done');
})



app.listen(8080);