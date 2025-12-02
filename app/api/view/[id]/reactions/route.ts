import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Reaction from "@/models/reaction";
import Visitor from "@/models/visitor";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("visitorId");

    const count = await Reaction.countDocuments({ markdown: id, type: "like" });

    let userReacted = false;
    if (visitorId) {
      const reaction = await Reaction.findOne({
        markdown: id,
        visitor: visitorId,
        type: "like",
      });
      userReacted = !!reaction;
    }

    return NextResponse.json({
      success: true,
      data: {
        count,
        userReacted,
      },
    });
  } catch (error) {
    console.error("Fetch reactions error:", error);
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
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "VisitorId is required" },
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

    // Check if already reacted
    const existingReaction = await Reaction.findOne({
      markdown: id,
      visitor: visitorId,
      type: "like",
    });

    if (existingReaction) {
      // Unlike
      await Reaction.findByIdAndDelete(existingReaction._id);
      return NextResponse.json({
        success: true,
        data: { reacted: false },
      });
    } else {
      // Like
      await Reaction.create({
        markdown: id,
        visitor: visitorId,
        type: "like",
      });
      return NextResponse.json({
        success: true,
        data: { reacted: true },
      });
    }
  } catch (error) {
    console.error("Toggle reaction error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
