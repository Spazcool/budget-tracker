
const path = require('path');
const express = require('express');

const router = express.Router();
const root = { root: path.join(__dirname, '../public') };

router.get('/', (req, res) => res.sendFile('./html/index.html', root));
router.get('*', (req, res) => res.sendFile('./html/index.html', root));

module.exports = router;