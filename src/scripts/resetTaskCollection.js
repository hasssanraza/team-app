const { connectDB } = require('../lib/mongodb');
const mongoose = require('mongoose');

async function resetTaskCollection() {
  try {
    await connectDB();
    
    // Drop the Task collection
    await mongoose.connection.collection('tasks').drop();
    console.log('Task collection dropped successfully');
    
    // Recreate the Task model
    const Task = mongoose.model('Task', new mongoose.Schema({
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
      notifications: [{
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
      }],
      comments: [{
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
      }],
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    }, {
      timestamps: true,
    }));

    console.log('Task model recreated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting Task collection:', error);
    process.exit(1);
  }
}

resetTaskCollection(); 