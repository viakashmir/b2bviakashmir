import { Resend } from 'resend'

/**
 * Centralised transactional-email helper for the B2B portal.
 *
 * All sends are best-effort: a failure here never breaks the API
 * route that triggered them. Env vars are read lazily so the build
 * succeeds even when RESEND_API_KEY is unset (e.g. preview builds).
 *
 * Env vars:
 *   RESEND_API_KEY  – server-only Resend secret
 *   EMAIL_FROM      – verified sender, e.g. 'Via Kashmir <noreply@viakashmiritinerary.in>'
 *   ADMIN_EMAIL     – inbox that receives admin notifications
 *   APP_URL         – canonical site URL used inside CTA buttons,
 *                     defaults to https://b2b.viakashmiritinerary.in
 */

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function fromAddr(): string {
  return process.env.EMAIL_FROM || 'Via Kashmir <onboarding@resend.dev>'
}
function adminAddr(): string {
  return process.env.ADMIN_EMAIL || 'admin@viakashmiritinerary.in'
}
function appUrl(): string {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://b2b.viakashmiritinerary.in'
}

async function send(opts: { to: string | string[]; subject: string; html: string }) {
  const r = client()
  if (!r) {
    console.warn('[email] RESEND_API_KEY missing — skipping send:', opts.subject)
    return
  }
  try {
    await r.emails.send({
      from: fromAddr(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
  } catch (e) {
    console.error('[email] send failed:', (e as Error).message, opts.subject)
  }
}

// ============================================================
// Branded HTML shell — Manrope/Inter, Kashmir saffron+green palette
// ============================================================

function layout(opts: {
  preheader: string
  heading: string
  intro: string
  bodyHtml: string
  ctaLabel?: string
  ctaHref?: string
  footnote?: string
}): string {
  const cta = opts.ctaLabel && opts.ctaHref
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 8px;">
         <tr><td style="border-radius:9999px; background:linear-gradient(135deg,#00361a 0%,#1a4d2e 100%);">
           <a href="${opts.ctaHref}" style="display:inline-block; padding:14px 28px; font-family:'Manrope',Arial,sans-serif; font-weight:800; font-size:14px; color:#ffffff; text-decoration:none; border-radius:9999px;">
             ${opts.ctaLabel} →
           </a>
         </td></tr>
       </table>`
    : ''

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(opts.heading)}</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f5; font-family:'Inter','Helvetica Neue',Arial,sans-serif; color:#191c1d;">
  <span style="display:none; opacity:0; visibility:hidden; height:0; width:0; overflow:hidden;">${escapeHtml(opts.preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="540" cellspacing="0" cellpadding="0" border="0" style="max-width:540px; width:100%; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 8px 32px rgba(25,28,29,0.06);">
          <tr>
            <td style="padding:28px 28px 22px; background:linear-gradient(135deg,#00361a 0%,#1a4d2e 60%,#004e5f 100%); color:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-family:'Manrope',Arial,sans-serif; font-weight:900; font-size:18px; letter-spacing:-0.01em;">Via Kashmir</div>
                    <div style="font-family:'Inter',Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#9dd3aa; margin-top:4px;">B2B Rate Portal</div>
                  </td>
                  <td align="right" style="font-family:'Inter',Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#ffdcc4;">
                    Hello from Kashmir
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 28px 8px;">
              <h1 style="margin:0 0 12px; font-family:'Manrope',Arial,sans-serif; font-weight:800; font-size:24px; line-height:1.25; color:#00361a; letter-spacing:-0.02em;">
                ${opts.heading}
              </h1>
              <p style="margin:0; font-size:15px; line-height:1.6; color:#414942;">
                ${opts.intro}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 12px; font-size:14px; line-height:1.65; color:#191c1d;">
              ${opts.bodyHtml}
              ${cta}
            </td>
          </tr>
          ${opts.footnote ? `
          <tr>
            <td style="padding:6px 28px 24px; font-size:12px; line-height:1.55; color:#717971; border-top:1px solid #edeeef;">
              ${opts.footnote}
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:18px 28px; background:#f8f9fa; font-size:11px; color:#717971; font-family:'Inter',Arial,sans-serif;">
              Sent by Via Kashmir B2B Rate Portal · <a href="${appUrl()}" style="color:#1d5031; text-decoration:none;">${appUrl().replace(/^https?:\/\//, '')}</a>
            </td>
          </tr>
        </table>
        <div style="font-size:10px; color:#9dabae; margin-top:14px; font-family:'Inter',Arial,sans-serif;">
          You are receiving this because you have an account on Via Kashmir B2B.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function infoTable(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 4px;">
    ${rows.map(([k, v]) => `
      <tr>
        <td style="padding:8px 0; font-size:11px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#717971; width:130px; vertical-align:top;">
          ${escapeHtml(k)}
        </td>
        <td style="padding:8px 0; font-size:14px; color:#191c1d; font-weight:600;">
          ${escapeHtml(v) || '—'}
        </td>
      </tr>`).join('')}
  </table>`
}

// ============================================================
// Trigger functions (called from API routes)
// ============================================================

/** Vendor submitted their listing (first time, approved=false). */
export async function emailListingSubmitted(args: {
  vendorEmail: string
  vendorName?: string
  hotelName: string
  locationLabel: string
}) {
  const url = `${appUrl()}/vendor`
  const html = layout({
    preheader: `Your listing "${args.hotelName}" is waiting for admin approval.`,
    heading: `Your listing is in review`,
    intro: `Hi${args.vendorName ? ` ${args.vendorName}` : ''}, we received your property details for <strong>${escapeHtml(args.hotelName)}</strong> in ${escapeHtml(args.locationLabel)}. Our admin team will approve it shortly — usually within 24 hours.`,
    bodyHtml: `
      ${infoTable([
        ['Property', args.hotelName],
        ['Location', args.locationLabel],
        ['Status',   'Pending admin approval'],
      ])}
      <p style="margin:14px 0 0; font-size:14px; line-height:1.65;">
        Meanwhile you can keep editing your rooms, rates and amenities from the dashboard. The moment we approve, your listing appears on the public rate board for every travel agent in real-time.
      </p>
    `,
    ctaLabel: 'Open my dashboard',
    ctaHref: url,
    footnote: `Need help? Reply to this email and we'll get back to you.`,
  })

  await Promise.allSettled([
    send({ to: args.vendorEmail, subject: `We've received your listing — pending approval`, html }),
    send({
      to: adminAddr(),
      subject: `[Approval needed] ${args.hotelName} · ${args.locationLabel}`,
      html: layout({
        preheader: `${args.hotelName} just submitted a listing.`,
        heading: `New listing awaiting approval`,
        intro: `<strong>${escapeHtml(args.hotelName)}</strong> in ${escapeHtml(args.locationLabel)} just completed onboarding and is awaiting your approval.`,
        bodyHtml: `
          ${infoTable([
            ['Property', args.hotelName],
            ['Location', args.locationLabel],
            ['Vendor email', args.vendorEmail],
          ])}
        `,
        ctaLabel: 'Review in admin',
        ctaHref: `${appUrl()}/admin`,
      }),
    }),
  ])
}

/** Admin approved a hotel. */
export async function emailHotelApproved(args: {
  vendorEmail: string
  hotelName: string
  locationLabel: string
}) {
  const html = layout({
    preheader: `Your listing "${args.hotelName}" is now live.`,
    heading: `Your listing is live`,
    intro: `Great news — <strong>${escapeHtml(args.hotelName)}</strong> is now visible to travel agents on the public rate board.`,
    bodyHtml: `
      ${infoTable([
        ['Property', args.hotelName],
        ['Location', args.locationLabel],
        ['Status',   'Approved · Live'],
      ])}
      <p style="margin:14px 0 0; font-size:14px; line-height:1.65;">
        Keep your rates and inventory updated from the dashboard — every change publishes instantly to the public board, no admin in the loop.
      </p>
    `,
    ctaLabel: 'View my public listing',
    ctaHref: `${appUrl()}/vendor/listing`,
  })
  await send({ to: args.vendorEmail, subject: `${args.hotelName} is now live on Via Kashmir`, html })
}

/** Admin suspended a hotel. */
export async function emailHotelSuspended(args: {
  vendorEmail: string
  hotelName: string
}) {
  const html = layout({
    preheader: `Your listing "${args.hotelName}" was suspended.`,
    heading: `Your listing has been suspended`,
    intro: `<strong>${escapeHtml(args.hotelName)}</strong> has been temporarily suspended by the Via Kashmir admin team. It's no longer visible to travel agents on the public rate board.`,
    bodyHtml: `
      <p style="margin:0; font-size:14px; line-height:1.65;">
        If this seems wrong, reply to this email and we'll review. Your data, rates and inventory are preserved — re-approval brings the listing back instantly.
      </p>
    `,
    ctaLabel: 'Open dashboard',
    ctaHref: `${appUrl()}/vendor`,
  })
  await send({ to: args.vendorEmail, subject: `${args.hotelName} suspended on Via Kashmir`, html })
}

/** Customer (travel agent) raised a concern. */
export async function emailConcernRaised(args: {
  agentEmail: string
  agentName: string
  agentCompany: string
  hotelName: string
  category: string
  priority: string
  subject: string
  description: string
}) {
  const ackHtml = layout({
    preheader: `We received your concern about ${args.hotelName}.`,
    heading: `We've received your concern`,
    intro: `Hi ${args.agentName.split(' ')[0]}, thanks for letting us know. Our admin team will look at this and respond shortly.`,
    bodyHtml: `
      ${infoTable([
        ['Hotel',     args.hotelName],
        ['Category',  args.category],
        ['Priority',  args.priority],
        ['Subject',   args.subject],
      ])}
      <div style="margin:14px 0 4px; font-size:11px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#717971;">Your message</div>
      <div style="padding:14px 16px; background:#f3f4f5; border-radius:10px; font-size:13.5px; line-height:1.55; color:#414942; white-space:pre-wrap;">${escapeHtml(args.description)}</div>
    `,
    ctaLabel: 'View in my dashboard',
    ctaHref: `${appUrl()}/customer`,
  })

  const adminHtml = layout({
    preheader: `New ${args.priority} concern from ${args.agentCompany} about ${args.hotelName}.`,
    heading: `New concern · ${args.priority} priority`,
    intro: `<strong>${escapeHtml(args.agentName)}</strong> from <em>${escapeHtml(args.agentCompany)}</em> raised a concern about <strong>${escapeHtml(args.hotelName)}</strong>.`,
    bodyHtml: `
      ${infoTable([
        ['Hotel',     args.hotelName],
        ['Category',  args.category],
        ['Priority',  args.priority],
        ['Subject',   args.subject],
        ['From',      `${args.agentName} (${args.agentEmail})`],
        ['Company',   args.agentCompany],
      ])}
      <div style="margin:14px 0 4px; font-size:11px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#717971;">Message</div>
      <div style="padding:14px 16px; background:#f3f4f5; border-radius:10px; font-size:13.5px; line-height:1.55; color:#414942; white-space:pre-wrap;">${escapeHtml(args.description)}</div>
    `,
    ctaLabel: 'Respond in admin panel',
    ctaHref: `${appUrl()}/admin`,
  })

  await Promise.allSettled([
    send({ to: args.agentEmail, subject: `We've received your concern about ${args.hotelName}`, html: ackHtml }),
    send({ to: adminAddr(), subject: `[Concern · ${args.priority}] ${args.hotelName} — ${args.subject}`, html: adminHtml }),
  ])
}

/** Admin sent a response to a concern. */
export async function emailConcernResponded(args: {
  agentEmail: string
  agentName: string
  hotelName: string
  subject: string
  adminResponse: string
  status: string
}) {
  const html = layout({
    preheader: `Admin responded to your concern about ${args.hotelName}.`,
    heading: `Admin responded to your concern`,
    intro: `Hi ${args.agentName.split(' ')[0]}, our admin team has responded to your concern about <strong>${escapeHtml(args.hotelName)}</strong>.`,
    bodyHtml: `
      ${infoTable([
        ['Hotel',   args.hotelName],
        ['Subject', args.subject],
        ['Status',  args.status.replace('-', ' ')],
      ])}
      <div style="margin:14px 0 4px; font-size:11px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#717971;">Admin response</div>
      <div style="padding:14px 16px; background:rgba(184,240,197,0.18); border-left:3px solid #1d5031; border-radius:10px; font-size:13.5px; line-height:1.55; color:#191c1d; white-space:pre-wrap;">${escapeHtml(args.adminResponse)}</div>
    `,
    ctaLabel: 'Open my concerns',
    ctaHref: `${appUrl()}/customer`,
  })
  await send({ to: args.agentEmail, subject: `Re: ${args.subject}`, html })
}
