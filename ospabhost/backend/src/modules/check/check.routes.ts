import { Router } from 'express';
import { uploadCheck, getChecks, approveCheck, rejectCheck } from './check.controller';
import { authMiddleware } from '../auth/auth.middleware';
import multer, { MulterError } from 'multer';
import path from 'path';

const router = Router();

// Настройка Multer для загрузки чеков
const storage = multer.diskStorage({
	destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
		cb(null, path.join(__dirname, '../../../uploads/checks'));
	},
	filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	}
});
const allowedMimeTypes = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/jpg'
];

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
				} else {
					// Кастомная ошибка для Multer
					const err: any = new Error('Недопустимый формат файла. Разрешены только изображения: jpg, jpeg, png, gif, webp.');
					err.code = 'LIMIT_FILE_FORMAT';
					cb(err, false);
				}
	}
});

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadCheck);
router.get('/', getChecks);
router.post('/approve', approveCheck);
router.post('/reject', rejectCheck);

export default router;
