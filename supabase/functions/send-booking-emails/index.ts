import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function getSlotLabel(slot: string) {
  if (slot === 'half-morning') return 'Half Day (6am to 3pm)';
  if (slot === 'half-evening') return 'Half Day (2pm to 10pm)';
  return 'Full Day';
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = getEnv('RESEND_API_KEY');
    const senderEmail = getEnv('BOOKING_SENDER_EMAIL');
    const defaultAdminEmail = getEnv('BOOKING_ADMIN_EMAIL');

    if (!resendApiKey || !senderEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing RESEND_API_KEY or BOOKING_SENDER_EMAIL.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const fullName = body?.fullName;
    const userEmail = body?.userEmail;
    const bookingId = body?.bookingId;
    const eventDate = body?.eventDate;
    const bookingSlot = body?.bookingSlot;
    const totalPrice = body?.totalPrice;
    const adminEmail = body?.adminEmail || defaultAdminEmail;

    if (!fullName || !userEmail || !bookingId || !eventDate || !bookingSlot || !adminEmail) {
      return new Response(JSON.stringify({ error: 'Missing required booking notification fields.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const slotLabel = getSlotLabel(bookingSlot);
    const priceLabel = `₹${Number(totalPrice).toLocaleString('en-IN')}`;

    const emailRequests = [
      {
        to: userEmail,
        subject: `Booking Request Received (#${bookingId})`,
        replyTo: adminEmail,
        html: `<p>Dear ${fullName},</p>
<p>Your hall booking request has been received.</p>
<p><strong>Event Date:</strong> ${eventDate}<br />
<strong>Slot:</strong> ${slotLabel}<br />
<strong>Total Price:</strong> ${priceLabel}</p>
<p>Once approved, you will receive payment instructions by email.</p>
<p>Thank you.</p>`
      },
      {
        to: adminEmail,
        subject: `New Hall Booking Request (#${bookingId})`,
        replyTo: userEmail,
        html: `<p>A new hall booking request was submitted.</p>
<p><strong>Name:</strong> ${fullName}<br />
<strong>Email:</strong> ${userEmail}<br />
<strong>Event Date:</strong> ${eventDate}<br />
<strong>Slot:</strong> ${slotLabel}<br />
<strong>Total Price:</strong> ${priceLabel}</p>`
      }
    ];

    const results = await Promise.all(
      emailRequests.map((email) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: senderEmail,
            to: email.to,
            subject: email.subject,
            html: email.html,
            reply_to: email.replyTo
          })
        })
      )
    );

    const failed = results.find((response) => !response.ok);
    if (failed) {
      const detail = await failed.text();
      return new Response(JSON.stringify({ error: `Email send failed: ${detail}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
function getEnv(key: string) {
  const denoGlobal = globalThis as typeof globalThis & {
    Deno?: { env: { get: (envKey: string) => string | undefined } };
  };
  return denoGlobal.Deno?.env.get(key);
}
