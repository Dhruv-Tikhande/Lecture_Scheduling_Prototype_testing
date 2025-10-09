import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an assignment title'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Assignment must belong to a course'],
  },
  faculty: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Assignment must be created by faculty'],
  },
  deadline: {
    type: Date,
    required: [true, 'Please specify a deadline'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Overdue', 'Submitted'],
    default: 'Pending',
  },
  submissions: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

assignmentSchema.index({ course: 1, deadline: 1 });
assignmentSchema.index({ faculty: 1 });

export default mongoose.model('Assignment', assignmentSchema);
