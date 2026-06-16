const express = require('express');
const router = express.Router();
const Hearing = require('../models/Hearing');
const Case = require('../models/Case');
const { protect } = require('../middleware/auth');

// Helper: confirm a case belongs to the logged-in lawyer before letting them
// touch any hearing attached to it.
const ownsCase = async (caseId, lawyerId) => {
  const c = await Case.findOne({ _id: caseId, assignedLawyer: lawyerId });
  return !!c;
};

// Derive the case-level nextHearingDate/lastHearingDate implied by a hearing's
// outcome: a Scheduled hearing IS the case's next hearing; anything else
// (Completed/Adjourned/Cancelled) already happened, with an optional nextDate
// for whatever's coming after it.
const deriveCaseUpdate = (body) => {
  const update = {};
  if (body.status === 'Scheduled') {
    update.nextHearingDate = body.hearingDate;
  } else {
    update.lastHearingDate = body.hearingDate;
    if (body.nextDate) update.nextHearingDate = body.nextDate;
  }
  return update;
};

// Get all hearings for a case
router.get('/case/:caseId', protect, async (req, res) => {
  try {
    if (!(await ownsCase(req.params.caseId, req.user._id))) {
      return res.status(404).json({ message: 'Case not found' });
    }
    const hearings = await Hearing.find({ case: req.params.caseId }).sort({ hearingDate: -1 });
    res.json({ hearings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get upcoming hearings for the lawyer
router.get('/upcoming', protect, async (req, res) => {
  try {
    const myCases = await Case.find({ assignedLawyer: req.user._id, isArchived: false }).select('_id');
    const caseIds = myCases.map(c => c._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hearings = await Hearing.find({
      case: { $in: caseIds },
      hearingDate: { $gte: today },
      status: 'Scheduled'
    }).populate('case', 'title caseNumber court').sort({ hearingDate: 1 }).limit(20);
    res.json({ hearings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add hearing
router.post('/', protect, async (req, res) => {
  try {
    if (!req.body.case || !(await ownsCase(req.body.case, req.user._id))) {
      return res.status(404).json({ message: 'Case not found' });
    }
    const hearing = await Hearing.create({ ...req.body, attendedBy: req.user._id });
    await Case.findByIdAndUpdate(req.body.case, deriveCaseUpdate(req.body));
    res.status(201).json({ hearing });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update hearing
router.put('/:id', protect, async (req, res) => {
  try {
    const existing = await Hearing.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Hearing not found' });
    if (!(await ownsCase(existing.case, req.user._id))) {
      return res.status(404).json({ message: 'Hearing not found' });
    }
    const hearing = await Hearing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await Case.findByIdAndUpdate(hearing.case, deriveCaseUpdate(req.body));
    res.json({ hearing });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete hearing
router.delete('/:id', protect, async (req, res) => {
  try {
    const existing = await Hearing.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Hearing not found' });
    if (!(await ownsCase(existing.case, req.user._id))) {
      return res.status(404).json({ message: 'Hearing not found' });
    }

    const hearing = await Hearing.findByIdAndDelete(req.params.id);

    // If this hearing was the one driving the case's "next hearing" date,
    // fall back to the next-soonest scheduled hearing, or clear it if none remain.
    const caseDoc = await Case.findById(hearing.case);
    if (
      caseDoc?.nextHearingDate &&
      new Date(caseDoc.nextHearingDate).getTime() === new Date(hearing.hearingDate).getTime()
    ) {
      const nextScheduled = await Hearing.findOne({ case: hearing.case, status: 'Scheduled' }).sort({ hearingDate: 1 });
      await Case.findByIdAndUpdate(hearing.case, { nextHearingDate: nextScheduled ? nextScheduled.hearingDate : null });
    }
    res.json({ message: 'Hearing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
