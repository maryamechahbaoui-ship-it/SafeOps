const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, ticketController.getTickets);
router.post('/', authMiddleware, ticketController.createTicket);
router.post('/:id/assign', authMiddleware, ticketController.assignTechnician);
router.post('/:id/resolve', authMiddleware, ticketController.resolveTicket);

module.exports = router;
