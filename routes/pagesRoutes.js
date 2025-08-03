const { Router } = require('express');
const authController = require('../controllers/authController');
const restController = require('../controllers/restController');
const router = Router();

router.get('/', restController.homePageGet);

router.get('/faqs', (req,res) => {
    res.render('./pages/faqs',{title: 'FAQs'});
});

router.get('/about-us', (req,res) => {
    res.render('./pages/aboutus',{title: 'About Us'});
});

router.get('/contact',(req,res) => {
    res.render('./pages/contact',{title: 'Contact',message:''});
});

router.get('/add-content', authController.verifyToken ,(req,res) => {
    res.render('./pages/add-content',{title: 'Add Content', message:''});
});

router.get('/categories', restController.categoriesGet);

router.get('/categories/:name', restController.categoryGet);

router.get('/post/:postid', restController.postGet);

router.get('/profile', authController.verifyToken ,restController.profileGet);

router.get('/verify/?',authController.verify);

module.exports = router;