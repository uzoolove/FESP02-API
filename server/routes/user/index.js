import express from 'express';

import jwtAuth from '#middlewares/jwtAuth.js';
import userRouter from './users.js';
import productRouter from './products.js';
import cartRouter from './carts.js';
import orderRouter from './orders.js';
import replyRouter from './replies.js';
import bookmarkRouter from './bookmarks.js';
import postRouter from './posts.js';
import notificationRouter from './notifications.js';

const router = express.Router({mergeParams: true});

router.use('/users', userRouter);
router.use('/products', productRouter);
router.use('/orders', jwtAuth.auth('user'), orderRouter);
router.use('/replies', replyRouter);
router.use('/carts', cartRouter);
router.use('/bookmarks', jwtAuth.auth('user'), bookmarkRouter);
router.use('/posts', postRouter);
router.use('/notifications', notificationRouter);

export default router;