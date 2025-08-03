const restModel = require('../models/restModel');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const userMessage = async (req,res) => { 
    const { userlog,user_first_name , user_phone_num, user_lastname , user_message , user_email } = req.body;
    let upload_message, upload_unuser_message;
    try {
        const user_data = await db.getUserByEmail(user_email);
        if (userlog == true) {
            upload_message = await restModel.UploadData(user_message,user_data.user_id);
        } else if (userlog == false) {
            upload_unuser_message = await restModel.UploadMessage(user_first_name , user_lastname ,user_phone_num,user_email,user_message);
        }
        if (upload_message == true) {
            return res.status(200).render('./pages/contact',{title:'Contact',message: 'We successfully received your message. We will contact you as soon as possible.'});
        } else if (upload_unuser_message == true) {
            return res.status(200).render('./pages/contact',{title:'Contact',message: 'We successfully received your message. We will contact you as soon as possible.'});
        }
    } catch (err) {
        console.log('Error :',err);
        res.status(400).render('./pages/contact',{Error: "Message Not Uploaded",message:'something went wrong, Please try again.'});
    }
}



const eidtProfile = async (req,res) => {
    const { user_password,user_image ,user_email , user_phone_num , user_first_name , user_last_name , user_bio,hide_phone,hide_email} = req.body;
    
    try {
        const user = await db.getUserById(req.user.user_id);

        if (bcrypt.compareSync(user_password, user.user_password)) {
            const userImage = req.file.path;
            const updateUser = await restModel.UpdataUserInto(req.user.user_id,user_email,user_first_name,user_last_name,user_bio,user_phone_num ,userImage,hide_phone,hide_email);
            if (updateUser) {
                res.render('./pages/edit-profile-info',{title:'Edit Profile Information', message:'You successfully update your information'});
            } else {
                res.render('./pages/edit-profile-info',{title:'Edit Profile Information', message:'Something went wrong, Please try again'});
            }
        } else {
            res.render('./pages/edit-profile-info',{title: 'Edit Profile Information', message:'Your password is not correct'});
        }
    } catch (err) {
        console.log('Error :',err);
        res.render('./pages/edit-profile-info',{title:'Edit Profile Information',Error: "info not change",message:'something went wrong, Please try again.'});
    }
}

const profileGet = async (req, res) => {
    try {
        const photo = await restModel.getImage(req.user.user_id);
        const userposts = await restModel.getPosts();
        
        let posts = [];
        for (let i = 0; i< userposts.length; i++) {
            if (req.user.user_id == userposts[i].user_id) { 
                posts[i] = userposts[i];
            }
        }

        res.render('./pages/profile',{title: 'Profile', photo:photo[0].user_image,posts,message:''});
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Internal Server Error');
    }
}

