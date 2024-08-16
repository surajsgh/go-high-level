const db = require('./../config/firestore.js');
const moment = require('moment-timezone');
const config = require('./../config');

exports.getFreeSlots = async (req, res) => {
    try {
        const { date, timezone } = req.query;

        if (!timezone) {
            return res.status(404).json({
                error: true,
                message: 'Please enter the timezone'
            });
        }

        if (!date) {
            return res.status(404).json({
                error: true,
                message: 'Please enter the date'
            });
        }

        const targetDate = moment.tz(date, config.defaultTimezone).startOf('day');
        const slots = [];

        for (let hour = config.startHours; hour < config.endHours; hour++) {
            for (let minute = 0; minute < 60; minute+=config.slotDuration) {
                const slot = targetDate.clone().hour(hour).minute(minute);
                const slotInTimeZone = slot.tz(timezone).format().substring(0, 19);
                slots.push(slotInTimeZone);
            }
        }

        const events = await db.collection('events').get();
        const bookedSlots = events.docs.map(doc => doc.data().dateTime);
        const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

        res.status(200).json({
            error: false,
            availableSlots
        });
    } catch ({ status = 500, message }) {
        return res.status(status).json({ error: true, message });
    }
}

exports.createEvent = async (req, res) => {
    try {
        const { dateTime, duration } = req.body;
        
        const time = +dateTime.split('T')[1].split(':')[0];
        
        if(time<config.startHours || time>config.endHours) {
            return res.status(400).json({ error: true, message: 'Selected time is out of availability. It should be between 10 AM to 5 PM (17).' });
        }

        if(duration>config.slotDuration) {
            return res.status(400).json({ error: true, message: `Slot duration shouldn't be more than 30 mins.` });
        }

        const event = db.collection('events').doc(dateTime);

        const doc = await event.get();
    
        if (doc.exists) {
            return res.status(422).json({ 
                error: true,
                message: 'Slot already booked' 
            });
        }
    
        await event.set({dateTime,duration});
    
        res.status(200).json({ 
            error: false,
            message: 'Event created successfully.' 
        });
    } catch ({ status=500, message }) {
        return res.status(status).json({
            error: true,
            message
        });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
  
        const events = await db.collection('events')
        .where('dateTime', '>=', startDate)
        .where('dateTime', '<=', endDate)
        .get();
    
        const eventList = events.docs.map(doc => doc.data());
    
        return res.status(200).json({
            error: false,
            eventList
        });
    } catch ({ status=500, message }) {
        return res.status(status).json({
            error: true,
            message
        })
    }
    
};