import adminRouter from '#routes/admin/index.js';
import userRouter from '#routes/user/index.js';
import sellerRouter from '#routes/seller/index.js';
import systemRouter from '#routes/system/index.js';
import setModel from '#middlewares/setModel.js';

import express from 'express';
const router = express.Router({mergeParams: true});

router.use(/^(?!\/files\/).*$/, setModel);
// router.use('/', setModel);
router.use('/', adminRouter);
router.use('/', userRouter);
router.use('/', sellerRouter);
router.use('/', systemRouter);

export default router;