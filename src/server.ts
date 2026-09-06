import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type ContactPayload = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  subject?: unknown;
  message?: unknown;
};

const CONTACT_EMAIL = "jadisart.gallery@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function handleContactRequest(request: Request, env: unknown): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (fullName.length < 2 || fullName.length > 100) {
    return jsonResponse({ error: "Please enter your full name." }, 400);
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 255) {
    return jsonResponse({ error: "Please enter a valid email address, for example: example@gmail.com" }, 400);
  }
  if (phone.length > 40 || subject.length < 2 || subject.length > 150 || message.length < 10 || message.length > 1000) {
    return jsonResponse({ error: "Please complete all fields with valid information." }, 400);
  }

  const runtimeEnv = (env ?? {}) as Record<string, string | undefined>;
  const resendApiKey = runtimeEnv.RESEND_API_KEY;
  const fromEmail = runtimeEnv.RESEND_FROM_EMAIL;
  if (!resendApiKey || !fromEmail) {
    console.error("Contact email is not configured: RESEND_API_KEY and RESEND_FROM_EMAIL are required.");
    return jsonResponse({ error: "Email delivery is not configured." }, 503);
  }

  const submittedAt = new Date().toISOString();
  const html = `
    <h2>New Contact Form Submission — Jadis Art</h2>
    <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Date/time:</strong> ${escapeHtml(submittedAt)}</p>
    <h3>Message</h3>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [CONTACT_EMAIL],
      reply_to: email,
      subject: `New Contact Form Submission — ${subject}`,
      html,
    }),
  });

  if (!resendResponse.ok) {
    console.error("Resend rejected contact email", resendResponse.status, await resendResponse.text());
    return jsonResponse({ error: "We couldn't send your message right now." }, 502);
  }

  return jsonResponse({ ok: true });
}

async function handleAdminAccessRequest(request: Request, env: unknown): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  let payload: { code?: unknown };
  try {
    payload = (await request.json()) as { code?: unknown };
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }
  const configuredCode =
    (env as Record<string, string | undefined> | null)?.ADMIN_ACCESS_CODE ??
    (typeof process !== "undefined" ? process.env.ADMIN_ACCESS_CODE : undefined);
  const code = typeof payload.code === "string" ? payload.code.trim() : "";
  if (!configuredCode || code !== configuredCode) return jsonResponse({ error: "Unauthorized" }, 401);
  return jsonResponse({ ok: true });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/contact") return await handleContactRequest(request, env);
      if (url.pathname === "/api/admin-access") return await handleAdminAccessRequest(request, env);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
