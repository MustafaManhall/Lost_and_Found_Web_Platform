const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mainPages = require('./routes/pagesRoutes');
const authPages = require('./routes/authRoutes');
const authController = require('./controllers/authController');
const restRoutes = require('./routes/restRoutes');
const app = express();
require('dotenv').config();

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
  }));

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

// app.use(express.static('public'));
app.use('/public', express.static('public'));
app.use('/uploads', express.static('./uploads'));
// app.use('/controllers',express.static('./controllers'));

app.use(morgan('dev'));

app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});

// middlewares Routes
app.use('*',authController.checkUser);

app.use(restRoutes);

app.use(authPages);

app.use(mainPages);

app.use((req,res) => {
    res.status(404).render('404',{title: '404'});
});