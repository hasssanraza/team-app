import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['assignment', 'status_change', 'comment', 'mention'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a task description'],
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  notifications: [notificationSchema],
  comments: [commentSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Add notification when task is assigned
taskSchema.pre('save', async function(next) {
  if (this.isModified('assignee') && this.assignee) {
    this.notifications.push({
      type: 'assignment',
      message: `You have been assigned to the task: ${this.title}`,
      user: this.assignee,
    });
  }
  next();
});

// Add notification when status changes
taskSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.assignee) {
    this.notifications.push({
      type: 'status_change',
      message: `Task "${this.title}" status changed to ${this.status}`,
      user: this.assignee,
    });
  }
  next();
});

// Add notification when comment is added
taskSchema.methods.addComment = async function(content, userId) {
  this.comments.push({
    content,
    user: userId,
  });

  if (this.assignee && this.assignee.toString() !== userId.toString()) {
    this.notifications.push({
      type: 'comment',
      message: `New comment on task: ${this.title}`,
      user: this.assignee,
    });
  }

  await this.save();
};

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task; 