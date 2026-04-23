import app from './app';
import { connectDatabase } from './config/database';

const port = process.env['PORT'] ?? 3000;

await connectDatabase();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
