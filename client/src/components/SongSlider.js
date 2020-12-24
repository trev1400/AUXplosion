import React, {Component} from 'react';
import GliderComponent from 'react-glider-carousel';
import SongTile from '../components/SongTile';
import '../glider.css';

class SongSlider extends Component {

    millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    render () {
        var songs = this.props.songs;
        var artists = "";
        var songTiles = [];
        var numSongs = Object.keys(songs.tracks).length

        // Parse individual song information to create song tiles for slider
        for (var i = 0; i < numSongs; i++) {
            var currSong = songs.tracks[i];
            var numArtists = Object.keys(currSong.artists).length;

            // If more than one artist, create multiple artists string
            if (numArtists > 1){
                for (var a=0; a<numArtists; a++) {
                    artists += currSong.artists[a].name;
                    if (a !== numArtists-1) {
                        artists += ", ";
                    }
                }
            } 
            // Otherwise, just append the one artist name
            else { artists = currSong.artists[0].name; }
            songTiles.push(
            <SongTile 
                key={i} 
                name={currSong.name}
                artists={artists}
                coverArt = {currSong.album.images[0].url}
                preview = {currSong.preview_url}
                spotifyLink = {currSong.external_urls.spotify}
                duration = {this.millisToMinutesAndSeconds(currSong.duration_ms)}
            />
            );
            // Reset artists string for next song
            artists = "";
        }
        return (
            <GliderComponent
                hasArrows={true}
                hasDots={true}
                settings={{
                    slidesToShow: 1,
                    scrollLock: true
                }}
            >
                {songTiles.map((tile, index) => <div key={index}>{tile}</div>)}
            </GliderComponent>
        )
    }
}

export default SongSlider;