import React, { Component, useState } from 'react';
import FileUpload from './FileUpload';
import './App.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: ["track_name","artist(s)_name","artist_count","released_year","released_month","released_day","in_spotify_playlists","in_spotify_charts","streams","in_apple_playlists","in_apple_charts","in_deezer_playlists","in_deezer_charts","in_shazam_charts","bpm","key","mode","danceability_%","valence_%","energy_%","acousticness_%","instrumentalness_%","liveness_%","speechiness_%","cover_url"],
      dropdown_scatter: ["bpm","danceability_%","valence_%","energy_%","acousticness_%","instrumentalness_%","liveness_%","speechiness_%"],
      x1: "",
      y1: "",
    };
  }

  handleDataUpload = (headers) => {
    this.setState({ headers });
  };  

  componentDidMount() {

  }

  componentDidUpdate() {

    // Placeholder data (currently doesn't run)
    const data = []
    //const headers = ["track_name","artist(s)_name","artist_count","released_year","released_month","released_day","in_spotify_playlists","in_spotify_charts","streams","in_apple_playlists","in_apple_charts","in_deezer_playlists","in_deezer_charts","in_shazam_charts","bpm","key","mode","danceability_%","valence_%","energy_%","acousticness_%","instrumentalness_%","liveness_%","speechiness_%","cover_url"];
    //this.setState({ headers })

    // When data is present, run the following (will implement later)

    let necessaryData = this.dataFilter(data, )
  }

  // Takes in some data, and filters it out based on what values where in the dropdowns & slider
  dataFilter(data) {

  }

  // Handle interactive selections for scatterplot
  pick_xValue_4Scatterplot = (event) => {
    this.setState(event.target.value)
  }
  pick_yValue_4Scatterplot = (event) => {
    this.setState(event.target.value)
  }

  render = () => {
    const { dropdown_scatter } = this.state

    return (
      <div className="dashboard">
        <FileUpload onDataUpload={this.handleDataUpload} />

        {/** X dropdown */}
        <select name="x-attr-scatter" id="x-attr-scatter" onChange={this.pick_xValue_4Scatterplot}>
          {dropdown_scatter.map((attr, index) => (
              <option key={index} value={attr.toLowerCase()}>
                {attr}
              </option>
          ))}
        </select> 

        {/** Y dropdown */}
        <select name="x-attr-scatter" id="x-attr-scatter" onChange={this.pick_xValue_4Scatterplot}>
          {dropdown_scatter.map((attr, index) => (
              <option key={index} value={attr.toLowerCase()}>
                {attr}
              </option>
          ))}
        </select> 

        {/** Scatterplot & Stacked Bar Chart Go in here */}
        <svg className='visualizer'></svg>
      </div>
    );
  }
}

export default Dashboard;
