import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const name = form.get("name") as string;
    const email = form.get("email") as string | null;
    const mobile = form.get("mobile") as string;
    const password = form.get("password") as string;
    const age = Number(form.get("age"));
    const gender = form.get("gender") as string;
    const bloodGroup = form.get("bloodGroup") as string | null;
    const imageFile = form.get("profileImage") as File | null;

    if (!name || !mobile || !password || !age || !gender) {
      return NextResponse.json(
        { status: "error", message: "Required fields missing" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ mobile }, { email: email || undefined }] }
    });
    if (exists)
      return NextResponse.json({ status: "error", message: "User exists" }, { status: 400 });

    const patientRole = await prisma.role.findUnique({ where: { name: "patient" } });
    if (!patientRole)
      return NextResponse.json({ status: "error", message: "Patient role missing" }, { status: 500 });

    // Save image
    let imageUrl: string | null = null;
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const dir = path.join(process.cwd(), "public/media/profiles");
      await mkdir(dir, { recursive: true });

      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "")}`;
      const filepath = path.join(dir, filename);

      await writeFile(filepath, buffer);
      imageUrl = `/media/profiles/${filename}`;
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        mobile,
        password: hashed,
        roleId: patientRole.id,

        patient: {
          create: {
            name,
            age,
            gender,
            bloodGroup: bloodGroup || null,
            profileImage: imageUrl
          }
        }
      },
      select: {
        id: true,
        email: true,
        mobile: true,
        role: { select: { name: true } }
      }
    });

    return NextResponse.json(
      { status: "success", message: "Patient registered successfully", data: user },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error", message: "Internal error" }, { status: 500 });
  }
}
