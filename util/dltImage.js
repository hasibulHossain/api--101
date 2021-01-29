const path = require('path');
const fs = require('fs-extra');
const rootPath = require('./rootPath');

module.exports = dltImage = (imgName) => {
    const imgPath = path.join(rootPath, 'uploads', imgName);

    fs.unlink(imgPath)
        .then(_ => {
            console.log(imgPath)
        })
        .catch(err => {
            console.log('delete image => ', err);
        })
}