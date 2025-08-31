const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TransactionSchema = new Schema({
  type: { type: String, enum: ['income','expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'Uncategorized' },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Transaction', TransactionSchema);
