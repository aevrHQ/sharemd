import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitor extends Document {
  name?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

const VisitorSchema: Schema = new Schema({
  name: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
});

const Visitor: Model<IVisitor> =
  mongoose.models.Visitor || mongoose.model<IVisitor>("Visitor", VisitorSchema);

export default Visitor;
