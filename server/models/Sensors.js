const mongoose = require('mongoose');

const sensorsSchema = mongoose.Schema({
    serial: { type: String, unique: true, trim: true, required: true },
    online: { type: Boolean, required: true },
    name: { type: String, trim: true, required: true },
    sampleTime: { type: Number, required: true },
    tolerance: { type: Number, min: 0, max: 100, required: true },
    legendX: { type: String, trim: true, required: true },
    legendY: { type: String, trim: true, required: true },
    setPoint: { type: Number, min: -1, max: 4095, required: true },
    function: { type: String, trim: true, required: true },
    setPointFunction: { type: String, trim: true, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
});

sensorsSchema.pre('save', function (next) {
    now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

mongoose.model('Sensors', sensorsSchema);
