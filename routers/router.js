import { Router } from "express";
import { createString, test } from "../controllers/controller.js";

const router = Router();

router.get('/', test);

router.post('/strings', createString);

export default router;