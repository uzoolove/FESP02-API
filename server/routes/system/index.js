import fileRouter from './files.js';
import authRouter from './auth.js';
import codeRouter from './codes.js';

import express from 'express';
const router = express.Router({mergeParams: true});

router.use('/files', fileRouter);
router.use('/auth', authRouter);
router.use('/codes', codeRouter);

export default router;