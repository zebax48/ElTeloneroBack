const ActiveIds = require("../models/ActiveIds");

exports.getAllActiveIds = async (req, res) => {
    try {
        const activeIds = await ActiveIds.find();
        res.json(activeIds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createActiveIds = async (req, res) => {
    try {
        const activeIds = new ActiveIds({
            eventId: req.body.eventId,
            votacionId: req.body.votacionId
        });
        await activeIds.save();
        res.status(201).json(activeIds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setActiveEventId = async (req, res) => {
    try {
        const { eventId } = req.body;
        const activeIds = await ActiveIds.findOneAndUpdate({ eventId }, { eventId }, { upsert: true });
        res.status(200).json(activeIds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setActiveVotacionId = async (req, res) => {
    try {
        const { votacionId } = req.body;
        const activeIds = await ActiveIds.findOneAndUpdate({ votacionId }, { votacionId }, { upsert: true });
        res.status(200).json(activeIds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};