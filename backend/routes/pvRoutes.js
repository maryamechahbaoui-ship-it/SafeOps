const express = require('express');
const router = express.Router();
const pvController = require('../controllers/pvController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, pvController.getPvs);
router.post('/:id/sign-ocp', authMiddleware, pvController.signOcpPv);

module.exports = router;
