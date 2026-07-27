// Keep in sync with src/lib/moods.js and supabase/schema.sql's check constraint.
const ALLOWED_MOODS = ['😄', '😐', '😢', '😡', '🥱'];

module.exports = { ALLOWED_MOODS };
