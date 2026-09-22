const express = require('express');
const router = express.Router();
const { registerAdmin, login, superAdminLogin } = require('../controllers/authController');

router.post('/register-admin', registerAdmin);
router.post('/login', login); // public — restaurant admins use this
router.post('/superadmin-login', superAdminLogin); // hidden — never linked in any UI

module.exports = router;