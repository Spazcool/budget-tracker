
const router = require('express').Router();
const html = require('./html.js');
const api = require('./api.js');

router.use('/api', api);
router.use('/', html);

module.exports = router;