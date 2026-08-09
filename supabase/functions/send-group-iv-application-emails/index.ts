import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function getEnv(key: string) {
  const denoGlobal = globalThis as typeof globalThis & {
    Deno?: { env: { get: (envKey: string) => string | undefined } };
  };
  return denoGlobal.Deno?.env.get(key);
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
    const applicationId = body?.applicationId;
    const fullName = body?.fullName;
    const userEmail = body?.userEmail;
    const dateOfBirth = body?.dateOfBirth;
    const gender = body?.gender;
    const permanentAddress = body?.permanentAddress;
    const city = body?.city;
    const pincode = body?.pincode;
    const contactNumber = body?.contactNumber;
    const aadharNumber = body?.aadharNumber;
    const qualification = body?.qualification;
    const community = body?.community;
    const motherName = body?.motherName;
    const motherOccupation = body?.motherOccupation;
    const fatherName = body?.fatherName;
    const fatherOccupation = body?.fatherOccupation;
    const tnpscExams = Array.isArray(body?.tnpscExams) ? body.tnpscExams : [];
    const previousCoaching = body?.previousCoaching;
    const previousCoachingYear = body?.previousCoachingYear;
    const adminEmail = body?.adminEmail || defaultAdminEmail;

    if (
      !applicationId ||
      !fullName ||
      !userEmail ||
      !dateOfBirth ||
      !gender ||
      !permanentAddress ||
      !city ||
      !pincode ||
      !contactNumber ||
      !aadharNumber ||
      !qualification ||
      !community ||
      !motherName ||
      !motherOccupation ||
      !fatherName ||
      !fatherOccupation ||
      typeof previousCoaching !== 'boolean' ||
      !adminEmail
    ) {
      return new Response(JSON.stringify({ error: 'Missing required application notification fields.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const emailRequests = [
      {
        to: userEmail,
        subject: `Group IV Coaching Application Received (#${applicationId})`,
        replyTo: adminEmail,
        html: `<p>Dear ${fullName},</p>
<p>Your Group IV coaching application has been received by Dr. Ambedkar Academy.</p>
<p><strong>Application ID:</strong> ${applicationId}<br />
<strong>Educational Qualification:</strong> ${qualification}</p>
<p>Please attend the in-person interview on August 16 or August 17, 2026 from 10:00 AM to 6:00 PM at Dr. Ambedkar Academy, The People's Educational Trust, 73, L-Block, 24th Street, Anna Nagar East, Chennai 600 102.</p>
<p>Kindly bring your Aadhar card, passport-size photograph, education proof, and community certificate.</p>
<p>Selected candidates are expected to join the classes from <strong>August 20, 2026</strong>.</p>
<p>For any queries, please contact us at cchellappanias@gmail.com or call +91-9444244362.</p>
<p>Thank you.</p>`
      },
      {
        to: adminEmail,
        subject: `New Group IV Coaching Application (#${applicationId})`,
        replyTo: userEmail,
        html: `<p>A new Group IV coaching application has been submitted.</p>
<p><strong>Application ID:</strong> ${applicationId}<br />
<strong>Name:</strong> ${fullName}<br />
<strong>Date of Birth:</strong> ${dateOfBirth}<br />
<strong>Gender:</strong> ${gender}<br />
<strong>Email:</strong> ${userEmail}<br />
<strong>Contact Number:</strong> ${contactNumber}<br />
<strong>Aadhar Number:</strong> ${aadharNumber}<br />
<strong>Permanent Address:</strong> ${permanentAddress}<br />
<strong>City:</strong> ${city}<br />
<strong>Pincode:</strong> ${pincode}<br />
<strong>Educational Qualification:</strong> ${qualification}<br />
<strong>Community:</strong> ${community}<br />
<strong>Mother's Name:</strong> ${motherName}<br />
<strong>Mother's Occupation:</strong> ${motherOccupation}<br />
<strong>Father's Name:</strong> ${fatherName}<br />
<strong>Father's Occupation:</strong> ${fatherOccupation}<br />
<strong>Previous TNPSC Examinations:</strong> ${tnpscExams.length ? tnpscExams.join(', ') : 'None mentioned'}<br />
<strong>Previously attended Ambedkar Academy coaching:</strong> ${previousCoaching ? 'Yes' : 'No'}${
  previousCoaching ? `<br /><strong>Previous Coaching Year:</strong> ${previousCoachingYear}` : ''
}</p>`
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