const addingPosts = async (req,res) => {
    const {post_title,post_des,post_cate,post_image,post_lorf} = req.body;
    try {
        const postImage = req.file.path;
    
        const date = new Date().toDateString();
        const hour = new Date().getHours();
        const min = new Date().getMinutes();
        const fullDate = date + " " + hour + ":" + min;

        const add = await restModel.addPost(req.user.user_id,post_title,post_des,post_cate,postImage,post_lorf,fullDate);
        
        const post = {
            post_title:post_title,
            post_des:post_des,
            post_image:postImage,
            post_date:fullDate,
            post_lorf:post_lorf,
        }

        const userPost = await db.getUserById(req.user.user_id);

        if (add == true) {
            res.render('./pages/post-view',{title: 'Your Post', message:'',post,userPost});
        } else {
            res.render('./pages/add-content',{title: 'Add content', message:'Something went wrong, please try again'});
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
}

const categoriesGet = async (req,res) => {

    try {
        const posts = await restModel.getPosts();
        
        if (posts != null) {
            res.render('./pages/categories',{title: 'Categories',posts});
        } else {
            res.render('./pages/categories',{title: 'Categories', message:'something was wrong, Please try again'});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const postGet = async (req,res) => {
    var postId = req.params.postid;
    try {
        const post = await restModel.gettingPost(postId);
        const userPost = await db.getUserById(post[0].user_id);

        if (post != null) {
            res.render('./pages/post-view',{title: 'Your Post',message:'',post:post[0] , userPost});
        } else {
            res.render('./pages/categories',{title: 'Categories', message:'something was wrong, Please try again'});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const categoryGet = async (req,res) => {
    const categoryName = req.params.name;

    try {
        const post = await restModel.getPosts();
        let posts = [];
        for (let i = 1; i < post.length; i++) {
            if (post[i].post_cate == categoryName ) {
                posts[i] = await post[i];
            }
        }
        posts.sort();

        if (posts != null) {
            res.render('./pages/category-view',{categoryName, title: `${categoryName} Category`,posts});
        } else {
            res.render('./pages/categories',{title: 'Categories', message:'something was wrong, Please try again'}); 
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const editPost = async (req,res) => {
    const postId = req.params.id;
    try {
        const post = await restModel.gettingPost(postId);
        if ( post != null) {
            res.render('./pages/edit-post',{title: 'Edit Post',message:'',post:post[0]});
        } else {
            res.render('./pages/post-view',{title: 'Your Post',message:'You can not edit this post',post:post[0]});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const editpostPost = async (req,res) => {
    const {post_title,post_des,post_cate,post_lorf} = req.body;
    const postImage = req.file.path;
    const postId = req.params.id;

    try {
        const userPost = await restModel.gettingPost(postId);
        const date = userPost[0].post_date + " Edited";
        const edit = await restModel.editUserPost(post_title,post_des,post_cate,postImage,post_lorf,date,postId);
        const post = {
            post_id:userPost[0].post_id,
            post_title:post_title,
            post_des:post_des,
            post_image:postImage,
            post_date:date,
            post_lorf:post_lorf,
            post_archive:userPost[0].post_archive,
            post_edit:userPost[0].post_edit,
        }
        if (edit == true) {
            res.render('./pages/post-view',{title: 'Your Post',message:'You Successfully edit your post',post:post,userPost});
        } else {
            res.render('./pages/edit-post',{title: 'Edit Post', message:'Something went wrong, please try again',post:post[0]});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const deletePost = async (req,res) => {
    const postId = req.params.id;
    try {
        const deletePost = await restModel.deleteUserPost(postId);
        // const userPost = await restModel.gettingPost(postId);
        if (deletePost == true) {
            res.render('./pages/delete-post-page',{title: 'Your Post',message:'You successfully deleted your post from your profile and from our servers'});
        } else {
            res.render('./pages/delete-post-page',{title: 'Your Post',message:'Something went wrong, please try again'});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const deleteGet = async (req,res) => {
    const postId = req.params.id;
    try {
        const userPost = await restModel.gettingPost(postId);

        if (userPost != null) {
            res.render('./pages/delete-post',{title: 'Delete Post',message:'',post:userPost[0]})
        } else {
            res.render('./pages/delete-post',{title: 'Delete Post',message:'something went wrong, please try again',post:userPost[0]})
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const archivePost = async (req,res) => {
    const postId = req.params.id;
    try {
        const archiveUpdate = await restModel.archiveUpdate(postId);
        const userPost = await restModel.gettingPost(postId);

        if (archiveUpdate == true) {
            res.render('./pages/post-view',{title: 'Your Post', message:'You Successfully Archived your post',post:userPost[0],userPost}); 
        } else {
            res.render('./pages/post-view',{title: 'Your Post', message:'Something went wrong, please try again',post:userPost[0]});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const archiveGet = async (req,res) => {
    const postId = req.params.id;
    try {
        const userPost = await restModel.gettingPost(postId);

        if (userPost != null) {
            res.render('./pages/archive-post',{title: 'Archive your Post',message:'',post:userPost[0]});
        } else {
            res.render('./pages/archive-post',{title: 'Archive your Post',message:'something went wrong, please try again',post:userPost[0]})
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const homePageGet = async (req,res) => {
    try {
        const newestPosts = await restModel.newestPosts();
        
        res.render('index',{title: 'Home Page', post:newestPosts});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

const searchGet = async (req,res) => {
    const query = req.query.query;
    const {post_cate , post_lorf} = req.query;
    try {
        let post;
        let postfilter = await restModel.getSearchPosts(`%${query}%`);
        let filterd = [];
        if (post_cate != '-' && post_lorf != '-') {
            for (let i = 0; i < postfilter.length; i++) {
                if (post_cate == postfilter[i].post_cate && post_lorf == postfilter[i].post_lorf) {
                    filterd[i] = postfilter[i];
                }
            }
            filterd.sort();
        } else if (post_cate != '-' || post_lorf != '-') {
            if (post_cate != '-') {
                for (let i = 0; i < postfilter.length; i++) {
                    if (post_cate == postfilter[i].post_cate) {
                        filterd[i] = postfilter[i];
                    }
                }
                filterd.sort();
            } else if (post_lorf != '-') {
                for (let i = 0; i < postfilter.length; i++) {
                    if (post_lorf == postfilter[i].post_lorf) {
                        filterd[i] = postfilter[i];
                    }
                }
                filterd.sort();
            }
            
        }
        if (filterd[0] != null) {
            res.render('./pages/searchbar',{title:'Search',post:filterd,message:''});
        } 
        if (filterd[0] == null) {
            post = await restModel.getSearchPosts(`%${query}%`);

            if (post != null) {
                res.render('./pages/searchbar',{title:'Search',post,message:''});
            } else if (post == false) {
                res.render('./pages/searchbar',{title:'Search',post,message:'There is no results'});
            }
        } 
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports  = {
    userMessage,
    eidtProfile,
    profileGet,
    addingPosts,
    categoriesGet,
    postGet,
    categoryGet,
    editPost,
    editpostPost,
    archivePost,
    archiveGet,
    deleteGet,
    deletePost,
    homePageGet,
    searchGet,

}