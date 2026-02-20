import { Router } from 'express';
import * as authController from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { 
  registerValidation, 
  loginValidation, 
  changePasswordValidation 
} from '@/utils/validation';
import { handleValidationErrors } from '@/middleware/validation';
import { authRateLimiter } from '@/middleware/security';

const router = Router();

router.post('/register', 
  authRateLimiter,
  registerValidation,
  handleValidationErrors,
  authController.register
);

router.post('/login', 
  authRateLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

router.get('/profile', 
  authenticate,
  authController.getProfile
);

router.post('/change-password', 
  authenticate,
  changePasswordValidation,
  handleValidationErrors,
  authController.changePassword
);

router.post('/logout', 
  authenticate,
  authController.logout
);

export default router;
