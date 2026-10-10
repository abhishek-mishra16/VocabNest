const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// File-based JSON store: avoids native SQLite addons, so npm install works
// without compiling C++ modules on newer Node.js versions (including Node 26).
const app = express();
const PORT = process.env.PORT || 4000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'vocabnest.json');
fs.mkdirSync(dataDir, { recursive: true });

const initialWords = [
  ['Serendipity', 'The occurrence of a happy or useful event by chance.', 'Finding that little bookshop was pure serendipity.', 'Noun', 'Everyday'],
  ['Resilient', 'Able to recover quickly after difficulty.', 'She stayed resilient through every setback.', 'Adjective', 'Personal growth'],
  ['Eloquent', 'Fluent or persuasive in speaking or writing.', 'His eloquent speech moved the entire audience.', 'Adjective', 'Communication'],
  ['Pragmatic', 'Dealing with things sensibly and realistically.', 'We need a pragmatic plan that works within our budget.', 'Adjective', 'Work'],
  ['Ephemeral', 'Lasting for a very short time.', 'The beauty of a sunset is ephemeral.', 'Adjective', 'Literature'],
  ['Meticulous', 'Showing great attention to detail.', 'She is meticulous when reviewing her work.', 'Adjective', 'Work'],
  ['Ubiquitous', 'Present, appearing, or found everywhere.', 'Smartphones have become ubiquitous in modern life.', 'Adjective', 'Everyday'],
  ['Empathy', 'The ability to understand and share another person’s feelings.', 'Empathy helps us listen without judging.', 'Noun', 'Personal growth'],
  ['Concise', 'Giving a lot of information clearly in few words.', 'Keep your project summary concise and focused.', 'Adjective', 'Communication'],
  ['Tenacious', 'Persistent and determined; not giving up easily.', 'Her tenacious attitude helped her finish the marathon.', 'Adjective', 'Personal growth']
];
function loadStore() {
  if (fs.existsSync(dataFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      if (Array.isArray(parsed.words)) return parsed;
    } catch (error) {
      console.error('Could not read vocabulary data file:', error.message);
      throw new Error(`Vocabulary data file is invalid: ${dataFile}`);
    }
  }
  const store = { nextId: initialWords.length + 1, words: initialWords.map((w, i) => ({
    id: i + 1, word: w[0], meaning: w[1], example: w[2], part_of_speech: w[3], category: w[4], is_favorite: false, created_at: new Date().toISOString()
  })) };
  saveStore(store);
  return store;
}
function saveStore(value) {
  const tempFile = `${dataFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(tempFile, dataFile);
}
let store = loadStore();
const byId = id => store.words.find(w => w.id === id);
const toClient = row => row && ({ ...row, is_favorite: Boolean(row.is_favorite) });

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'VocabNest', storage: 'json-file' }));
app.get('/api/words', (req, res) => {
  const { search = '', category = 'All', favorite = 'false' } = req.query;
  let rows = [...store.words].sort((a, b) => b.created_at.localeCompare(a.created_at) || a.word.localeCompare(b.word));
  const needle = String(search).trim().toLowerCase();
  if (needle) rows = rows.filter(w => [w.word, w.meaning, w.example, w.category].some(v => String(v).toLowerCase().includes(needle)));
  if (category !== 'All') rows = rows.filter(w => w.category === category);
  if (favorite === 'true') rows = rows.filter(w => w.is_favorite);
  res.json(rows.map(toClient));
});
app.get('/api/stats', (_req, res) => res.json({
  total: store.words.length,
  favorites: store.words.filter(w => w.is_favorite).length,
  categories: new Set(store.words.map(w => w.category)).size
}));
app.post('/api/words', (req, res) => {
  const { word, meaning, example = '', part_of_speech = 'Other', category = 'General' } = req.body || {};
  if (!String(word || '').trim() || !String(meaning || '').trim()) return res.status(400).json({ error: 'Word and meaning are required.' });
  if (store.words.some(w => w.word.toLowerCase() === String(word).trim().toLowerCase())) return res.status(409).json({ error: 'That word is already in your vocabulary.' });
  const row = { id: store.nextId++, word: String(word).trim(), meaning: String(meaning).trim(), example: String(example).trim(), part_of_speech: String(part_of_speech), category: String(category).trim() || 'General', is_favorite: false, created_at: new Date().toISOString() };
  store.words.push(row);
  try { saveStore(store); } catch (error) { store.words = store.words.filter(w => w.id !== row.id); store.nextId--; return res.status(500).json({ error: 'Could not save this word.' }); }
  res.status(201).json(toClient(row));
});
app.patch('/api/words/:id/favorite', (req, res) => {
  const row = byId(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Word not found.' });
  row.is_favorite = !row.is_favorite;
  try { saveStore(store); } catch (error) { row.is_favorite = !row.is_favorite; return res.status(500).json({ error: 'Could not save favorite.' }); }
  res.json(toClient(row));
});
app.delete('/api/words/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = store.words.findIndex(w => w.id === id);
  if (index < 0) return res.status(404).json({ error: 'Word not found.' });
  const [removed] = store.words.splice(index, 1);
  try { saveStore(store); } catch (error) { store.words.splice(index, 0, removed); return res.status(500).json({ error: 'Could not delete this word.' }); }
  res.status(204).end();
});

const dist = path.join(__dirname, '..', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.listen(PORT, () => console.log(`VocabNest API running at http://localhost:${PORT}`));
