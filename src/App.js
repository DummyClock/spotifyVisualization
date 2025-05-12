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
      dropdown_scatter: ["Danceability","Valence","Energy","Acousticness","Instrumentalness","Liveness","Speechiness"],
      x1: "",
      y1: "",
      x2: "",
      y2: "",
      data: [],
      filtered_data: []
    };
  }

  handleDataUpload = (headers, csv_data) => {
    this.setState({ headers });
    this.setState({ data: csv_data });
    this.slider(csv_data)
  };  

  componentDidMount() {
    // should remove eventually from mounting
    //this.slider()
  }

  componentDidUpdate() {
    //this.scatter()
  }

  slider(csv_data){
    var data = this.state.data;
    if(data.length === 0) {data = csv_data};
    // Draw Gridlines
    //d3.select(".y-axis").selectAll(".tick line").attr("x1", innerWidth).attr("stroke-dasharray", "2,2").attr("stroke", "lightgray");
    //d3.select(".x-axis").selectAll(".tick line").attr("y1", -innerHeight).attr("stroke-dasharray", "2,2").attr("stroke", "lightgray");
    var min_year = d3.min(data, d => d.Year)
    var max_year = d3.max(data, d => d.Year)
    // Define a year slider
    const sliderRange = sliderBottom()
      .min(min_year)
      .max(max_year)
      .step(1)
      .width(300)
      .ticks((max_year - min_year) / 10)
      .tickFormat(d3.format(""))
      .default([max_year, min_year])
      //.displayValue(false)
      .fill('#85bb65')
      .on('onchange', val => {
        const f_data = this.state.data.filter(d =>
          d.Year >= val[0] && d.Year <= val[1]
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

  scatter(x1, y1) {
    // const data = this.state.filtered_data;
    const data = this.state.data;
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

    
  }
  

  // Handle interactive selections for scatterplot
  pick_xValue_4Scatterplot = (event) => {
    this.setState({ x1: event.target.value })
    if(this.state.y1 !== ""){this.scatter(event.target.value, this.state.y1)}
  }
  pick_yValue_4Scatterplot = (event) => {
    this.setState({ y1: event.target.value })
    if(this.state.x1 !== ""){this.scatter(this.state.x1, event.target.value)}
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



