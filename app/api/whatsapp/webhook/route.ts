import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return NextResponse.json({
    status: "OffShift WhatsApp Bot is Live!",
    usage: "Please send a POST request with the 'message' and 'sender' keys to test conversational flows."
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message?.text?.toLowerCase().trim() || "";
    const phone = body.sender || "unknown";

    const supabase = createServiceRoleClient();

    let reply = "";

    switch (message) {
      case "hi":
      case "hello":
        reply = "👋 Welcome to OffShift — Smart Income Shield!\n\nTo get started, please use our secure 60-second onboarding link:\nhttps://offshift-9iok.onrender.com/onboard\n\nOr reply STATUS to check your current coverage.";
        break;

      case "status":
        // Look up the worker by phone
        const { data: user } = await supabase
          .from("workers")
          .select("id, name")
          .eq("phone", phone)
          .single();

        if (user) {
          // Check for active policies
          const { data: policies } = await supabase
            .from("policies")
            .select("*")
            .eq("worker_id", user.id)
            .eq("status", "ACTIVE")
            .single();

          if (policies) {
            reply = `🛡️ Hi ${user.name},\nYour Kavach is ACTIVE.\nExpires on: ${new Date(policies.coverage_end).toLocaleDateString("en-IN")}\nStay safe out there!`;
          } else {
            reply = `Hi ${user.name},\nYou currently have NO ACTIVE coverage. Reply RENEW to get a new pass.`;
          }
        } else {
          reply = "We couldn't find an account linked to this number. Reply HI to register.";
        }
        break;

      case "renew":
        reply = "To renew your OffShift coverage, please visit:\nhttps://offshift-9iok.onrender.com/onboard\n\nYour Kavach risk score will be recalculated for the dynamic premium.";
        break;

      default:
        reply = "I didn't understand that. You can reply with HI, STATUS, or RENEW.";
    }

    // In a real app, we would call the Twilio WhatsApp API here.
    // For the hackathon demo, we simply return the standard Twilio TwiML or a JSON response.
    return NextResponse.json({
      success: true,
      simulated_whatsapp_reply: reply,
    });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
  }
}
