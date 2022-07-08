const http = require('http');
const fs = require('fs');
const { url } = require('inspector');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */
    // Make sure your server's request-response for every endpoint matches the example server that you used to help you create the API documentation.

    // 1
    if (req.method === 'GET' && req.url === '/artists') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(artists));
    }

     // 2
    if (req.method === 'GET' && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
         const artistId = urlParts[2];
         const thisArtist = artists[artistId];
         res.statusCode = 200;
         res.setHeader('Content-Type','application/json');
         return res.end(JSON.stringify(thisArtist));
      }
    }

    //  // 3
    if (req.method === 'POST' && req.url === '/artists') {
      const newId = getNewArtistId();
      const artistName = req.body.name;
      let newArtist = {name: artistName, artistId: newId};
      artists[newId] = newArtist;
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(newArtist));
    }

    //  // 4
    if ((req.method === 'PUT' || req.method === 'PATCH') && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const artistId = urlParts[2];
        const artist = artists[artistId];
        artist.name = req.body.name;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(artist));
      }
    }

    //  // 5
    if (req.method === 'DELETE' && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const artistId = urlParts[2];
        const artist = artists[artistId];
        delete artists[artistId];
        console.log(artists)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end("Successfully deleted");
      }
    }

    //  // 6
    if (req.method === 'GET' && req.url.startsWith('/artists/') && req.url.endsWith('/albums')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 4) {
        const artistId = urlParts[2];
        let artistAlbums = [];
        for (const albumKey in albums) {
          const val = albums[albumKey];
          if (val.artistId === parseInt(artistId)) {
            artistAlbums.push(val);
          }
        }
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        return res.end(JSON.stringify(artistAlbums));
      }
    }

    //  // 7
    if (req.method === 'GET' && req.url.startsWith('/albums/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const albumId = urlParts[2];
        const album = albums[albumId];
        const artistId = album.artistId;
        let albumData = {
          "name": album.name,
          "albumId": album.albumId,
          "artistId": artistId,
          "artist": artists[artistId],
          "songs": []
        };
        for (const song in songs) {
          const val = songs[song];
          if (val.albumId === parseInt(albumId)) {
            albumData['songs'].push(val);
          }
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(albumData));
      }
    }

    //  // 8
    if (req.method === 'POST' && req.url.startsWith('/artists/') && req.url.endsWith('/albums')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 4) {
        const artistId = urlParts[2];
        const albumName = req.body.name;
        const albumId = getNewAlbumId();
        const newAlbum = {
          "albumId": albumId,
          "name": albumName,
          "artistId": artistId
        }
        albums[albumId] = newAlbum;
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(newAlbum));
      }
    }

    //  // 9
    if ((req.method === 'PUT' || req.method === 'PATCH') && req.url.startsWith('/albums/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const albumId = urlParts[2];
        let album = albums[albumId]
        album.name = req.body.name;
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(album))
      }
    }

    // // 10
    if (req.method === 'DELETE' && req.url.startsWith('/albums/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const albumId = urlParts[2];
        const album = albums[albumId];
        delete albums[albumId];
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end("Successfully deleted");
      }
    }

    // // 11
    if (req.method === 'GET' && req.url.startsWith('/artists/') && req.url.endsWith('/songs')) {
      const urlParts = req.url.split('/');
      const artistId = urlParts[2];
      let artistSongs = [];
      for (const song in songs) {
        const val = songs[song];
        const albumId = val.albumId;
        if (albums[albumId].artistId === parseInt(artistId)) {
          artistSongs.push(val);
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(artistSongs));
    }

    // // 12
    if (req.method === 'GET' && req.url.startsWith('/albums/') && req.url.endsWith('/songs')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 4) {
        const albumId = urlParts[2];
        let albumSongs = [];
        for (let song in songs) {
          const val = songs[song];
          if (val.albumId === parseInt(albumId)) {
            albumSongs.push(val);
          }
        }
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        return res.end(JSON.stringify(albumSongs));
      }
    }

    // // 13
    if (req.method === 'GET' && req.url.startsWith('/trackNumbers/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 4) {
        const trackNumber = urlParts[2];
        let tracks = [];
        for (const song in songs) {
          const val = songs[song];
          if (val.trackNumber === parseInt(trackNumber)) {
            tracks.push(val);
          }
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(tracks));
      }
    }

    // // 14
    if (req.method === 'GET' && req.url.startsWith('/songs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const songId = urlParts[2];
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(songs[songId]));
      }
    }

    // // 15
    if (req.method === 'POST' && req.url.startsWith('/albums/') && req.url.endsWith('/songs')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 4) {
        const albumId = urlParts[2];
        const songId = getNewSongId();
        const newSong = {
          songId: songId,
          name: req.body.name,
          trackNumber: req.body.trackNumber,
          albumId: albumId,
          lyrics: req.body.lyrics
        }
        songs[songId] = newSong;
        console.log(songs)
        res.statusCode = 201;
        res.setHeader('Content-Type','application/json');
        return res.end(JSON.stringify(newSong));
      }
    }

    // // 16
    if ((req.method === 'PUT' || req.method === 'POST') && req.url.startsWith('/songs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const songId = urlParts[2];
        const song = songs[songId];
        if (req.body.name) song.name = req.body.name;
        if (req.body.trackNumber) song.trackNumber = req.body.trackNumber;
        if (req.body.lyrics) song.lyrics = req.body.lyrics;
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        return res.end(JSON.stringify(song));
      }
    }

    // // 17
    if (req.method === 'DELETE' && req.url.startsWith('/songs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const songId = urlParts[2];
        delete songs[songId];
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        return res.end("Successfully deleted");
      }
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end();
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => console.log('Server is listening on port', port));
