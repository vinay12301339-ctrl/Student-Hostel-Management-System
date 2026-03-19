import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  block: string;
  type: 'single' | 'double' | 'triple' | 'dormitory';
  capacity: number;
  occupiedCount: number;
  status: 'available' | 'occupied' | 'maintenance' | 'blocked';
  monthlyRent: number;
  amenities: string[];
  photos: string[];
  description: string;
  area: number;
  features: {
    hasAC: boolean;
    hasWifi: boolean;
    hasAttachedBathroom: boolean;
    hasBalcony: boolean;
    hasStudyTable: boolean;
    hasWardrobe: boolean;
  };
  currentOccupants: mongoose.Types.ObjectId[];
  maintenanceHistory: {
    date: Date;
    description: string;
    cost: number;
  }[];
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    floor: { type: Number, required: true },
    block: { type: String, required: true },
    type: {
      type: String,
      enum: ['single', 'double', 'triple', 'dormitory'],
      required: true,
    },
    capacity: { type: Number, required: true },
    occupiedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'blocked'],
      default: 'available',
    },
    monthlyRent: { type: Number, required: true },
    amenities: [{ type: String }],
    photos: [{ type: String }],
    description: { type: String },
    area: { type: Number },
    features: {
      hasAC: { type: Boolean, default: false },
      hasWifi: { type: Boolean, default: true },
      hasAttachedBathroom: { type: Boolean, default: false },
      hasBalcony: { type: Boolean, default: false },
      hasStudyTable: { type: Boolean, default: true },
      hasWardrobe: { type: Boolean, default: true },
    },
    currentOccupants: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    maintenanceHistory: [
      {
        date: { type: Date },
        description: { type: String },
        cost: { type: Number },
      },
    ],
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RoomSchema.index({ status: 1, type: 1 });
RoomSchema.index({ block: 1, floor: 1 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
