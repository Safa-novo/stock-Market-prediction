import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

const serviceAccountPath = path.resolve("firebase-service-account.json");

function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  if (fs.existsSync(serviceAccountPath)) {
    return JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  }

  return null;
}

const serviceAccount = readServiceAccount();

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://stock-market-predictor-d4067-default-rtdb.firebaseio.com",
  });
}

export const db = admin.apps.length ? admin.database() : null;
export const firebaseEnabled = Boolean(db);
