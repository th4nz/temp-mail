const MAILSLURP_API =
  "https://api.mailslurp.com";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  const apiKey =
    process.env.MAILSLURP_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "MAILSLURP_API_KEY belum diset"
    });
  }

  try {
    const {
      inboxId,
      page = "0",
      size = "20"
    } = req.query;

    if (!inboxId) {
      return res.status(400).json({
        success: false,
        error: "inboxId wajib diisi"
      });
    }

    const url = new URL(
      `${MAILSLURP_API}/emails`
    );

    url.searchParams.set(
      "inboxId",
      inboxId
    );

    url.searchParams.set(
      "page",
      page
    );

    url.searchParams.set(
      "size",
      size
    );

    const response = await fetch(
      url.toString(),
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error:
          data?.message ||
          data?.error ||
          "Gagal mengambil email"
      });
    }

    return res.status(200).json({
      success: true,
      emails: data.content || data
    });

  } catch (error) {
    console.error(
      "GET_EMAILS_ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Gagal mengambil email"
    });
  }
}
