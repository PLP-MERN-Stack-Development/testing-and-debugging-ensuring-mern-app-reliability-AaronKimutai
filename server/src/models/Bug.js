const mongoose = require('mongoose');

const BugSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 5 },
  description: { type: String, required: true, minlength: 10 },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  status: { type: String, enum: ['Open', 'In-Progress', 'Resolved', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
});

BugSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bug', BugSchema);