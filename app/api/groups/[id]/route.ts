import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LinkGroup from "@/models/link-group";
import Markdown from "@/models/markdown"; // Add this import

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const group = await LinkGroup.findById(id).populate("links");

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Fetch group error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { title, linkIds } = body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (linkIds) updateData.links = linkIds;

    const group = await LinkGroup.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("links");

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Update group error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const group = await LinkGroup.findByIdAndDelete(id);

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete group error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
