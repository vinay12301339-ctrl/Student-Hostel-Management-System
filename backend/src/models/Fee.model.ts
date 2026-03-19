import mongoose, { Document, Schema } from 'mongoose';

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  roomRent: number;
  messFee: number;
  utilityCharges: number;
  extraCharges: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  lateFine: number;
  invoiceNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeeSchema = new Schema<IFee>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    roomRent: { type: Number, default: 0 },
    messFee: { type: Number, default: 0 },
    utilityCharges: { type: Number, default: 0 },
    extraCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending',
    },
    lateFine: { type: Number, default: 0 },
    invoiceNumber: { type: String, unique: true },
    notes: { type: String },
  },
  { timestamps: true }
);

FeeSchema.index({ studentId: 1, year: 1, month: 1 }, { unique: true });
FeeSchema.index({ status: 1, dueDate: 1 });

export const Fee = mongoose.model<IFee>('Fee', FeeSchema);
