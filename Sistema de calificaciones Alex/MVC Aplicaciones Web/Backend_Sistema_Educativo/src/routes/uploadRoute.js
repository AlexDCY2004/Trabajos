import { Router } from 'express';
import { subirFoto } from '../controllers/uploadController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

router.post('/foto', upload.single('foto'), subirFoto);

export default router;
