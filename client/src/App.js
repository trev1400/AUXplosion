import React, {Component} from 'react';
import SongSlider from './components/SongSlider';
import {ReactComponent as AUXplosionLogo} from './images/logo.svg';
import {Button, InputGroup, FormControl, Container, Row, Col, Alert} from 'react-bootstrap';

var axios = require('axios');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token:"",
      loginToken: "",
      loggedIn: false,
      isLoaded: false,
      displayName: "",
      userID: "",
      songs:[],
      hasSongs: false,
      inputSong: "",
      numSongs: 0,
      numSongsInput: "",
      songLinkInput: "", 
      playlistID: "",
      uris: [],
      playlistAdded: false,
      hasInputError: false,
      alertMessage: "",
      width: 0,
      height: 0,
    };

    this.generateSongs = this.generateSongs.bind(this);
    this.getUserID = this.getUserID.bind(this);
    this.generatePlaylist = this.generatePlaylist.bind(this);
    this.populatePlaylist = this.populatePlaylist.bind(this);
    this.generateToken = this.generateToken.bind(this);
    this.resetComponents = this.resetComponents.bind(this);
    this.resetAlert = this.resetAlert.bind(this);
    this.getRecommendations = this.getRecommendations.bind(this);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  componentDidMount() {
    this.generateToken();
    // Refresh access token every hour in accordance with Spotify API expiration length
    var tokenRefreshInterval = setInterval(this.generateToken, 3600000);
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);

    var url = window.location.search;
    if (url.length > 0) {
      this.setState({
        loggedIn: true,
        loginToken: url.split("?token=")[1]
      });
    }
  }

  componentDidUpdate() {
    if (this.state.width <= 576 && !this.state.hasSongs && (window.innerHeight < document.getElementById('html').scrollHeight)) {
      document.getElementById('html').style.height = 'auto';
    } else {
      if (this.state.width <= 576 && this.state.hasSongs) {
        document.getElementById('html').style.height = 'auto';
      }
      if (this.state.width > 576 || !this.state.hasSongs) {
        document.getElementById('html').style.height = '100%';
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  resetComponents() {
    this.setState({
      songs: [],
      hasSongs: false,
      inputSong: "",
      numSongs: 0,
      numSongsInput: "",
      songLinkInput: "",
      playlistID: "",
      uris: [],
      playlistAdded: false
    })
  }

  resetAlert() {
    this.setState({
      hasInputError: false,
      alertMessage: ""
    })
  }

  handleNumberChange(event) {
    let inputVal = event.target.value;
    this.setState({ 
      numSongs: inputVal,
      numSongsInput: inputVal
    });
  }

  handleSongChange(event) {
    let inputVal = event.target.value;
    this.setState({ 
      inputSong: inputVal,
      songLinkInput: inputVal 
    });
  }

  getUserID() {
    if (this.state.userID.length === 0) {
      axios ({
        url: 'https://api.spotify.com/v1/me',
        method: 'get',
        headers: {
          'Authorization': 'Bearer ' + this.state.loginToken
        }
      })
      .then(res => {
        if (res.status === 200 && res.data) {
          this.setState({ 
            userID: res.data.id,
            displayName: res.data.display_name 
          });
          this.generatePlaylist();
        }
      })
    } else {
      this.generatePlaylist();
    }
  }
 
  generatePlaylist() {
    axios ({
      url: `https://api.spotify.com/v1/users/${this.state.userID}/playlists`,
      method: 'post',
      data: {
        name: `AUXplosion: Custom Playlist for ${this.state.displayName}!`
      },
      headers: {
        'Authorization': 'Bearer ' + this.state.loginToken,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.data) {
        this.setState({ 
          playlistID: res.data.id,
          playlistAdded: true 
        });
        this.populatePlaylist();
      }
    })
  }

  populatePlaylist() {
    axios ({
      url: `https://api.spotify.com/v1/playlists/${this.state.playlistID}/tracks`,
      method: 'post',
      data: {
        uris: this.state.uris
      },
      headers: {
        'Authorization': 'Bearer ' + this.state.loginToken,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      console.log(res.data);
    })
  }
 
  generateSongs() {
    // Regex number check
    const re = /^[0-9\b]+$/;

    // Only allow submission if numSongs is a number
    if (!re.test(this.state.numSongs)) {
      this.setState({
        hasInputError: true,
        alertMessage: "# of songs to be generated must be a number!"
      });
      this.resetComponents();
    } 
    // Only allow submission if numSongs is less than or equal to 50
    else if (this.state.numSongs > 50){
      this.setState({
        hasInputError: true,
        alertMessage: "The limit on the # of songs to be generated is 50!"
      });
      this.resetComponents();
    } else {
      this.getRecommendations();
    }
  }

  getRecommendations() {
    // Parse input for song URI
    var seed_track = this.state.inputSong.substring(
      this.state.inputSong.lastIndexOf("/") + 1, 
      this.state.inputSong.lastIndexOf("?")
    );
    axios ({
      url: 'https://api.spotify.com/v1/recommendations',
      method: 'get',
      params: {
        limit: this.state.numSongs,
        seed_tracks: seed_track
      },
      headers: {
        'Authorization': 'Bearer ' + this.state.token
      }
    })
    .then(res => {
      const songs = res.data;
      const uris = songs.tracks.map(song => song.uri);
      this.setState({ 
        songs: songs,
        uris: uris 
      });
      if (Object.keys(songs.tracks).length !== 0) {
        this.setState({ hasSongs: true,})
      } else {
        this.setState({
          hasInputError: true,
          alertMessage: 'No results found. Ensure that you are copying song links as opposed to artist links.'
        });
        this.resetComponents();
      }
      console.log(this.state.songs);
    })
    .catch(error => {
      this.setState({
        hasInputError: true,
        alertMessage: 'Please check your song link. It should begin with: "https://open.spotify.com/track/"'
      });
      this.resetComponents();
    })
  }

  generateToken() {
    fetch("https://auxplosion.herokuapp.com/getToken")
    .then(res => res.json())
    .then((res) => {
      this.setState({ isLoaded: true, token: res.access_token });
      },
      (error) => {
        this.setState({ isLoaded: true,error})
      }
    )
  }
 
  render () {
    const {songs, loggedIn, hasSongs, numSongsInput, songLinkInput, playlistAdded, hasInputError, alertMessage, width} = this.state;
    let rightColContent;
    if (hasSongs) {
      // If we have songs, render SongSlider
      rightColContent = <SongSlider songs= {songs}/>;
    } else {
      // Render input form until we have songs
      rightColContent = 
      <div className={`${!hasSongs && width <= 576 ? "noSongsAlign" : ""}`}>
        <InputGroup size="sm" className="mb-3">
          <FormControl
            value = {numSongsInput}
            placeholder="Enter # of songs to be generated"
            aria-label="Enter # of songs to be generated" 
            aria-describedby="inputGroup-sizing-sm" 
            onChange={this.handleNumberChange.bind(this)}
          />
        </InputGroup>
        <InputGroup className="mb-3">
          <FormControl
            value = {songLinkInput}
            placeholder="Enter song link"
            aria-label="Enter song link"
            aria-describedby="basic-addon2"
            onChange={this.handleSongChange.bind(this)}
          />
          <InputGroup.Append>
            <Button variant="info" onClick={this.generateSongs}>Generate Songs</Button>
          </InputGroup.Append>
        </InputGroup>
        { hasInputError && 
          <Alert variant='danger' className="small customAlert">
            {alertMessage}
            <hr className="alertDivider"/>
            <div className="d-flex justify-content-end">
              <Button onClick={this.resetAlert} variant="outline-danger" className="alertButton"> Close </Button>
            </div>
          </Alert>
        }
        <h6 id="subheader" className="text-light">1. Choose the # of songs you would like to generate. Limit is 50.</h6>
        <h6 id="subheader" className="text-light">2. Navigate to Spotify and find a song you would like to generate recommendations for.</h6>
        <h6 id="subheader" className="text-light">3. Click the three dots symbol and then navigate to the Share section.</h6>
        <h6 id="subheader" className="text-light">4. Copy the song's link, paste, and generate!</h6>
        <h6 id="subheader" className="text-light">5. (Optional) Login to Spotify to add recommendations as playlists.</h6>
      </div>;
    }
      return (
        <div className="App">
          <Container fluid className="h-100">
            <Row className="h-100 align-items-center">
              <Col id="mainText" className={`${width <= 576 ? "text-center border-bottom border-light py-3" : "text-center border-right border-light py-3"}`}>
                <h1 id="title" className="text-light display-4">AUXplosion</h1>
                <h5 id="subheader" className="text-light">A song recommendation generator</h5>
                <AUXplosionLogo id="logo"/>
                <br/>
                {(!loggedIn && !hasSongs) && 
                  <Button className="mt-3" variant="info" href="https://auxplosion.herokuapp.com/login">Login to Spotify</Button>
                }
                {(hasSongs && loggedIn && !playlistAdded) &&
                  <Button className="mt-3" variant="info" onClick={this.getUserID}>Add As Playlist</Button>
                }
                <br/>
                {hasSongs &&
                  <Button className="my-3" variant="info" onClick={this.resetComponents}>AUXplode Again!</Button>
                }
              </Col>
              <Col sm={true} className={`${width <= 576 && hasSongs ? "my-3 px-5" : "px-4"}`}>
                {rightColContent}
              </Col>
            </Row>
          </Container>
        </div>
      );
  }
}

export default App;
