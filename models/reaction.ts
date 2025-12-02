import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReaction extends Document {
  type: "like";
  visitor: mongoose.Types.ObjectId;
  markdown: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ReactionSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ["like"],
    default: "like",
    required: true,
  },
  visitor: {
    type: Schema.Types.ObjectId,
    ref: "Visitor",
    required: true,
  },
  markdown: {
    type: Schema.Types.ObjectId,
    ref: "Markdown",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate reactions from the same visitor on the same markdown
ReactionSchema.index({ visitor: 1, markdown: 1, type: 1 }, { unique: true });

const Reaction: Model<IReaction> =
  mongoose.models.Reaction ||
  mongoose.model<IReaction>("Reaction", ReactionSchema);

export default Reaction;
