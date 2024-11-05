import db from '@/utils/db'; // Assuming a database connection utility

export default async (req, res) => {
  try {
    const events = await db.query("SELECT * FROM events WHERE type IN ('personal', 'group1', 'group2')");
    res.status(200).json(events.rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
};
