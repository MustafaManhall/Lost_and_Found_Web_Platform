const { Router } = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const router = Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination:(req,file, cd) => {
        cd(null,'uploads');
    },
    filename:(req,file,cd) => {
        console.log(file);

        cd(null,Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({storage:storage});

router.get('/get-started',authController.signup_get);
router.get('/login',authController.login_get);

router.post('/get-started', upload.single('user_image'),[
    check('user_first_name','please enter valid name').isString().exists(),
    check('user_email','please enter a valid email').exists().isEmail().normalizeEmail(),
    check('user_password','that password must be 8 or more character long').exists().isLength({min:8})
]
,authController.signup_post);

router.post('/login', authController.login_post);

router.get('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token');
    res.clearCookie('jwt');
    res.redirect('/');
  });

router.get('/change-password',authController.change_password_get);
router.get('/edit-profile',authController.verifyToken ,authController.edit_profile_info_get);

router.post('/change-password', authController.changePassword);

module.exports = router;