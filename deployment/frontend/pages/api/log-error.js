/**
 * API endpoint to log client-side errors
 * 
 * This endpoint receives error reports from the ErrorBoundary component
 * and logs them for later review. In a production environment, you might
 * want to send these to a logging service or database.
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { error, errorInfo, location, timestamp } = req.body;

    // Log the error to server console
    console.error('Client-side error:', {
      error,
      errorInfo,
      location,
      timestamp,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });

    // Here you would typically:
    // 1. Store the error in a database
    // 2. Send it to a logging service
    // 3. Trigger alerts if necessary

    // For example with a database:
    /*
    await db.collection('error_logs').insertOne({
      error,
      errorInfo,
      location,
      timestamp,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
    */

    // Return success to the client
    return res.status(200).json({ 
      message: 'Error logged successfully',
      id: Date.now().toString() // In production, use a proper ID from your DB
    });
  } catch (err) {
    console.error('Error while logging client error:', err);
    return res.status(500).json({ message: 'Error logging failed' });
  }
}
