import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { corsOptions } from './config/corsOptions';
import credentialsMiddleware from './middleware/credentialsMiddeware';
import notFoundMiddleware from './middleware/notFoundMiddleware';
import authRouter from './routes/authRoute';
import userPublicRouter from './routes/userPublicRoute';
import userPrivateRouter from './routes/userPrivateRoute';
import adminRouter from './routes/adminRoute';
import codingProblemRouter from './routes/cProblemRoute';
import threadRouter from './routes/threadRoute';
import mathProblemRouter from './routes/mathProblemRoute';
import multer from 'multer';
import path from 'path';
import userRouter from './routes/userRoute';
import {initIOSocket} from './socket-server';
import {initRedisClient} from './redis/baseService';
import { isAuthenticated, isAuthenticatedOption } from './middleware/authMiddleware';
import appRootPath from 'app-root-path';


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, './images/'));
  },
  filename: function (req, file: any, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0]
    );
  }
});

const multi_upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Only .png, .jpg and .jpeg format allowed!');
      err.name = 'ExtensionError';
      return cb(err);
    }
  }
}).array('uploadedImages', 10);

const upload = multer({ storage: storage });

dotenv.config();
const app: Express = express();

// Middleware
app.use(credentialsMiddleware);
//app.use(cors(corsOptions));
app.use(express.json());
app.use(cors());

//app.use('/pdf', express.static(appRoot.path + '/static'));
app.post('/images', function (req: express.Request, res) {

  multi_upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res
        .status(500)
        .send({ error: { message: `Multer uploading error: ${err.message}` } })
        .end();
      return;
    } else if (err) {
      // An unknown error occurred when uploading.
      if (err.name == 'ExtensionError') {
        res
          .status(413)
          .send({ error: { message: err.message } })
          .end();
      } else {
        res
          .status(500)
          .send({
            error: { message: `unknown uploading error: ${err.message}` }
          })
          .end();
      }
      return;
    }

   
    // show file `req.files`
    // show body `req.body`
      
    if (req.files) {
      const fileList = req.files as Array<any>;
      console.log(fileList[0].filename);
    }
    console.log(req.body.username);
    res.status(200).end('Your files uploaded.');
  });
});

// Auth0 middleware

const verifyToken = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_URL,
  tokenSigningAlg: 'RS256'
});

// Public routes
app.use('/api/public/user/', userPublicRouter);
app.use('/api/auth', authRouter);

// Private routes
app.use('/api/user', verifyToken, userPrivateRouter);
app.use('/api/admin', verifyToken, adminRouter);
/*
const appRoot = require('app-root-path');
console.log(appRootPath);
*/
app.use('/images', express.static(path.resolve(__dirname ,'images')));
app.use('/api/codingproblem', codingProblemRouter);


app.use('/api/mathproblem',mathProblemRouter);
app.use('/api/discussion', threadRouter);
app.use('/api/user2', isAuthenticated,userRouter);

app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'Hello World from server.ts' });
});

// Middleware
app.use(notFoundMiddleware);


const PORT =process.env.PORT || 5000;

const server =  app.listen(PORT, () => {
  console.log(`Server is listening on port 8080`);
});
initRedisClient();
initIOSocket(server);



