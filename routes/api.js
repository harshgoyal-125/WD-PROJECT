const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const WorkDemand = require('../models/WorkDemand');

// POST /api/register to register a new worker
router.post('/register', async (req, res) => {
    try {
        const { name, jobCardNumber, password } = req.body;

        // Check if user exists
        const existingWorker = await Worker.findOne({ jobCardNumber });
        if (existingWorker) {
            return res.status(400).json({ error: 'Worker with this Job Card already exists' });
        }

        const newWorker = new Worker({
            name,
            jobCardNumber,
            password,
            totalDaysWorkedCurrentFY: 0,
            totalWagesEarnedCurrentFY: 0
        });

        await newWorker.save();
        res.status(201).json({ message: 'Registration successful', worker: newWorker });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/demand to submit work requests
router.post('/demand', async (req, res) => {
  try {
    const { workerId, workTypePreferred, daysRequested, familyMembersCount, availabilityStartDate, availabilityEndDate } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // The 100-Day Logic Check (Backend safeguard)
    if (worker.totalDaysWorkedCurrentFY + Number(daysRequested) > 100) {
      return res.status(400).json({ 
        error: 'Demand exceeds 100-day annual limit under MGNREGA guidelines.',
        remainingDays: 100 - worker.totalDaysWorkedCurrentFY
      });
    }

    const demand = new WorkDemand({
      worker: workerId,
      workTypePreferred,
      daysRequested,
      familyMembersCount,
      availabilityStartDate,
      availabilityEndDate,
    });

    await demand.save();

    res.status(201).json({ message: 'Work demand submitted successfully', demand });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/worker/:id/history to fetch past employment records.
router.get('/worker/:id/history', async (req, res) => {
  try {
    const workerId = req.params.id;
    const worker = await Worker.findById(workerId);
    
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const demands = await WorkDemand.find({ worker: workerId }).sort({ createdAt: -1 });
    
    res.json({
      worker: {
        name: worker.name,
        jobCardNumber: worker.jobCardNumber,
        totalDaysWorkedCurrentFY: worker.totalDaysWorkedCurrentFY,
        totalWagesEarnedCurrentFY: worker.totalWagesEarnedCurrentFY
      },
      demands
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/demands to fetch all pending demands for admin approval
router.get('/admin/demands', async (req, res) => {
    try {
        const pendingDemands = await WorkDemand.find({ status: 'Pending' }).populate('worker', 'name jobCardNumber');
        res.json({ demands: pendingDemands });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching demands' });
    }
});

// PATCH /api/admin/approve/:id to update demand status.
router.patch('/admin/approve/:id', async (req, res) => {
  try {
    const demandId = req.params.id;
    const { status, projectSite } = req.body;

    const updateData = { status };
    if (projectSite) {
        updateData.projectSite = projectSite;
    }

    const updatedDemand = await WorkDemand.findByIdAndUpdate(
      demandId,
      updateData,
      { new: true }
    );

    if (!updatedDemand) {
      return res.status(404).json({ error: 'Demand not found' });
    }

    res.json({ message: 'Demand updated successfully', demand: updatedDemand });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mock Login Route
router.post('/login', async (req, res) => {
  const { jobCardNumber, password } = req.body;
  try {
    const worker = await Worker.findOne({ jobCardNumber });
    if (!worker || worker.password !== password) {
       return res.status(401).json({ error: 'Invalid Job Card Number or Password' });
    }
    res.json({ token: 'mock-jwt-token', workerId: worker._id, name: worker.name });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
