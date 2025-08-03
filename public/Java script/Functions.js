import { changePassword , userMessage , eidtProfile , archivePost } from '../../controllers/restController.js';

export function yourMessage() {
    userMessage();
    // file.userMessage();
}

export function changeYourPassword() {
    // file.changePassword();
    changePassword();
}

export function eidtYourProfile() {
    eidtProfile();
    // file.eidtProfile();
}

export function archivePosts () {
    archivePost();
    // file.archiveGet();
}