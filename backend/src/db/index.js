'use strict';

const path = require('path');
const config = require('../config');
const Collection = require('./Collection');

const file = (name) => path.join(config.dataDir, `${name}.json`);

/**
 * Veritabani koleksiyonlari.
 * Her biri data/ altinda ayri bir JSON dosyasina karsilik gelir.
 */
const db = {
  movies: new Collection('movies', file('movies'), 'mv'),
  genres: new Collection('genres', file('genres'), 'gn'),
  users: new Collection('users', file('users'), 'us'),
  comments: new Collection('comments', file('comments'), 'cm'),

  // Kullanici <-> film iliskileri (ara tablolar)
  likes: new Collection('likes', file('likes'), 'lk'),
  favorites: new Collection('favorites', file('favorites'), 'fv'),
  watchlist: new Collection('watchlist', file('watchlist'), 'wl'),
  ratings: new Collection('ratings', file('ratings'), 'rt'),
  commentLikes: new Collection('commentLikes', file('comment-likes'), 'cl'),
};

/** Sunucu acilirken tum dosyalari bellege yukler. */
function loadAll() {
  Object.values(db).forEach((collection) => collection.load());
  return db;
}

/** Toplu islem baslat (seed / migrasyon icin): yazmalar ertelenir. */
function pauseAll() {
  Object.values(db).forEach((collection) => collection.pause());
}

/** Toplu islemi bitir: her koleksiyon tek seferde diske yazilir. */
async function flushAll() {
  for (const collection of Object.values(db)) await collection.resume();
}

module.exports = { db, loadAll, pauseAll, flushAll };
