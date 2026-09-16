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
    const { emailId } = req.query;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        error: "emailId wajib diisi"
      });
    }

    const response = await fetch(
      `${MAILSLURP_API}/emails/${encodeURIComponent(
        emailId
      )}`,
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
          "Email tidak ditemukan"
      });
    }

    return res.status(200).json({
      success: true,
      email: data
    });

  } catch (error) {
    console.error(
      "GET_EMAIL_ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Gagal mengambil detail email"
    });
  }
}
