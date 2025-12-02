import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Comment from "@/models/comment";
import Visitor from "@/models/visitor";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const comments = await Comment.find({ markdown: id })
      .populate("visitor", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { content, visitorId } = body;

    if (!content || !visitorId) {
      return NextResponse.json(
        { success: false, error: "Content and visitorId are required" },
        { status: 400 }
      );
    }

    // Verify visitor exists
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return NextResponse.json(
        { success: false, error: "Visitor not found" },
        { status: 404 }
      );
    }

    const comment = await Comment.create({
      content,
      visitor: visitorId,
      markdown: id,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "visitor",
      "name"
    );

    return NextResponse.json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
