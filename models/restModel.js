const { db }= require('../config/db');

const UploadData = async (message,user_id) => {
    return new Promise(resolve => {
        db.query('INSERT INTO user_contact (user_message, user_id) VALUES (?,?)',
        [message,user_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('Message Inserted');
            }
        });
    });
}

const UploadMessage = async (user_first_name , user_lastname ,user_phone_num,user_email,user_message) => {
    return new Promise(resolve => {
        db.query('INSERT INTO contact_us (first_name,last_name,phone_number,email,message) VALUES (?,?,?,?,?)',
        [user_first_name , user_lastname ,user_phone_num,user_email,user_message],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('Message Inserted (user Not Loged)');
            }
        });
    });
}


const UpdatePassword = async (new_password,user_id) => {
    return new Promise(resolve => {
        db.query('UPDATE user_info SET user_password = ? WHERE user_id = ?',
        [new_password,user_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('Password Updated');
            }
        });
    });
}

const UpdataUserInto = async (user_id,user_email,user_first_name,user_last_name,user_bio,user_phone_num ,user_image,hide_phone,hide_email) => {
    return new Promise(resolve => {
        db.query('UPDATE user_info SET user_first_name = ? ,user_last_name = ? ,user_bio = ? ,user_phone_num= ? ,user_email = ? ,user_image = ? ,hide_phone = ? ,hide_email = ? WHERE user_id = ?',
        [user_first_name,user_last_name,user_bio,user_phone_num,user_email,user_image,hide_phone,hide_email,user_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('User Information Updated');
            }
        });
    });
}

const getImage = async (user_id) => {
    return new Promise(resolve => {
        db.query('SELECT user_image FROM user_info WHERE user_id = ?',
        [user_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(data);
            }
        });
    });
}

const updateConfirmed = async (user_id) => {
    return new Promise(resolve => {
        db.query(`UPDATE user_info SET user_confirmed = '1' WHERE user_id = ?`,
        [user_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('User email confirmed');
            }
        });
    });

}

const addPost = async (user_id,post_title,post_des,post_cate,post_image,post_lorf,post_date) => {
    return new Promise(resolve => {
        db.query('INSERT INTO user_post (user_id, post_title, post_des, post_cate, post_image, post_lorf, post_date) VALUES (?,?,?,?,?,?,?)',
        [user_id,post_title,post_des,post_cate,post_image,post_lorf,post_date],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('Post Added');
            }
        });
    });
}

const getPosts = async () => {
    return new Promise(resolve => {
        db.query('SELECT * FROM user_post',
        [],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(data);
                console.log('Getting posts');
            }
        });
    });
}

const gettingPost = async (post_id) => {
    return new Promise(resolve => {
        db.query('SELECT * FROM user_post WHERE post_id = ?',
        [post_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(data);
                console.log('Getting post');
            }
        });
    });
}

const editUserPost = async (post_title,post_des,post_cate,post_image,post_lorf,post_date,post_id) => {
    return new Promise(resolve => {
        db.query(`UPDATE user_post SET post_title = ? ,post_des = ? ,post_cate = ? ,post_image = ? ,post_lorf = ? ,post_date = ? ,post_edit = '1' WHERE post_id = ?`,
        [post_title,post_des,post_cate,post_image,post_lorf,post_date,post_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('Post Updated');
            }
        });
    });
}

const deleteUserPost = async (post_id) => {
    return new Promise(resolve => { 
        db.query(`DELETE FROM user_post WHERE post_id = ?`,
        [post_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('Post deleted');
            }
        });
    });
}

const archiveUpdate = async (post_id) => {
    return new Promise(resolve => {
        db.query(`UPDATE user_post SET post_archive = '1' , post_lorf = 'Archived' , post_image = 'uploads/1711030444789.jpg' WHERE post_id = ?`,
        [post_id],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('Post Archived');
            }
        });
    });
}

const newestPosts = async () => {
    return new Promise(resolve => {
        db.query('SELECT * FROM user_post WHERE post_lorf IN ("Lost", "Found") ORDER BY post_real_date DESC LIMIT 12',
        [],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(data);
                console.log('12 Newest Posts');
            }
        });
    });
}

const getSearchPosts = async (query) => {
    return new Promise(resolve => {
        db.query(`SELECT * FROM user_post WHERE post_title LIKE ?`,
        [query],(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else if (data[0] == null) {
                resolve(false);
                console.log('No results');
            } else {
                resolve(data);
                console.log('Search Posts');
            }
        });
    });
}

module.exports = {
    UploadData,
    UpdatePassword,
    UpdataUserInto,
    getImage,
    updateConfirmed,
    addPost,
    getPosts,
    gettingPost,
    editUserPost,
    deleteUserPost,
    archiveUpdate,
    newestPosts,
    getSearchPosts,
    UploadMessage,
}
