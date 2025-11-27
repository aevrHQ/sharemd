import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMarkdown extends Document {
  content: string;
  createdAt: Date;
}

const MarkdownSchema: Schema = new Schema({
  content: {
    type: String,
    required: [true, "Please provide markdown content"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Markdown: Model<IMarkdown> =
  mongoose.models.Markdown ||
  mongoose.model<IMarkdown>("Markdown", MarkdownSchema);

export default Markdown;
