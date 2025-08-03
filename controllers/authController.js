const userModel = require('../models/authModel');
const { validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const restModel = require('../models/restModel');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Use port 587 for TLS
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_ACCOUNT, // Your Gmail email address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
    },
  });

const sendConfirmationEmail = async (email,confirmationLink) => {
    try {
            
        // Send email
        await transporter.sendMail({
        from: process.env.EMAIL_ACCOUNT, // Sender address (your Gmail email)
        to: email, // Recipient address
        subject: 'Lost and Found Web Platform | Confirm Your Email', // Email subject
        html: `
            <p>Thank you for signing up! Please click the link below to confirm your email:</p>
            <a href="${confirmationLink}">Click me</a>
        `,
        });

        console.log(`Confirmation email sent to ${email}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

const maxAge = 3 * 24 * 60 * 60;

const creatToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: maxAge});
}

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    //check jwt is Exist and is verified
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.status(403).redirect('/login');
            } else {
                // console.log(decodedToken);
                // req.user = user;
                next();
            }
        });
    } else {
        return res.redirect('/login');
    }
}

// Check current user
const checkUser = async (req,res,next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, async (err, deCodedToken) => {
            if (err) {
              console.log(err.message);
              res.locals.user = null;
              next();
            } else {
            let user = await db.getUserByEmail(deCodedToken.id);
            req.user = user;
            res.locals.user = user;
            next();
          }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

const valid = (page,req,res,title) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return true;
    } else {
        const alert = errors.array().map(error => error.msg);
        console.log(alert);
        return res.render(page,{
            title: title , message: alert
        });
    }
}

const edit_profile_info_get = (req,res) => {
    res.render('./pages/edit-profile-info',{ title: 'Edit Profile Information', message: '' });
}

const change_password_get = (req,res) => {
    res.render('./pages/change-password',{ title: 'Change Password', message: '' });
}

const signup_get = (req,res) => {
    res.render('./pages/get-started',{ title: 'Get Started', message: ''});
}

const login_get = (req,res) => {
    res.render('./pages/login',{title: 'Log in', message: ''});
}

const signup_post = async (req,res) => {
    const { user_email , user_first_name , user_password , passwordCon , user_last_name , user_bio,	user_phone_num ,user_image,hide_phone,hide_email} = req.body;
    const existingUser = await db.getUserByEmail(user_email);

    if (existingUser) {
        res.render('./pages/get-started', { title:'Get started' , message: 'Email is already in use' });
      } else if (user_password !== passwordCon) {
        res.render('./pages/get-started', { title:'Get started' , message: 'Passwords do not match' });
      } else {
        const hashedPassword = bcrypt.hashSync(user_password, 10);
        
        // Save the user to the database
        // Redirect to login page or dashboard after successful signup

        if (valid('./pages/get-started',req,res,"Get Started") == true) {
            try {
                const userImage = req.file.path;
                const user = await userModel.creatuser(user_email,user_first_name,hashedPassword,user_last_name,user_bio,user_phone_num ,userImage,hide_phone,hide_email);
                const token = creatToken(user_email);
                const confirmationLink = `http://localhost:3000/verify/?token=${token}`;
                const sendingEmail = await sendConfirmationEmail(user_email, confirmationLink);
                res.cookie('jwt',token, {httpOnly: true});
                
                if(user == true) {
                    // return res.status(200).json({Success : "User Created"});
                    return res.status(200).render('./pages/login',{title:'Log in',message: 'Please check your email to verify it'});
                }
                
            } catch(err) {
                console.log('Error :',err);
                res.status(400).json({Error: "User not Created"});
            }
          }

      }  
}

const login_post = async (req,res) => {
    const {user_email , user_password} = req.body;
    
    const user = await db.getUserByEmail(user_email);
    
    if (user && bcrypt.compareSync(user_password, user.user_password)) {

    if (user.user_confirmed == 1) {
        // Successful login
        req.session.user_id = user.user_id;
        const token = creatToken(user.user_email);
        // Set HTTP-only cookie for the token
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
      } else if (user.user_confirmed == 0 || user.user_confirmed == null) {
        res.render('./pages/login', { title: 'Log in',message: 'Please confirm your email to login' });
      }
    } else {
        res.render('./pages/login', { title: 'Log in',message: 'Invalid email or password' });
    }
}

const verify = async (req,res) => {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userEmail = decoded.id;
    const user = await db.getUserByEmail(req.userEmail);
    try {
        // Update user's verified status to true in the database
        const update = await restModel.updateConfirmed(user.user_id);
        if(update == true) {
        res.render('./pages/login',{ title: 'Log in',message: 'Email confirmed successfully!' });
        } else {
            res.render('./pages/login',{ title: 'Log in', message: 'Error verifying email!' });
        }
      } catch (error) {
        res.render('./pages/login',{ title: 'Log in', message: 'Error verifying email!!' });
      }
}

const changePassword = async (req,res) => {
    const { user_email , user_password , user_password_n , user_password_ncon} = req.body;
    
    try {
        let user_data;
        if (user_email == null) {

            user_data = await db.getUserById(req.user.user_id);
            if(user_password_n == user_password_ncon) {
            if (bcrypt.compareSync(user_password, user_data.user_password)) {
            
            const hashedPassword = bcrypt.hashSync(user_password_n, 10);
            const update_password = await restModel.UpdatePassword(hashedPassword,user_data.user_id);
    
            if (update_password == true) {
                return res.status(200).render('./pages/change-password',{title:'Change Password',message: 'You successfully update your password'});
            }
            } else {
                return res.status(400).render('./pages/change-password',{title:'Change Password',Error: "password not change",message:'your old password is not correct'});
            }
            } else {
                return res.status(400).render('./pages/change-password',{title:'Change Password',Error: "password not change",message:'your New passwords does not match'});
            }
        } else {
            user_data = await db.getUserByEmail(user_email);
            
            if(user_password_n == user_password_ncon) {
                const hashedPassword = bcrypt.hashSync(user_password_n, 10);
                const update_password = await restModel.UpdatePassword(hashedPassword,user_data.user_id);
        
                if (update_password == true) {
                    return res.status(200).render('./pages/change-password',{title:'Change Password',message: 'You successfully update your password'});
                }
                } else {
                    return res.status(400).render('./pages/change-password',{title:'Change Password',Error: "password not change",message:'your new passwords does not match'});
                }
        }
        
    } catch (err) {
        console.log('Error :',err);
        res.status(400).render('./pages/change-password',{title:'Change Password',Error: "password not change",message:'something went wrong, Please try again.'});
    }
 
}

module.exports = {
    signup_get,
    signup_post,
    login_get,
    login_post,
    creatToken,
    verifyToken,
    valid,
    checkUser,
    change_password_get,
    edit_profile_info_get,
    sendConfirmationEmail,
    verify,
    changePassword,
}