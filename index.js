const express = require('express');
const path = require('path');
var axios = require('axios');
var cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

var redirect_uri = 'http://localhost:9000/callback';
var querystring = require('querystring');
var clientID = 'f47f9dc2639f4c1aa825d3d6da135e12';
var scope = 'playlist-modify-public';

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/getToken', function(req, res, next) {
    axios({
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        params: {
          grant_type: 'client_credentials'
        },
        headers: {
          'Accept':'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: 'f47f9dc2639f4c1aa825d3d6da135e12',
          password: '59d8e3f1b9234d028026bde2552a40cd'
        }
      }).then(function(response) {
          res.send(response.data);
      }).catch(function(error) {
      });
});

app.get('/login', function(req, res, next) {
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: clientID,
        scope: scope,
        redirect_uri: redirect_uri
    }));
});

app.get('/callback', function(req, res, next) {

    axios({
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        params: {
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: redirect_uri
        },
        headers: {
          'Accept':'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: 'f47f9dc2639f4c1aa825d3d6da135e12',
          password: '59d8e3f1b9234d028026bde2552a40cd'
        }
      })
      .then(response => {
        let token = response.data.access_token;
        res.redirect(`http://localhost:3000/?token=${token}`)
      });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 9000;
app.listen(port);
