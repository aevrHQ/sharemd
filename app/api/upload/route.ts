import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Markdown from "@/models/markdown";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;

    let content = "";

    if (file) {
      content = await file.text();
    } else if (text) {
      content = text;
    } else {
      return NextResponse.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    const markdown = await Markdown.create({ content });

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
