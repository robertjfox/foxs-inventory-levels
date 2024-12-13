export default async function handler(req, res) {
  // push to jsonbin.io
  const response = await fetch(
    "https://api.jsonbin.io/v3/b/675c951cad19ca34f8daad68",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key":
          "$2a$10$LccuDAOpJD6AgjRfUqg8.eaLJWHyUQ8wKfcdmHi1Oggqk0ex9Gg8m",
      },
      body: JSON.stringify(req.body),
    }
  );

  if (response.ok) {
    res.status(200).json({ success: true });
  }

  res.status(500).json({ success: false });
}
