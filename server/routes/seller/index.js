import productRouter from './products.js';
import orderRouter from './orders.js';
import jwtAuth from '#middlewares/jwtAuth.js';

import express from 'express';
const router = express.Router({mergeParams: true});

router.use('/seller/products', jwtAuth.auth('seller'), productRouter);
router.use('/seller/orders', jwtAuth.auth('seller'), orderRouter);

export default router;