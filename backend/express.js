import express from 'express';
import cors from 'cors';              // 👈 Thêm nếu gọi từ frontend khác origin
import { getUser, createUser, getAllUsers, addToWatchlist, removeFromWatchlist, getWatchlist, clearWatchlist} from './db.js';

const app = express();
const port = 3000;

app.use(cors());                      // 👈 Cho phép frontend gọi
app.use(express.json());             // 👈 Cho phép đọc JSON từ body

app.get('/', async (req, res) => {
    const users = await getAllUsers();
    res.json(users);
});

app.post('/createUser', async (req, res) => {
    const { username, password } = req.body;
    const user = await createUser(username, password);
    if (user) {
        res.json({ message: 'Đăng ký tài khoản thành công!'});
    }
});

app.get('/getUser', async (req, res) => {
    const { username } = req.query;
    const user = await getUser(username);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'Tài khoản không tồn tại!' });
    }
});

app.post('/watchlist', async (req, res) => {
    const { username, mal_id, title, image_url, score } = req.body;
    const watchlist = await addToWatchlist(username, mal_id, title, image_url, score);
    if (watchlist) {
        res.json({ message: 'Thêm vào watchlist thành công!'});
    } else {
        res.json({ message: 'Thêm vào watchlist thất bại!'});
    }
});

app.delete('/watchlist/clear/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const watchlist = await clearWatchlist(username);
        res.json(watchlist);
    } catch (error) {
        console.error('Error in clearWatchlist:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/watchlist/:username/:mal_id', async (req, res) => {
    const { username, mal_id } = req.params;
    const watchlist = await removeFromWatchlist(username, mal_id);
    res.json(watchlist);
});

app.get('/watchlist/:username', async (req, res) => {
    const { username } = req.params;
    const watchlist = await getWatchlist(username);
    res.json(watchlist);
});
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
