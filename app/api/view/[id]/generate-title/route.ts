import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Markdown from "@/models/markdown";
import { generateTitle } from "@/lib/ai-agent";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    let { content } = body;

    if (!content) {
      const markdown = await Markdown.findById(id);
      if (!markdown) {
        return NextResponse.json(
          { success: false, error: "Markdown not found" },
          { status: 404 }
        );
      }
      content = markdown.content;
    }

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No content to generate title from" },
        { status: 400 }
      );
    }

    const title = await generateTitle(content);

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Failed to generate title" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { title },
    });
  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
