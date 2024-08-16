const { getFreeSlots, createEvent, getEvents } = require('./../controllers/eventControllers.js');
const express = require('express');

const router = express.Router();

router.route('/freeSlots').get(getFreeSlots);
router.route('/event').post(createEvent);
router.route('/events').get(getEvents);

module.exports = router;