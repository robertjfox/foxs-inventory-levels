export default async function handler(req, res) {
  const response = await fetch(
    "https://api.jsonbin.io/v3/b/675c951cad19ca34f8daad68",
    {
      headers: {
        "X-Master-Key":
          "$2a$10$LccuDAOpJD6AgjRfUqg8.eaLJWHyUQ8wKfcdmHi1Oggqk0ex9Gg8m",
      },
    }
  );
  let data = await response.json();
  data = data.record;
  res.status(200).json(data);
}
