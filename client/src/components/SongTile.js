import React, {Component} from 'react';
import {Card} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faPlay } from '@fortawesome/free-solid-svg-icons';


class SongTile extends Component {

    render () {
        return (
            <Card id="songCard" className="text-center" border="light" bg="info" text="light">
                <Card.Img variant="top" src={this.props.coverArt}/>
                <Card.Body>
                    <Card.Text>
                        <h5 id="songTitle">{this.props.name}</h5>
                            <h6 id="artists">{this.props.artists}</h6>
                    </Card.Text>
                </Card.Body>
                <Card.Footer>
                    <div className="d-flex align-items-center justify-content-between">
                        <a href={this.props.preview} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faPlay} className="playIcon"/>   
                        </a>
                        <h6>{this.props.duration}</h6>
                        <a href={this.props.spotifyLink} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faSpotify} className="spotifyIcon"/>   
                        </a>
                    </div>
                </Card.Footer>
            </Card>
        )
    }
}

export default SongTile;