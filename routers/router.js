import { Router } from "express";
import { createString, getStrings } from "../controllers/controller.js";

const router = Router();

router.post('/', createString);

router.get('/:value', getStrings);

export default router;