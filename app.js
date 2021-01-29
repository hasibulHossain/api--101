const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid')
const multer = require('multer')
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const Post = require('./models/post');

const app = express();

const MONGODB_URI =
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.n3pys.mongodb.net/socialApp?retryWrites=true&w=majority`;

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads', 'images'));
    },
    filename: (req, file, cb) => {
        // const imageExtension = file.originalname.split(".").reverse()[0]; parse extName without help of "path" module.
        const imageExtension = path.extname(file.originalname);
        const photoName = `${uuid()}${imageExtension}`;
        cb(null, photoName);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// For fix to CORS errors
app.use((req, res, next) => {
    const aca = 'Access-Control-Allow-';
    res.setHeader(`${aca}Origin`, '*');
    res.setHeader(`${aca}Methods`, 'GET, POST, PUT, DELETE');
    res.setHeader(`${aca}Headers`, 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))


app.use('/images', express.static(path.join(__dirname, 'uploads', 'images')))



app.use((req, res, next) => {
    Post.find().then(posts => {
        req.posts = posts;
        next();
    })
        .catch(err => {
            console.log(err);
        })
})

app.use('/auth', authRoutes);
app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
        message: message
    });
})

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose
    .connect(MONGODB_URI)
    .then((_) => {
        const port = process.env.PORT || 3000
        app.listen(port);
    })
    .catch((err) => {
        console.log(Error(`mongooseConnect ${err}`));
    });