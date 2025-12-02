import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Visitor from "@/models/visitor";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, name } = body;

    let visitor;

    if (id) {
      // Update existing visitor
      visitor = await Visitor.findByIdAndUpdate(
        id,
        { lastActiveAt: new Date(), ...(name && { name }) },
        { new: true }
      );
    }

    if (!visitor) {
      // Create new visitor
      visitor = await Visitor.create({
        name,
      });
    }

    return NextResponse.json({
      success: true,
      data: visitor,
    });
  } catch (error) {
    console.error("Visitor error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
