import React, { Component } from 'react';
import * as d3 from 'd3';

class FileUpload extends Component {
  state = { file: null };

  handleFileSubmit = (e) => {
    e.preventDefault(); // Prevent form from actually submitting
    if (this.state.file) { // Check if a file has been uploaded
      const reader = new FileReader(); // Create a new FileReader object
      reader.onload = (e) => { // Define the onload event handler
        const csvText = e.target.result; // Get the CSV text from the file
        const blob = new Blob([csvText], { type: 'text/csv' }); // Create a Blob from the CSV text
        const url = URL.createObjectURL(blob); // Create a URL for the Blob

        d3.csv(url).then((data) => { // Use d3.csv to parse the CSV data (asynchronously)
          const formattedData = data.map(d => ({ // Format the data
            "TrackName": d["track_name"],
            "ArtistName": d["artist(s)_name"],
            "Year": parseInt(d["released_year"]),
            "Streams": parseInt(d["streams"]),
            "ChartPresence": parseInt(d["in_spotify_charts"]),
            "Danceability": parseInt(d["danceability_%"]),
            "Valence":parseInt(d["valence_%"]),
            "Energy":parseInt(d["energy_%"]),
            "Acousticness":parseInt(d["acousticness_%"]),
            "Instrumentalness":parseInt(d["instrumentalness_%"]),
            "Liveness":parseInt(d["liveness_%"]),
            "Speechiness":parseInt(d["speechiness_%"]),
          }));
          this.props.onDataUpload(formattedData); // Pass the formatted data to the parent component
          URL.revokeObjectURL(url); // Release the Blob URL to prevent memory leaks
        }).catch(console.error); // Handle any errors during CSV parsing
      };
      reader.readAsText(this.state.file); // Read the selected file as text
    }
  };

  render = () => (
    <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
      <h2>Spotify Music Attribute Visualization</h2>
      <h3>Upload a csv file</h3><p></p>
      <form onSubmit={this.handleFileSubmit}>
        <input type="file" accept=".csv" onChange={(e) => this.setState({ file: e.target.files[0] })} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default FileUpload;