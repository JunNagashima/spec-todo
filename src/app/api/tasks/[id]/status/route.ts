import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["TODO", "DOING", "DONE"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: unknown): value is ValidStatus {
	return VALID_STATUSES.includes(value as ValidStatus);
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const taskId = Number(id);
	if (Number.isNaN(taskId)) {
		return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
	}

	const body = await request.json();
	const { status } = body;

	if (!isValidStatus(status)) {
		return NextResponse.json({ error: "Invalid status" }, { status: 400 });
	}

	try {
		await prisma.task.update({
			where: { id: taskId },
			data: { status },
		});
		return new NextResponse(null, { status: 200 });
	} catch {
		return NextResponse.json({ error: "Update failed" }, { status: 500 });
	}
}
