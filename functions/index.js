/**
 * Cloud Function that censors profane chat messages, tracks flags, and
 * prunes chat history to the most recent 25 entries.
 */

const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const Filter = require("bad-words");

admin.initializeApp();
const db = admin.firestore();
const filter = new Filter();

const MESSAGES_LIMIT = 25;

const pruneOldMessages = async () => {
  try {
    const latestSnapshot = await db
        .collection("messages")
        .orderBy("createdAt", "desc")
        .limit(MESSAGES_LIMIT)
        .get();

    if (latestSnapshot.empty) {
      return;
    }

    const oldestKept = latestSnapshot.docs[latestSnapshot.size - 1];
    const cutoff = oldestKept.get("createdAt");

    if (!cutoff) {
      return;
    }

    const outdatedSnapshot = await db
        .collection("messages")
        .orderBy("createdAt")
        .endBefore(cutoff)
        .get();

    if (outdatedSnapshot.empty) {
      return;
    }

    const batch = db.batch();
    outdatedSnapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    let cutoffLabel = cutoff;
    if (cutoff && typeof cutoff.toMillis === "function") {
      cutoffLabel = cutoff.toMillis();
    }
    logger.log(
        `Pruned ${outdatedSnapshot.size} old messages`,
        {cutoff: cutoffLabel},
    );
  } catch (error) {
    logger.error("Failed to prune old messages", error);
  }
};

exports.detectEvilUsers = functions
    .region("us-central1")
    .runWith({maxInstances: 10})
    .firestore.document("messages/{messageId}")
    .onCreate(async (snap, context) => {
      const {messageId} = context.params;
      const messageData = snap.data();

      if (!messageData || typeof messageData.text !== "string") {
        logger.warn(
            `Message ${messageId} is missing expected text field; ` +
            "skipping profanity check.",
        );
        return null;
      }

      const originalText = messageData.text.trim();
      if (!originalText) {
        await pruneOldMessages();
        return null;
      }

      if (!filter.isProfane(originalText)) {
        await pruneOldMessages();
        return null;
      }

      const cleanedText = filter.clean(originalText);

      await snap.ref.update({
        text: cleanedText,
        flagged: true,
        cleanedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (messageData.uid) {
        await db
            .collection("flags")
            .doc(messageData.uid)
            .set(
                {
                  lastFlaggedMessageId: messageId,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  count: admin.firestore.FieldValue.increment(1),
                },
                {merge: true},
            );
      } else {
        logger.warn(
            `Flagged message ${messageId} did not include a uid; ` +
            "unable to track offending user.",
        );
      }

      await pruneOldMessages();

      logger.log(`Message ${messageId} was flagged and cleaned.`);
      return null;
    });
