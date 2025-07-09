import mysql from 'mysql2';

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'anime_db'
}).promise();

export const getUser = async (username) => {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
};

export const createUser = async (username, password) => {
    const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    if (result.affectedRows > 0) {
        return true;
    } else {
        return false;
    }
};

export const getAllUsers = async () => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
};

export const addToWatchlist = async (username, mal_id, title, image_url, score) => {
    const [result] = await db.query('INSERT INTO watchlist (username, mal_id, title, image_url, score) VALUES (?, ?, ?, ?, ?)', [username, mal_id, title, image_url, score]);
    if (result.affectedRows > 0) {
        return true;
    } else {
        return false;
    }
};

export const removeFromWatchlist = async (username, mal_id) => {
    const [result] = await db.query('DELETE FROM watchlist WHERE username = ? AND mal_id = ?', [username, mal_id]);
    if (result.affectedRows > 0) {
        return true;
    } else {
        return false;
    }
};

export const getWatchlist = async (username) => {
    const [rows] = await db.query('SELECT * FROM watchlist WHERE username = ?', [username]);
    return rows;
};

export const clearWatchlist = async (username) => {
    const [result] = await db.query('DELETE FROM watchlist WHERE username = ?', [username]);
    if (result.affectedRows > 0) {
        return true;
    } else {
        return false;
    }
};