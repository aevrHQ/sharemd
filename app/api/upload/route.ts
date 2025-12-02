import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Markdown from "@/models/markdown";
import { generateTitle } from "@/lib/ai-agent";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;
    let title = formData.get("title") as string;

    console?.log("Title: ", title);

    let content = "";

    if (file) {
      content = await file.text();
      if (!title) {
        console?.log("Generating title for file: ", file.name);
        // Try AI generation first
        const aiTitle = await generateTitle(content);
        if (aiTitle) {
          title = aiTitle;
          console?.log("Title generated: ", title);
        } else {
          // Fallback to filename
          title = file.name;
          console.log("Unable to generate title for file: ", file.name);
        }
      }
    } else if (text) {
      content = text;
      if (!title) {
        console?.log("Generating title for text");
        // Try AI generation first
        const aiTitle = await generateTitle(content);
        if (aiTitle) {
          title = aiTitle;
          console?.log("Title generated: ", title);
        } else {
          // Fallback to "Untitled Markdown"
          title = "Untitled Markdown";
          console?.log("Unable to generate title for text");
        }
      }
    } else {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    console?.log("Creating markdown with title: ", title);
    const markdown = await Markdown.create({ content, title });

    console?.log("Markdown created with id: ", markdown._id);
    return NextResponse.json({
      success: true,
      data: {
        id: markdown._id,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
