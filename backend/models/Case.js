const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  cnrNumber: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Case title is required'],
    trim: true
  },
  description: String,
  caseType: {
    type: String,
    enum: ['Civil', 'Criminal', 'Family', 'Labour', 'Consumer', 'Revenue', 'Writ', 'PIL', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Disposed', 'Adjourned', 'Stayed', 'Withdrawn', 'Decided'],
    default: 'Active'
  },
  court: {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Supreme Court', 'High Court', 'District Court', 'Sessions Court', 'Civil Court', 'Consumer Forum', 'Tribunal', 'Other']
    },
    state: String,
    district: String,
    bench: String
  },
  petitioner: {
    name: { type: String, required: true },
    address: String,
    contact: String
  },
  respondent: {
    name: { type: String, required: true },
    address: String,
    contact: String
  },
  filingDate: {
    type: Date,
    required: true
  },
  nextHearingDate: Date,
  lastHearingDate: Date,
  assignedLawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    name: String,
    contact: String,
    email: String
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  tags: [String],
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  notes: [{
    content: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
