import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  content: string;
  visitor: mongoose.Types.ObjectId;
  markdown: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  content: {
    type: String,
    required: [true, "Please provide comment content"],
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

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
