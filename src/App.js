import React, { Component, useState } from 'react';
import FileUpload from './FileUpload';
import { sliderBottom } from 'd3-simple-slider';
import * as d3 from 'd3';
import './App.css';

// Global Dimensions & margins
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    innerWidth = 460 - margin.left - margin.right,
    innerHeight = 400 - margin.top - margin.bottom;

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: ["track_name","artist(s)_name","artist_count","released_year","released_month","released_day","in_spotify_playlists","in_spotify_charts","streams","in_apple_playlists","in_apple_charts","in_deezer_playlists","in_deezer_charts","in_shazam_charts","bpm","key","mode","danceability_%","valence_%","energy_%","acousticness_%","instrumentalness_%","liveness_%","speechiness_%","cover_url"],
      dropdown_scatter: ["bpm","danceability_%","valence_%","energy_%","acousticness_%","instrumentalness_%","liveness_%","speechiness_%"],
      x1: "",
      y1: "",
      x2: "",
      y2: "",
      filtered_data: [
      {
        track_name: "Seven (feat. Latto) (Explicit Ver.)", artist_s_name: "Latto, Jung Kook", artist_count: 2,
        released_year: 2023, released_month: 7, released_day: 14, in_spotify_playlists: 553,
        in_spotify_charts: 147, streams: 141381703, in_apple_playlists: 43, in_apple_charts: 263,
        in_deezer_playlists: 45, in_deezer_charts: 10, in_shazam_charts: 826, bpm: 125, key: "B", mode: "Major",
        "danceability_%": 80, "valence_%": 89, "energy_%": 83, "acousticness_%": 31, "instrumentalness_%": 0,
        "liveness_%": 8, "speechiness_%": 4, cover_url: "Not Found"
      },
      {
        track_name: "LALA", artist_s_name: "Myke Towers", artist_count: 1, released_year: 2023, released_month: 3,
        released_day: 23, in_spotify_playlists: 1474, in_spotify_charts: 48, streams: 133716286,
        in_apple_playlists: 48, in_apple_charts: 126, in_deezer_playlists: 58, in_deezer_charts: 14,
        in_shazam_charts: 382, bpm: 92, key: "C#", mode: "Major", "danceability_%": 71, "valence_%": 61,
        "energy_%": 74, "acousticness_%": 7, "instrumentalness_%": 0, "liveness_%": 10, "speechiness_%": 4,
        cover_url: "https://i.scdn.co/image/ab67616d0000b2730656d5ce813ca3cc4b677e05"
      },
      {
        track_name: "vampire", artist_s_name: "Olivia Rodrigo", artist_count: 1, released_year: 2023, released_month: 6,
        released_day: 30, in_spotify_playlists: 1397, in_spotify_charts: 113, streams: 140003974,
        in_apple_playlists: 94, in_apple_charts: 207, in_deezer_playlists: 91, in_deezer_charts: 14,
        in_shazam_charts: 949, bpm: 138, key: "F", mode: "Major", "danceability_%": 51, "valence_%": 32,
        "energy_%": 53, "acousticness_%": 17, "instrumentalness_%": 0, "liveness_%": 31, "speechiness_%": 6,
        cover_url: "https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d"
      },
      {
        track_name: "Cruel Summer", artist_s_name: "Taylor Swift", artist_count: 1, released_year: 2019, released_month: 8,
        released_day: 23, in_spotify_playlists: 7858, in_spotify_charts: 100, streams: 800840817,
        in_apple_playlists: 116, in_apple_charts: 207, in_deezer_playlists: 125, in_deezer_charts: 12,
        in_shazam_charts: 548, bpm: 170, key: "A", mode: "Major", "danceability_%": 55, "valence_%": 58,
        "energy_%": 72, "acousticness_%": 11, "instrumentalness_%": 0, "liveness_%": 11, "speechiness_%": 15,
        cover_url: "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647"
      },
      {
        track_name: "WHERE SHE GOES", artist_s_name: "Bad Bunny", artist_count: 1, released_year: 2023, released_month: 5,
        released_day: 18, in_spotify_playlists: 3133, in_spotify_charts: 50, streams: 303236322,
        in_apple_playlists: 84, in_apple_charts: 133, in_deezer_playlists: 87, in_deezer_charts: 15,
        in_shazam_charts: 425, bpm: 144, key: "A", mode: "Minor", "danceability_%": 65, "valence_%": 23,
        "energy_%": 80, "acousticness_%": 14, "instrumentalness_%": 63, "liveness_%": 11, "speechiness_%": 6,
        cover_url: "https://i.scdn.co/image/ab67616d0000b273ab5c9cd818ad6ed3e9b79cd1"
      }
    ],
    original_data: [
      {
        track_name: "Seven (feat. Latto) (Explicit Ver.)", artist_s_name: "Latto, Jung Kook", artist_count: 2,
        released_year: 2023, released_month: 7, released_day: 14, in_spotify_playlists: 553,
        in_spotify_charts: 147, streams: 141381703, in_apple_playlists: 43, in_apple_charts: 263,
        in_deezer_playlists: 45, in_deezer_charts: 10, in_shazam_charts: 826, bpm: 125, key: "B", mode: "Major",
        "danceability_%": 80, "valence_%": 89, "energy_%": 83, "acousticness_%": 31, "instrumentalness_%": 0,
        "liveness_%": 8, "speechiness_%": 4, cover_url: "Not Found"
      },
      {
        track_name: "LALA", artist_s_name: "Myke Towers", artist_count: 1, released_year: 2023, released_month: 3,
        released_day: 23, in_spotify_playlists: 1474, in_spotify_charts: 48, streams: 133716286,
        in_apple_playlists: 48, in_apple_charts: 126, in_deezer_playlists: 58, in_deezer_charts: 14,
        in_shazam_charts: 382, bpm: 92, key: "C#", mode: "Major", "danceability_%": 71, "valence_%": 61,
        "energy_%": 74, "acousticness_%": 7, "instrumentalness_%": 0, "liveness_%": 10, "speechiness_%": 4,
        cover_url: "https://i.scdn.co/image/ab67616d0000b2730656d5ce813ca3cc4b677e05"
      },
      {
        track_name: "vampire", artist_s_name: "Olivia Rodrigo", artist_count: 1, released_year: 2023, released_month: 6,
        released_day: 30, in_spotify_playlists: 1397, in_spotify_charts: 113, streams: 140003974,
        in_apple_playlists: 94, in_apple_charts: 207, in_deezer_playlists: 91, in_deezer_charts: 14,
        in_shazam_charts: 949, bpm: 138, key: "F", mode: "Major", "danceability_%": 51, "valence_%": 32,
        "energy_%": 53, "acousticness_%": 17, "instrumentalness_%": 0, "liveness_%": 31, "speechiness_%": 6,
        cover_url: "https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d"
      },
      {
        track_name: "Cruel Summer", artist_s_name: "Taylor Swift", artist_count: 1, released_year: 2019, released_month: 8,
        released_day: 23, in_spotify_playlists: 7858, in_spotify_charts: 100, streams: 800840817,
        in_apple_playlists: 116, in_apple_charts: 207, in_deezer_playlists: 125, in_deezer_charts: 12,
        in_shazam_charts: 548, bpm: 170, key: "A", mode: "Major", "danceability_%": 55, "valence_%": 58,
        "energy_%": 72, "acousticness_%": 11, "instrumentalness_%": 0, "liveness_%": 11, "speechiness_%": 15,
        cover_url: "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647"
      },
      {
        track_name: "WHERE SHE GOES", artist_s_name: "Bad Bunny", artist_count: 1, released_year: 2023, released_month: 5,
        released_day: 18, in_spotify_playlists: 3133, in_spotify_charts: 50, streams: 303236322,
        in_apple_playlists: 84, in_apple_charts: 133, in_deezer_playlists: 87, in_deezer_charts: 15,
        in_shazam_charts: 425, bpm: 144, key: "A", mode: "Minor", "danceability_%": 65, "valence_%": 23,
        "energy_%": 80, "acousticness_%": 14, "instrumentalness_%": 63, "liveness_%": 11, "speechiness_%": 6,
        cover_url: "https://i.scdn.co/image/ab67616d0000b273ab5c9cd818ad6ed3e9b79cd1"
      }
    ],
    };
  }

  handleDataUpload = (headers) => {
    this.setState({ headers });
  };  

  componentDidMount() {
    // should remove eventually from mounting
    this.scatter()
  }

  componentDidUpdate() {
    this.scatter()
  }

  scatter() {
    const data = this.state.filtered_data;
    const { x1, y1 } = this.state;
    console.log(x1, y1)
    
    // Append canvas
    var svg = d3.select('.scatterplot')
      .attr("width", innerWidth + margin.left + margin.right)
      .attr("height", innerHeight + margin.top + margin.bottom + margin.bottom/6) 
    var innerChart = svg.selectAll(".inner_chart")
      .data([null])
      .join("g")
      .attr("class", "inner_chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    

    // X-axis + Y-axis
    const xValues = data.map(d => d[x1]);
    const yValues = data.map(d => d[y1]);

    const xPadding = 0.05 * d3.max(xValues);
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(xValues) + xPadding])
      .range([0, innerWidth]);

    const yPadding = 0.05 * d3.max(yValues); 
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(yValues) + yPadding])
      .range([innerHeight, 0]); // Invert range for correct orientation

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    innerChart.selectAll(".x-axis").data([null]) 
      .join("g").attr('class','x-axis') 
      .attr("transform", `translate(0, ${innerHeight})`)  
      .call(xAxis);
    innerChart.selectAll(".y-axis").data([null]) 
      .join("g").attr('class','y-axis') 
      .call(yAxis);

    // Add labels for the axis lines
    innerChart.selectAll(".x-axis-label")
      .data([null])
      .join("text")
      .attr("class", "x-axis-label")
      .attr("x", innerWidth / 2) 
      .attr("y", innerHeight + margin.bottom ) 
      .attr("text-anchor", "middle") 
      .text(x1);
    innerChart.selectAll(".y-axis-label")
      .data([null])
      .join("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)") 
      .attr("x", -innerHeight / 2)
      .attr("y", -margin.left / 1.5)
      .attr("text-anchor", "middle")  
      .text(y1);

    // If dropdowns have selections, Populate canvas w/ data
    if(x1 && y1){
    innerChart.selectAll("circle").data(data).join("circle").attr("r", 5)
      .attr("fill", "gray")
      .attr("cx", d => xScale(d[x1]))
      .attr("cy", d => yScale(d[y1]))
    }

    // Draw Gridlines
    //d3.select(".y-axis").selectAll(".tick line").attr("x1", innerWidth).attr("stroke-dasharray", "2,2").attr("stroke", "lightgray");
    //d3.select(".x-axis").selectAll(".tick line").attr("y1", -innerHeight).attr("stroke-dasharray", "2,2").attr("stroke", "lightgray");
  
    // Define a year slider
    const sliderRange = sliderBottom()
      .min(d3.min(data, d => d.released_year))
      .max(d3.max(data, d => d.released_year))
      .step(1)
      .width(300)
      .ticks(data.length)
      .tickFormat(d3.format(""))
      .default([
        d3.min(data, d => d.released_year),
        d3.max(data, d => d.released_year)
      ])
      .fill('#85bb65')
      .on('onchange', val => {
        const f_data = this.state.original_data.filter(d =>
          d.released_year >= val[0] && d.released_year <= val[1]
        );
        this.setState({ filtered_data: f_data });
      });
  
    // Add slider to page
    const gRange = d3.select('.slider-year')
      .attr('width', 500)
      .attr('height', 100)
      .selectAll('.slider-g')
      .data([null])
      .join('g')
      .attr('class', 'slider-g')
      .attr('transform', 'translate(90,30)');
    gRange.call(sliderRange);
  }
  

  // Handle interactive selections for scatterplot
  pick_xValue_4Scatterplot = (event) => {
    this.setState({ x1: event.target.value })
  }
  pick_yValue_4Scatterplot = (event) => {
    this.setState({ y1: event.target.value })
  }

  // Handle interactive selections for Stacked Bar Chart
  pick_xValue_4Stacked = (event) => {
    this.setState({ x1:event.target.value })
  }
  pick_yValue_4Stacked = (event) => {
    this.setState({ y1: event.target.value })
  }

  render = () => {
    const { dropdown_scatter } = this.state

    return (
      <div className="dashboard">
        <FileUpload onDataUpload={this.handleDataUpload} />

        <div id='left-visual'>
          {/** Y dropdown (Scatter) */}
          <select name="y-attr-scatter" id="y-attr-scatter" onChange={this.pick_yValue_4Scatterplot}>
          <option disabled selected value> -- select an option -- </option>
            {dropdown_scatter.map((attr, index) => (
                <option key={index} value={attr.toLowerCase()}  disabled={this.state.x1 === attr.toLowerCase()}>
                  {attr}
                </option>
            ))}
          </select> 

          {/** Scatterplot + slider in here */}
          <g>
            <svg className='scatterplot' >
              <g className='inner_chart' />
            </svg>
            <svg className='slider-year'></svg>
          </g>

          {/** X dropdown (Scatter) */}
          <select name="x-attr-scatter" id="x-attr-scatter" onChange={this.pick_xValue_4Scatterplot}>
          <option disabled selected value> -- select an option -- </option>
            {dropdown_scatter.map((attr, index) => (
                <option key={index} value={attr.toLowerCase()} disabled={this.state.y1 === attr.toLowerCase()}>
                  {attr}
                </option>
            ))}
          </select> 
        </div>
        {/** ------------------------------------------------------ */}
        {/** Will use later 
          <div id='left-visual'>
                    {/** X dropdown (stacked) }
                    <select name="x-attr-stacked" id="x-attr-stacked" onChange={this.pick_xValue_4Stacked}>
                      {dropdown_scatter.map((attr, index) => (
                          <option key={index} value={attr.toLowerCase()}>
                            {attr}
                          </option>
                      ))}
                    </select> 

                    {/** Stacked Bar Chart  in here }
                  <svg className='stackedBar'></svg>
                  <svg className='stream-slider'></svg>

                    {/** Y dropdown (stacked) }
                    <select name="x-attr-stacked" id="x-attr-stacked" onChange={this.pick_yValue_4Stacked}>
                      {dropdown_scatter.map((attr, index) => (
                          <option key={index} value={attr.toLowerCase()}>
                            {attr}
                          </option>
                      ))}
                    </select> 
                  </div>
          */}

      </div>
    );
  }
}

export default Dashboard;



