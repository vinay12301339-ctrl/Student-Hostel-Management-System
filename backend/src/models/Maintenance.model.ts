import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenance extends Document {
  studentId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  ticketNumber: string;
  category: 'plumbing' | 'electrical' | 'carpentry' | 'cleaning' | 'pest_control' | 'internet' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  title: string;
  description: string;
  attachments: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
  assignedTo?: mongoose.Types.ObjectId;
  assignedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  resolutionNotes?: string;
  studentRating?: number;
  studentFeedback?: string;
  slaDeadline: Date;
  isSlaBreach: boolean;
  escalationLevel: number;
  aiCategory?: string;
  aiSuggestion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema = new Schema<IMaintenance>(
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
    ticketNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'carpentry', 'cleaning', 'pest_control', 'internet', 'other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'rejected', 'closed'],
      default: 'open',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    resolutionNotes: { type: String },
    studentRating: { type: Number, min: 1, max: 5 },
    studentFeedback: { type: String },
    slaDeadline: { type: Date, required: true },
    isSlaBreach: { type: Boolean, default: false },
    escalationLevel: { type: Number, default: 0 },
    aiCategory: { type: String },
    aiSuggestion: { type: String },
  },
  { timestamps: true }
);

MaintenanceSchema.index({ studentId: 1, status: 1 });
MaintenanceSchema.index({ ticketNumber: 1 });
MaintenanceSchema.index({ status: 1, priority: 1 });

export const Maintenance = mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
