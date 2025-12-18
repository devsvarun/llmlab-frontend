import { NextResponse } from "next/server";
export async function POST(request) {
    try {
        const requestBody = await request.json();
        const response = await fetch(process.env.NEXT_PUBLIC_LLM_BACKEND + "/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Backend error: ${response.statusText}` }, { status: response.status });
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
