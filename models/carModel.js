const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'من فضلك ادخل رقم السيارة'],
  },
  letters: {
    type: String,
    required: [true, 'من فضلك ادخل حروف السيارة'],
    trim: true,
  },
  governorate: {
    type: String,
    required: [true, 'من فضلك ادخل المحافظة'],
    trim: true,
  },
});
module.exports = mongoose.model('Car', carSchema);
