import crypto from "node:crypto";

const MAILSLURP_API =
  "https://api.mailslurp.com";

const MAX_GENERATE = 100;

function getApiKey() {
  return process.env.MAILSLURP_API_KEY;
}

async function createInbox() {
  const response = await fetch(
    `${MAILSLURP_API}/inboxes`,
    {
      method: "POST",
      headers: {
        "x-api-key": getApiKey(),
        "Content-Type": "application/json"
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      "MailSlurp API error"
    );
  }

  return {
    id: data.id,
    email: data.emailAddress
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  if (!getApiKey()) {
    return res.status(500).json({
      success: false,
      error: "MAILSLURP_API_KEY belum diset"
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};

    const count = Number(body.count || 1);

    if (
      !Number.isInteger(count) ||
      count < 1
    ) {
      return res.status(400).json({
        success: false,
        error: "Jumlah harus minimal 1"
      });
    }

    if (count > MAX_GENERATE) {
      return res.status(400).json({
        success: false,
        error: `Maksimal ${MAX_GENERATE} inbox`
      });
    }

    const inboxes = [];

    for (let i = 0; i < count; i++) {
      const inbox = await createInbox();

      inboxes.push({
        localId: crypto.randomUUID(),
        inboxId: inbox.id,
        email: inbox.email
      });
    }

    return res.status(200).json({
      success: true,
      count: inboxes.length,
      inboxes
    });

  } catch (error) {
    console.error(
      "CREATE_INBOX_ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message ||
        "Gagal membuat inbox"
    });
  }
}
