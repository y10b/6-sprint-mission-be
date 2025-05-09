import { Router } from 'express';
import { registerUser, loginUser, getMyProfile, logoutUser } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { refreshAccessToken } from '../controllers/refreshAccessToken.controller.js';

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/me', authenticate, getMyProfile);
userRouter.post('/refresh', refreshAccessToken);
userRouter.post('/logout', authenticate, logoutUser);
export default userRouter;
