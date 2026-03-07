import { NextRequest, NextResponse } from "next/server";

function isAllowedCloudinaryUrl(url: URL): boolean {
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
}

export async function GET(req: NextRequest) {
    const rawUrl = req.nextUrl.searchParams.get("url");
    if (!rawUrl) {
        return NextResponse.json({ message: "Missing image url" }, { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return NextResponse.json({ message: "Invalid image url" }, { status: 400 });
    }

    if (!isAllowedCloudinaryUrl(parsed)) {
        return NextResponse.json({ message: "Unsupported image host" }, { status: 400 });
    }

    const upstream = await fetch(parsed.toString(), {
        method: "GET",
        cache: "force-cache",
    });

    if (!upstream.ok || !upstream.body) {
        return NextResponse.json({ message: "Failed to fetch image" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    return new NextResponse(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
    });
}
