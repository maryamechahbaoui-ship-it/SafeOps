const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Dashboard metrics
router.get('/dashboard', authMiddleware, adminController.getDashboard);

// Sites CRUD
router.get('/sites', authMiddleware, adminController.getSites);
router.post('/sites', authMiddleware, adminController.createSite);
router.post('/sites/:id/toggle', authMiddleware, adminController.toggleSite);
router.delete('/sites/:id', authMiddleware, adminController.deleteSite);

// Users CRUD
router.get('/users', authMiddleware, adminController.getUsers);
router.post('/users', authMiddleware, adminController.createUser);
router.post('/users/:id/toggle', authMiddleware, adminController.toggleUser);
router.delete('/users/:id', authMiddleware, adminController.deleteUser);
router.post('/users/:id/reset-password', authMiddleware, adminController.resetPassword);

// Equipments
router.get('/equipments', authMiddleware, adminController.getEquipments);
router.post('/equipments', authMiddleware, adminController.createEquipment);
router.put('/equipments/:id/status', authMiddleware, adminController.updateEquipmentStatus);

// Stock
router.get('/stocks', authMiddleware, adminController.getStocks);
router.post('/stocks', authMiddleware, adminController.createStock);
router.post('/stocks/movement', authMiddleware, adminController.recordStockMovement);
router.get('/stocks/movements', authMiddleware, adminController.getStockMovements);

module.exports = router;
