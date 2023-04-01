const bodyParser = require('body-parser');
const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const {graphqlHTTP} = require('express-graphql');
const graphqlSchema = require('./GRAPHQL/schema')
const graphqlResolver = require('./GRAPHQL/resolver')
const port = 4000;

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

app.use(bodyParser.json()); //for content type application/json

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');// set which origins are allowed
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST , PUT, PATCH, DELETE'); //to set which methods 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    // res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
});

app.use('/graphql', graphqlHTTP({
    schema:graphqlSchema,
    rootValue:graphqlResolver,
    graphiql:true
}))
  // multiple image
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now().toString()}_${file.originalname}`)
    }
});
 const fileFilter = (req, file, cb) => {
const ext = path.extname(file.originalname)
    if (ext !== '.jpg' || ext !== '.png' || ext !== '.jpeg') {
        cb(null, false);
     }
cb(null, true)
}


app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));




app.use('/feeds', feedRoutes);
app.use(authRoutes);
app.get('/', (req, res) => res.send('Hello World!'));

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "some error"
    res.status(status).json({ message: message });
});

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
        const io = require('./socket.js').init(server);
        io.on('connection',(socket)=> {
            console.log(socket, " the connection established");
        });
    })
    .catch(err => {
    console.log(err);
})

