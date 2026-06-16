const mongoose = require('mongoose');

const hearingSchema = new mongoose.Schema({
  case: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  hearingDate: {
    type: Date,
    required: true
  },
  hearingTime: String,
  purpose: {
    type: String,
    enum: ['Arguments', 'Evidence', 'Judgment', 'Interim Order', 'Framing of Issues', 'Settlement', 'Preliminary Hearing', 'Other'],
    default: 'Arguments'
  },
  judge: String,
  courtRoom: String,
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Adjourned', 'Cancelled'],
    default: 'Scheduled'
  },
  outcome: String,
  nextDate: Date,
  remarks: String,
  attendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adjournmentReason: String
}, { timestamps: true });

module.exports = mongoose.model('Hearing', hearingSchema);
