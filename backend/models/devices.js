const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  serviceMode: {
    type: String,
    enum: ["Pickup Repair Drop", "Home Repair"],
    required: true
  },
  technicianIds: [
    {
      type: String,
    }
  ],
  addedAt: {
    type: Date,
    default: Date.now
  }
});
const device= mongoose.model('Device', deviceSchema);
export default device;
