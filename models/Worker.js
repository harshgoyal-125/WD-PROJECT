const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  jobCardNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  totalDaysWorkedCurrentFY: {
    type: Number,
    default: 0
  },
  totalWagesEarnedCurrentFY: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Worker', WorkerSchema);
