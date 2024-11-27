//for test on multer
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, ('./uploads'));
    },
    filename : (req,file,cb) => {
        crypto.randomBytes(12, (err , hex)=> {
            const fn = hex.toString('hex')+ path.extname(file.originalname);
            cb(null, fn);
        })
    }
})


const upload = multer({storage : storage});
module.exports = upload;