const {db}= require('../config/db');

const creatuser = async (user_email,user_first_name,user_password,user_last_name,user_bio,user_phone_num ,user_image,hide_phone,hide_email) => {
    var user_info = {user_first_name,user_email,user_password,user_last_name,user_bio,user_phone_num ,user_image,hide_phone,hide_email};
    return new Promise(resolve => {
        db.query('INSERT INTO user_info SET ?',
        user_info,(err,data) => {
            if(err) {
                console.error(err);
                resolve(false);
            } else {
                resolve(true);
                console.log('Data Inserted');
            }
        });
    });
}


module.exports = {
    creatuser,
};