import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import LinkGroup from "@/models/link-group";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { title, linkIds } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const group = await LinkGroup.create({
      title,
      links: linkIds || [],
    });

    return NextResponse.json({
      success: true,
      data: {
        id: group._id,
        title: group.title,
        linkIds: group.links,
        createdAt: group.createdAt,
      },
    });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
