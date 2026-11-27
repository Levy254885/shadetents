import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";
import crypto from "crypto";
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)) });
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const u = await admin.auth().verifyIdToken(token);
    const snap = await admin.firestore().doc("users/" + u.uid).get();
    if (snap.data()?.role !== "admin") return res.status(403).end();
    const timestamp = Math.floor(Date.now() / 1000), folder = "shade-tents";
    const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`).digest("hex");
    res.json({ signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY, cloud: process.env.CLOUDINARY_CLOUD_NAME });
  } catch { res.status(401).end(); }
}
