import { PrismaClient } from '@prisma/client';
import { Router, Request, Response } from 'express';
import {
  getCategoriesAndTagsCtl,
  getCodingProblemsCtl,
  getProblemCtl
} from '../controllers/cProblemController';

const router: Router = Router();

router.get('/problem/:problemId', getProblemCtl);
router.get('/categories_tags', getCategoriesAndTagsCtl);
router.post('/search', getCodingProblemsCtl);
export default router;
