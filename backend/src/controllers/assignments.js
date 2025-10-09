import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

export const getAssignments = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'faculty' || req.user.role === 'instructor') {
      query = { faculty: req.user.id };
    } else if (req.user.role === 'student') {
      const enrollments = await Enrollment.find({
        student: req.user.id,
        status: 'enrolled'
      });
      const courseIds = enrollments.map(e => e.course);
      query = { course: { $in: courseIds } };
    } else {
      query = {};
    }

    const assignments = await Assignment.find(query)
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .sort('-deadline');

    const assignmentsWithStatus = assignments.map(assignment => {
      const assignmentObj = assignment.toObject();
      const now = new Date();
      const hasSubmitted = assignment.submissions.some(
        sub => sub.student.toString() === req.user.id
      );

      if (hasSubmitted) {
        assignmentObj.userStatus = 'Submitted';
      } else if (now > assignment.deadline) {
        assignmentObj.userStatus = 'Overdue';
      } else {
        assignmentObj.userStatus = 'Pending';
      }

      assignmentObj.hasSubmitted = hasSubmitted;
      return assignmentObj;
    });

    res.status(200).json({
      success: true,
      count: assignmentsWithStatus.length,
      data: assignmentsWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'courseCode title')
      .populate('faculty', 'name email')
      .populate('submissions.student', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty can create assignments',
      });
    }

    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only create assignments for your courses',
      });
    }

    req.body.faculty = req.user.id;
    const assignment = await Assignment.create(req.body);

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (assignment.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment',
      });
    }

    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('course', 'courseCode title');

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (assignment.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment',
      });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assignment deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit assignments',
      });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: assignment.course,
      status: 'enrolled'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    const alreadySubmitted = assignment.submissions.some(
      sub => sub.student.toString() === req.user.id
    );

    if (alreadySubmitted) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
    }

    assignment.submissions.push({
      student: req.user.id,
      submittedAt: new Date(),
    });

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};
