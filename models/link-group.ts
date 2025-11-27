import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILinkGroup extends Document {
  title: string;
  links: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const LinkGroupSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, "Please provide a group title"],
  },
  links: [
    {
      type: Schema.Types.ObjectId,
      ref: "Markdown",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const LinkGroup: Model<ILinkGroup> =
  mongoose.models.LinkGroup ||
  mongoose.model<ILinkGroup>("LinkGroup", LinkGroupSchema);

export default LinkGroup;
