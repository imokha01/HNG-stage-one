import { Router } from "express";
import { createString, getStrings, getStringsQuery, getStringsByLanguage, deleteString } from "../controllers/controller.js";

const router = Router();

router.post('/', createString);

router.get('/filter-by-natural-language', getStringsByLanguage);


router.get('/', getStringsQuery )

router.get('/:value', getStrings);

router.delete('/:value', deleteString);


export default router;