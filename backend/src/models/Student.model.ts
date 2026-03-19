import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  rollNumber: string;
  department: string;
  year: number;
  course: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  roomId?: mongoose.Types.ObjectId;
  checkInDate?: Date;
  checkOutDate?: Date;
  status: 'active' | 'inactive' | 'left' | 'pending';
  points: number;
  badges: string[];
  preferences: {
    sleepTime: string;
    studyHabits: string;
    lifestyle: string;
    dietaryPreferences: string;
  };
  documents: {
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: { type: String, required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    year: { type: Number, required: true, min: 1, max: 6 },
    course: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    dateOfBirth: { type: Date },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    status: {
      type: String,
      enum: ['active', 'inactive', 'left', 'pending'],
      default: 'pending',
    },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    preferences: {
      sleepTime: { type: String, default: 'night_owl' },
      studyHabits: { type: String, default: 'moderate' },
      lifestyle: { type: String, default: 'balanced' },
      dietaryPreferences: { type: String, default: 'vegetarian' },
    },
    documents: [
      {
        type: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

StudentSchema.index({ userId: 1 });
StudentSchema.index({ studentId: 1 });
StudentSchema.index({ status: 1 });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
