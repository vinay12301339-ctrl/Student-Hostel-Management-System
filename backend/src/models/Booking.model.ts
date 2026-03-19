import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  studentId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  type: 'new' | 'change' | 'swap';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  checkInDate: Date;
  checkOutDate?: Date;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  swapWithStudentId?: mongoose.Types.ObjectId;
  swapWithRoomId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    type: {
      type: String,
      enum: ['new', 'change', 'swap'],
      default: 'new',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    notes: { type: String },
    swapWithStudentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    swapWithRoomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  },
  { timestamps: true }
);

BookingSchema.index({ studentId: 1, status: 1 });
BookingSchema.index({ roomId: 1, status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
