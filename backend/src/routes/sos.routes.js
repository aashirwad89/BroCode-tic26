import { Router } from 'express';
import { triggerSOS, getSOSLogs } from '../controller/sos.controller.js';

const router = Router();

router.post('/trigger', triggerSOS);
router.get('/logs',     getSOSLogs);

export default router;