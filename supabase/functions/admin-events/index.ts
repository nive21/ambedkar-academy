import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

function getAdminClient() {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

function validateAdminAccess(accessKey: string | undefined) {
  const expectedAccessKey = getEnv('ADMIN_EVENTS_ACCESS_KEY');
  if (!expectedAccessKey) {
    throw new Error('Missing ADMIN_EVENTS_ACCESS_KEY.');
  }
  if (!accessKey || accessKey !== expectedAccessKey) {
    throw new Error('Invalid admin access key.');
  }
}

function getMinutesFromTime(timeValue: string) {
  const [hours, minutes] = timeValue.split(':').map(Number);
  return hours * 60 + minutes;
}

function overlaps(start: number, end: number, slotStart: number, slotEnd: number) {
  return start < slotEnd && end > slotStart;
}

function getBookingSlotRange(slot: string) {
  if (slot === 'half-morning') return { start: 6 * 60, end: 15 * 60 };
  if (slot === 'half-evening') return { start: 14 * 60, end: 22 * 60 };
  return { start: 6 * 60, end: 22 * 60 };
}

function validateEventPayload(event: Record<string, string>) {
  if (!event?.eventDate || !event?.startTime || !event?.endTime || !event?.eventType || !event?.description) {
    throw new Error('Missing required event fields.');
  }
  if (event.endTime <= event.startTime) {
    throw new Error('End time must be after start time.');
  }
}

async function assertEventDoesNotOverlap(
  adminClient: ReturnType<typeof createClient>,
  event: Record<string, string>,
  ignoreEventId?: number
) {
  const eventStart = getMinutesFromTime(event.startTime);
  const eventEnd = getMinutesFromTime(event.endTime);

  const adminEventsQuery = adminClient
    .from('admin_events')
    .select('id, start_time, end_time')
    .eq('event_date', event.eventDate);

  const scopedAdminEventsQuery = ignoreEventId ? adminEventsQuery.neq('id', ignoreEventId) : adminEventsQuery;
  const { data: sameDateEvents, error: sameDateEventsError } = await scopedAdminEventsQuery;
  if (sameDateEventsError) throw new Error(sameDateEventsError.message);

  const blockingAdminEvent = (sameDateEvents ?? []).find((existing) =>
    overlaps(eventStart, eventEnd, getMinutesFromTime(existing.start_time), getMinutesFromTime(existing.end_time))
  );
  if (blockingAdminEvent) {
    throw new Error('This timing overlaps another administrative event.');
  }

  const { data: hallBookings, error: hallBookingsError } = await adminClient
    .from('hall_bookings')
    .select('id, booking_slot')
    .eq('event_date', event.eventDate)
    .in('status', ['pending', 'approved']);

  if (hallBookingsError) throw new Error(hallBookingsError.message);

  const blockingHallBooking = (hallBookings ?? []).find((booking) => {
    const range = getBookingSlotRange(booking.booking_slot);
    return overlaps(eventStart, eventEnd, range.start, range.end);
  });

  if (blockingHallBooking) {
    throw new Error('This timing overlaps an existing hall booking request.');
  }
}

function getSlotLabel(slot: string) {
  if (slot === 'half-morning') return 'Half Day (6am to 3pm)';
  if (slot === 'half-evening') return 'Half Day (2pm to 10pm)';
  return 'Full Day';
}

function formatInterviewDate(dateValue: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${dateValue}T00:00:00`));
}

async function sendStatusEmails(params: {
  userEmail: string;
  fullName: string;
  bookingId: number;
  status: string;
  reason?: string;
  adminEmail: string;
  eventDate: string;
  bookingSlot: string;
}) {
  const resendApiKey = getEnv('RESEND_API_KEY');
  const senderEmail = getEnv('BOOKING_SENDER_EMAIL');
  const fallbackAdminEmail = getEnv('BOOKING_ADMIN_EMAIL');
  const adminEmail = params.adminEmail || fallbackAdminEmail;

  if (!resendApiKey || !senderEmail || !adminEmail) {
    throw new Error('Missing RESEND_API_KEY, BOOKING_SENDER_EMAIL, or BOOKING_ADMIN_EMAIL.');
  }

  const statusLabel = params.status === 'approved' ? 'Approved' : 'Denied';
  const reasonText =
    params.status === 'rejected' && params.reason ? `<p><strong>Reason:</strong> ${params.reason}</p>` : '';

  const userBody = `<p>Dear ${params.fullName},</p>
<p>Your booking request #${params.bookingId} has been <strong>${statusLabel}</strong>.</p>
<p><strong>Event Date:</strong> ${params.eventDate}<br />
<strong>Slot:</strong> ${getSlotLabel(params.bookingSlot)}</p>
${reasonText}
<p>Thank you.</p>`;

  const adminBody = `<p>Booking request status updated.</p>
<p><strong>Request #:</strong> ${params.bookingId}<br />
<strong>Name:</strong> ${params.fullName}<br />
<strong>User Email:</strong> ${params.userEmail}<br />
<strong>Status:</strong> ${statusLabel}</p>
${reasonText}`;

  const emails = [
    {
      to: params.userEmail,
      subject: `Hall Booking ${statusLabel} (#${params.bookingId})`,
      html: userBody,
      replyTo: adminEmail
    },
    {
      to: adminEmail,
      subject: `Booking ${statusLabel} (#${params.bookingId})`,
      html: adminBody,
      replyTo: params.userEmail
    }
  ];

  const results = await Promise.all(
    emails.map((email) =>
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

  const failed = results.find((result) => !result.ok);
  if (failed) {
    const detail = await failed.text();
    throw new Error(`Status notification email failed: ${detail}`);
  }
}

async function sendInterviewDecisionEmails(params: {
  userEmail: string;
  fullName: string;
  applicationId: number;
  shortlistStatus: 'shortlisted' | 'rejected';
  interviewDate?: string;
  adminEmail: string;
}) {
  const resendApiKey = getEnv('RESEND_API_KEY');
  const senderEmail = getEnv('BOOKING_SENDER_EMAIL');
  const fallbackAdminEmail = getEnv('BOOKING_ADMIN_EMAIL');
  const adminEmail = params.adminEmail || fallbackAdminEmail;

  if (!resendApiKey || !senderEmail || !adminEmail) {
    throw new Error('Missing RESEND_API_KEY, BOOKING_SENDER_EMAIL, or BOOKING_ADMIN_EMAIL.');
  }

  const isShortlisted = params.shortlistStatus === 'shortlisted';
  const formattedInterviewDate =
    isShortlisted && params.interviewDate ? formatInterviewDate(params.interviewDate) : '';

  const userSubject = isShortlisted
    ? `Interview Shortlist Confirmation (#${params.applicationId})`
    : `Application Update (#${params.applicationId})`;
  const adminSubject = isShortlisted
    ? `Candidate Shortlisted For Interview (#${params.applicationId})`
    : `Candidate Rejected For Interview (#${params.applicationId})`;

  const userBody = isShortlisted
    ? `<p>Dear ${params.fullName},</p>
<p>Congratulations! You have been shortlisted for the interview round for the TNPSC Group IV coaching program at Dr. Ambedkar Academy.</p>
<p><strong>Application ID:</strong> ${params.applicationId}<br />
<strong>Interview Date:</strong> ${formattedInterviewDate}</p>
<p>Please appear on the scheduled date with your original Aadhaar card, passport-size photograph, proof of education, and community certificate. The documents will be returned after verification.</p>
<p>Candidates selected in the interview are expected to join the classes from <strong>August 20, 2026</strong>.</p>
<p>Good luck with your interview!</p>
<p>Thank you.</p>`
    : `<p>Dear ${params.fullName},</p>
<p>Thank you for applying to the TNPSC Group IV coaching program at Dr. Ambedkar Academy.</p>
<p>After review, your application #${params.applicationId} has not been shortlisted for the interview round.</p>
<p>We appreciate your interest.</p>`;

  const adminBody = isShortlisted
    ? `<p>An interview shortlist decision has been confirmed.</p>
<p><strong>Application ID:</strong> ${params.applicationId}<br />
<strong>Name:</strong> ${params.fullName}<br />
<strong>Applicant Email:</strong> ${params.userEmail}<br />
<strong>Decision:</strong> Shortlisted<br />
<strong>Interview Date:</strong> ${formattedInterviewDate}</p>`
    : `<p>An application review decision has been confirmed.</p>
<p><strong>Application ID:</strong> ${params.applicationId}<br />
<strong>Name:</strong> ${params.fullName}<br />
<strong>Applicant Email:</strong> ${params.userEmail}<br />
<strong>Decision:</strong> Rejected</p>`;

  const emails = [
    {
      to: params.userEmail,
      subject: userSubject,
      html: userBody,
      replyTo: adminEmail
    },
    {
      to: adminEmail,
      subject: adminSubject,
      html: adminBody,
      replyTo: params.userEmail
    }
  ];

  const results = await Promise.all(
    emails.map((email) =>
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

  const failed = results.find((result) => !result.ok);
  if (failed) {
    const detail = await failed.text();
    throw new Error(`Interview decision email failed: ${detail}`);
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    validateAdminAccess(body?.accessKey);
    const adminClient = getAdminClient();

    if (body?.action === 'list-events') {
      const { data, error } = await adminClient
        .from('admin_events')
        .select('id, event_date, start_time, end_time, event_type, description, created_at')
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ events: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'create-event') {
      validateEventPayload(body?.event);
      await assertEventDoesNotOverlap(adminClient, body.event);
      const { error } = await adminClient.from('admin_events').insert({
        event_date: body.event.eventDate,
        start_time: body.event.startTime,
        end_time: body.event.endTime,
        event_type: body.event.eventType,
        description: body.event.description
      });
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'update-event') {
      if (!body?.id) throw new Error('Missing event id.');
      validateEventPayload(body?.event);
      await assertEventDoesNotOverlap(adminClient, body.event, Number(body.id));
      const { error } = await adminClient
        .from('admin_events')
        .update({
          event_date: body.event.eventDate,
          start_time: body.event.startTime,
          end_time: body.event.endTime,
          event_type: body.event.eventType,
          description: body.event.description
        })
        .eq('id', body.id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'delete-event') {
      if (!body?.id) throw new Error('Missing event id.');
      const { error } = await adminClient.from('admin_events').delete().eq('id', body.id);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'list-bookings') {
      const { data, error } = await adminClient
        .from('hall_bookings')
        .select(
          'id, full_name, organization, email, phone, event_date, booking_slot, event_type, address, event_description, total_price, status, rejection_reason, payment_received, created_at'
        )
        .order('event_date', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ bookings: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'list-group-iv-applications') {
      const { data, error } = await adminClient
        .from('group_iv_applications_2026')
        .select(
          'id, full_name, date_of_birth, gender, permanent_address, city, pincode, email, contact_number, aadhar_number, educational_qualification, community, mother_name, mother_occupation, father_name, father_occupation, annual_family_income_inr, parent_contact_number, tnpsc_exams, previous_coaching, previous_coaching_year, shortlist_status, interview_date, interview_status, created_at'
        )
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ applications: data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'set-group-iv-application-decision') {
      if (!body?.id) throw new Error('Missing application id.');
      if (!['shortlisted', 'rejected'].includes(body?.shortlistStatus)) {
        throw new Error('Invalid shortlist decision.');
      }

      const shortlistStatus = body.shortlistStatus as 'shortlisted' | 'rejected';
      const interviewDate = typeof body?.interviewDate === 'string' ? body.interviewDate : '';

      if (shortlistStatus === 'shortlisted' && !interviewDate) {
        throw new Error('Interview date is required when shortlisting a candidate.');
      }

      const { data: application, error: applicationError } = await adminClient
        .from('group_iv_applications_2026')
        .select('id, full_name, email')
        .eq('id', body.id)
        .single();

      if (applicationError || !application) throw new Error('Application not found.');

      const updatePayload =
        shortlistStatus === 'shortlisted'
          ? {
              shortlist_status: shortlistStatus,
              interview_date: interviewDate,
              interview_status: 'not-held-yet'
            }
          : {
              shortlist_status: shortlistStatus,
              interview_date: null
            };

      const { error: updateError } = await adminClient
        .from('group_iv_applications_2026')
        .update(updatePayload)
        .eq('id', body.id);

      if (updateError) throw new Error(updateError.message);

      await sendInterviewDecisionEmails({
        userEmail: application.email,
        fullName: application.full_name,
        applicationId: application.id,
        shortlistStatus,
        interviewDate: shortlistStatus === 'shortlisted' ? interviewDate : undefined,
        adminEmail: body.adminEmail
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'set-group-iv-application-status') {
      if (!body?.id) throw new Error('Missing application id.');
      if (!['not-held-yet', 'accepted', 'rejected', 'in-review'].includes(body?.status)) {
        throw new Error('Invalid interview status.');
      }

      const { data: application, error: applicationError } = await adminClient
        .from('group_iv_applications_2026')
        .select('id, shortlist_status')
        .eq('id', body.id)
        .single();

      if (applicationError || !application) throw new Error('Application not found.');
      if (application.shortlist_status !== 'shortlisted') {
        throw new Error('Interview status can only be updated after a candidate is shortlisted.');
      }

      const { error } = await adminClient
        .from('group_iv_applications_2026')
        .update({
          interview_status: body.status
        })
        .eq('id', body.id);

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'set-booking-status') {
      if (!body?.id) throw new Error('Missing booking id.');
      if (!['approved', 'rejected'].includes(body?.status)) {
        throw new Error('Status must be approved or rejected.');
      }
      if (body?.status === 'rejected' && !body?.reason?.trim()) {
        throw new Error('Reason is required when denying a booking.');
      }

      const { data: booking, error: bookingError } = await adminClient
        .from('hall_bookings')
        .select('id, full_name, email, event_date, booking_slot')
        .eq('id', body.id)
        .single();

      if (bookingError || !booking) throw new Error('Booking not found.');

      const { error: updateError } = await adminClient
        .from('hall_bookings')
        .update({
          status: body.status,
          rejection_reason: body.status === 'rejected' ? body.reason : null
        })
        .eq('id', body.id);

      if (updateError) throw new Error(updateError.message);

      await sendStatusEmails({
        userEmail: booking.email,
        fullName: booking.full_name,
        bookingId: booking.id,
        status: body.status,
        reason: body.reason,
        adminEmail: body.adminEmail,
        eventDate: booking.event_date,
        bookingSlot: booking.booking_slot
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body?.action === 'set-payment-status') {
      if (!body?.id) throw new Error('Missing booking id.');
      const paymentReceived = Boolean(body?.paymentReceived);

      const { data: booking, error: bookingError } = await adminClient
        .from('hall_bookings')
        .select('id, status')
        .eq('id', body.id)
        .single();

      if (bookingError || !booking) throw new Error('Booking not found.');
      if (booking.status !== 'approved') {
        throw new Error('Payment can only be marked for approved bookings.');
      }

      const { error: updateError } = await adminClient
        .from('hall_bookings')
        .update({
          payment_received: paymentReceived,
          payment_received_at: paymentReceived ? new Date().toISOString() : null
        })
        .eq('id', body.id);

      if (updateError) throw new Error(updateError.message);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported action.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
