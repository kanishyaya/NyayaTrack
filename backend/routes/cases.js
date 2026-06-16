const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const { protect } = require('../middleware/auth');

// Get all cases for logged-in lawyer
router.get('/', protect, async (req, res) => {
  try {
    const { status, caseType, search, priority, page = 1, limit = 10 } = req.query;
    const filter = { assignedLawyer: req.user._id, isArchived: false };

    if (status) filter.status = status;
    if (caseType) filter.caseType = caseType;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } },
        { cnrNumber: { $regex: search, $options: 'i' } },
        { 'petitioner.name': { $regex: search, $options: 'i' } },
        { 'respondent.name': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Case.countDocuments(filter);
    const cases = await Case.find(filter)
      .sort({ nextHearingDate: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ cases, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const lawyerId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [total, active, pending, disposed, highPriority, todayHearings, upcomingHearings] = await Promise.all([
      Case.countDocuments({ assignedLawyer: lawyerId, isArchived: false }),
      Case.countDocuments({ assignedLawyer: lawyerId, status: 'Active', isArchived: false }),
      Case.countDocuments({ assignedLawyer: lawyerId, status: 'Pending', isArchived: false }),
      Case.countDocuments({ assignedLawyer: lawyerId, status: 'Disposed', isArchived: false }),
      Case.countDocuments({ assignedLawyer: lawyerId, priority: 'High', isArchived: false }),
      Case.find({ assignedLawyer: lawyerId, nextHearingDate: { $gte: today, $lt: tomorrow } }),
      Case.find({ assignedLawyer: lawyerId, nextHearingDate: { $gte: today, $lte: nextWeek } }).sort('nextHearingDate').limit(5)
    ]);

    const byType = await Case.aggregate([
      { $match: { assignedLawyer: lawyerId, isArchived: false } },
      { $group: { _id: '$caseType', count: { $sum: 1 } } }
    ]);

    res.json({ total, active, pending, disposed, highPriority, todayHearings, upcomingHearings, byType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all cases with an upcoming next-hearing date, for the calendar view.
// This intentionally uses Case.nextHearingDate (same field Dashboard/Cases list use)
// rather than the Hearing collection, so the calendar always matches what's
// shown as "Next Hearing" everywhere else in the app.
router.get('/calendar', protect, async (req, res) => {
  try {
    const cases = await Case.find({
      assignedLawyer: req.user._id,
      isArchived: false,
      nextHearingDate: { $ne: null }
    })
      .select('title caseNumber petitioner respondent court priority status caseType nextHearingDate')
      .sort('nextHearingDate');
    res.json({ cases });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single case
router.get('/:id', protect, async (req, res) => {
  try {
    const c = await Case.findOne({ _id: req.params.id, assignedLawyer: req.user._id });
    if (!c) return res.status(404).json({ message: 'Case not found' });
    const hearings = await Hearing.find({ case: c._id }).sort({ hearingDate: -1 });
    res.json({ case: c, hearings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create case
router.post('/', protect, async (req, res) => {
  try {
    const caseData = { ...req.body, assignedLawyer: req.user._id };
    const newCase = await Case.create(caseData);
    res.status(201).json({ case: newCase });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update case
router.put('/:id', protect, async (req, res) => {
  try {
    const updated = await Case.findOneAndUpdate(
      { _id: req.params.id, assignedLawyer: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Case not found' });
    res.json({ case: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add note to case
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const c = await Case.findOneAndUpdate(
      { _id: req.params.id, assignedLawyer: req.user._id },
      { $push: { notes: { content: req.body.content, addedBy: req.user._id } } },
      { new: true }
    );
    if (!c) return res.status(404).json({ message: 'Case not found' });
    res.json({ case: c });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Archive case
router.put('/:id/archive', protect, async (req, res) => {
  try {
    const c = await Case.findOneAndUpdate(
      { _id: req.params.id, assignedLawyer: req.user._id },
      { isArchived: true },
      { new: true }
    );
    if (!c) return res.status(404).json({ message: 'Case not found' });
    res.json({ message: 'Case archived', case: c });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete case
router.delete('/:id', protect, async (req, res) => {
  try {
    const c = await Case.findOneAndDelete({ _id: req.params.id, assignedLawyer: req.user._id });
    if (!c) return res.status(404).json({ message: 'Case not found' });
    await Hearing.deleteMany({ case: req.params.id });
    res.json({ message: 'Case deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
