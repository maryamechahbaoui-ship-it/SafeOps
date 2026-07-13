const express = require('express');
const router = express.Router();
const planningController = require('../controllers/planningController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, planningController.getPlannings);
router.post('/:id/assign', authMiddleware, planningController.assignTechnician);
router.post('/:id/complete', authMiddleware, planningController.completePlanning);

module.exports = router;
