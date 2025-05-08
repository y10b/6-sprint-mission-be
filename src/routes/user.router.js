import { Router } from 'express';
import { registerUser, loginUser, getMyProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/me', authenticate, getMyProfile);

export default userRouter;
