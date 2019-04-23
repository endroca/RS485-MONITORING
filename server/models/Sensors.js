const mongoose = require('mongoose');

const sensorsSchema = mongoose.Schema({
    serial: { type: String, required: true, unique: true, trim: true },
    online: { type: Boolean },
    name: { type: String, trim: true },
    sampleTime: { type: Number, required: true },
    legendX: { type: String, trim: true },
    legendY: { type: String, trim: true },
    setPoint: { type: Number },
    function: { type: String, trim: true },
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
