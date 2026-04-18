const mongoose = require('mongoose');

const WorkDemandSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  workTypePreferred: {
    type: String,
    enum: ['Land development', 'Water conservation', 'Drought proofing', 'Micro irrigation works', 'Other'],
    required: true
  },
  daysRequested: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  familyMembersCount: {
    type: Number,
    default: 1
  },
  availabilityStartDate: {
    type: Date,
    required: true
  },
  availabilityEndDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Allocated', 'Muster Roll Issued', 'Completed', 'Paid', 'Rejected'],
    default: 'Pending'
  },
  projectSite: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkDemand', WorkDemandSchema);
