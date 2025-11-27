import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Markdown from "@/models/markdown";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // In Next.js 15+, params is a Promise
    const { id } = await params;

    const markdown = await Markdown.findById(id);

    if (!markdown) {
      return NextResponse.json(
        { success: false, error: "Markdown not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: markdown.content,
        createdAt: markdown.createdAt,
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
