const { Router } = require('express');
const session = require('express-session');
const restController = require('../controllers/restController');
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

router.use(session({
    secret: 'mustafa_manhal_secret',
    resave: false,
    saveUninitialized: true
}));

router.post('/contact', restController.userMessage);

router.post('/edit-profile', upload.single('user_image'),restController.eidtProfile);

router.post('/add-content', upload.single('post_image'),restController.addingPosts);

router.get('/edit-post/:id',restController.editPost);

router.post('/edit-post/:id', upload.single('post_image'),restController.editpostPost);

router.get('/delete-post/:id', restController.deleteGet);

router.post('/delete-post/:id', restController.deletePost);

router.get('/archive-post/:id', restController.archiveGet);

router.post('/archive-post/:id', restController.archivePost);

router.get('/search',restController.searchGet);

module.exports = router;