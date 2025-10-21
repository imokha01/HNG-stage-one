import { Router } from "express";
import { createString, getStrings, getStringsQuery } from "../controllers/controller.js";

const router = Router();

router.post('/', createString);

router.get('/:value', getStrings);

router.get('/', getStringsQuery )
export default router;