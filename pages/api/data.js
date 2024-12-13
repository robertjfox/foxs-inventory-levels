import fs from "fs";
import path from "path";

export default function handler(req, res) {
  console.log("hello");
  const filePath = path.join(process.cwd(), "public/data.json"); // Access data.json in the root
  const data = fs.readFileSync(filePath, "utf8");
  res.status(200).json(JSON.parse(data));
}
