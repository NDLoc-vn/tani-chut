// app/api/counter/route.ts
import { NextResponse } from "next/server";
import { ref, runTransaction, get } from "firebase/database";
import { database } from "@/lib/firebaseConfig";

export async function GET() {
  try {
    const counterRef = ref(database, "counter");
    const snapshot = await get(counterRef);
    const value = snapshot.exists() ? snapshot.val() : 0;
    return NextResponse.json({ count: value });
  } catch (error) {
    return NextResponse.error();
  }
}

export async function POST() {
  try {
    const counterRef = ref(database, "counter");
    let newCount;
    await runTransaction(counterRef, (currentValue) => {
      newCount = (currentValue || 0) + 1;
      return newCount;
    });
    return NextResponse.json({ count: newCount });
  } catch (error) {
    return NextResponse.error();
  }
}
