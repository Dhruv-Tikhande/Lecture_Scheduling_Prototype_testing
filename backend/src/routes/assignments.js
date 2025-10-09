import express from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} from '../controllers/assignments.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAssignments)
  .post(protect, createAssignment);

router.route('/:id')
  .get(protect, getAssignment)
  .put(protect, updateAssignment)
  .delete(protect, deleteAssignment);

router.route('/:id/submit')
  .post(protect, submitAssignment);

export default router;
