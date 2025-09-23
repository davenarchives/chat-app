/**
 * Cloud Function that censors profane chat messages and tracks repeat flags.
 */

const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const Filter = require("bad-words");

admin.initializeApp();
const db = admin.firestore();
const filter = new Filter();

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
        return null;
      }

      if (!filter.isProfane(originalText)) {
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

      logger.log(`Message ${messageId} was flagged and cleaned.`);
      return null;
    });
