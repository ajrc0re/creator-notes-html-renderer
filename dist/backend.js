// @bun
// src/backend.ts
spindle.onFrontendMessage(async (payload, userId) => {
  if (!payload || typeof payload !== "object")
    return;
  const msg = payload;
  if (msg.type !== "fetch_creator_notes" || typeof msg.character_id !== "string")
    return;
  try {
    const characterId = msg.character_id;
    const card = await spindle.characters.get(characterId, userId);
    spindle.sendToFrontend({
      type: "creator_notes_response",
      character_id: characterId,
      creator_notes: card?.creator_notes ?? ""
    }, userId);
  } catch (err) {
    spindle.sendToFrontend({
      type: "creator_notes_response",
      character_id: msg.character_id,
      creator_notes: "",
      error: String(err)
    }, userId);
  }
});
