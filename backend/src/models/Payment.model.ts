import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  feeId: mongoose.Types.ObjectId;
  amount: number;
  method: 'stripe' | 'razorpay' | 'bank_transfer' | 'upi' | 'wallet' | 'cash';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  receiptUrl?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    feeId: {
      type: Schema.Types.ObjectId,
      ref: 'Fee',
      required: true,
    },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['stripe', 'razorpay', 'bank_transfer', 'upi', 'wallet', 'cash'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String, required: true, unique: true },
    gatewayPaymentId: { type: String },
    gatewayOrderId: { type: String },
    receiptUrl: { type: String },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    refundedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ studentId: 1, createdAt: -1 });
PaymentSchema.index({ feeId: 1 });
PaymentSchema.index({ transactionId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
