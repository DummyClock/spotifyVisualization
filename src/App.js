import React, { Component, useState } from 'react';
import FileUpload from './FileUpload';
import { sliderBottom } from 'd3-simple-slider';
import * as d3 from 'd3';
import './App.css';
import Select from 'react-select';

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
      dropdown_stacked: ["Danceability","Valence","Energy","Acousticness","Instrumentalness","Liveness","Speechiness"].map(item => ({ value: item, label: item })),
      x1: "",
      y1: "",
      x2: "",
      y2: "",
      data: [],
      scatter_filtered_data: [],
      bar_filtered_data: []
    };
  }


  handleDataUpload = (headers, csv_data) => {
    this.setState({ headers });
    this.setState({ data: csv_data });
    this.setState({ scatter_filtered_data : csv_data})
    this.slider(csv_data)
  };  

  componentDidMount() {
    // should remove eventually from mounting
    //this.slider()
  }

  componentDidUpdate() {
    //this.scatter()
    //console.log(this.state.bar_filtered_data)
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
        this.setState({ scatter_filtered_data: f_data });
        if(this.state.x1 !== "" && this.state.y1 !== "") {
          this.scatter(this.state.x1, this.state.y1)
        }
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
    const data = this.state.scatter_filtered_data;
    
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
      .attr('fill', d => {
        var selected_songs = this.state.bar_filtered_data.map(item => item["TrackName"])
        if( selected_songs.includes(d["TrackName"]) ) {
          return 'red';
        }
        return 'gray';
      })
      .attr("cx", d => xScale(d[x1]))
      .attr("cy", d => yScale(d[y1]))
    }
  }


    stack() {
      // const data = this.state.brushData;
      const brushData = [
        { "track_name": "Song A", "artist(s)_name": "Artist 1", "Danceability": 70, "Valence": 60, "Energy": 80 },
        { "track_name": "Song B", "artist(s)_name": "Artist 2", "Danceability": 65, "Valence": 55, "Energy": 75 },
        { "track_name": "Song C", "artist(s)_name": "Artist 3", "Danceability": 80, "Valence": 70, "Energy": 90 },
        { "track_name": "Song D", "artist(s)_name": "Artist 4", "Danceability": 75, "Valence": 65, "Energy": 85 }
      ];
      //this.setState({brushData: brushData})

      // Get selected categories
      const selectedAttr = this.state.y2.map(attr => attr.value)

      // Create SVG
      const svg = d3.select('.stackedChart')
        .attr("width", innerWidth + margin.left + margin.right)
        .attr("height", innerHeight + margin.top + margin.bottom + margin.bottom / 6);

      const innerChart = svg.append("g")
        .attr("class", "stacked_inner_chart")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Scales & Axis
      var xScale = d3.scaleBand()
        .domain(selectedAttr)
        .range([0, innerWidth])
        .padding(0.2);

      var yScale = d3.scaleLinear()
        .domain([0, d3.max(selectedAttr, d =>
          d3.sum(stackedSelections.map(key => d[key]))
        )])
        .range([innerHeight, 0]);

      var colorScale = d3.scaleOrdinal().domain(selectedAttr).range(["red", "green", "orange", "yellow", "blue", "purple", "brown"])


      var stackGen = d3.stack().keys(selectedAttr),
        stackedSeries = stackGen(data);

      // Draw rectangles (Not done, from class)
      d3.selectAll(".container")
        .selectAll(".mychart")
        .data(stackedSeries)
        .join("g")
        .attr("class",'mychart')
        .attr("add_bars", function(d){
          d3.select(this).selectAll("rect")
          .data(d).join("rect")
          .attr("x",d=>xScale(d.data.month))
          .attr("y",d=>yScale(d[1])).attr("height", d=> yScale(d[0])-yScale(d[1]))
          .attr("width",xScale.bandwidth()).attr("fill",colorScale(d.key))
        })

        d3.select(".x-axis").attr("transform", "translate(0, 275)").call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));
        d3.select(".y-axis").attr("transform", "translate(50, 0)").call(d3.axisLeft(yScale).ticks(5));
    }
    

    

    var brush = d3.brush().on('start brush', (e) => {
      var filtered_data = this.state.scatter_filtered_data.filter(point => {
        var x = xScale(point[x1]) + margin.left
        var y = yScale(point[y1]) + margin.top
        return x >= e.selection[0][0] && x <= e.selection[1][0] && y >= e.selection[0][1] && y <= e.selection[1][1]
      });
      this.scatter(this.state.x1, this.state.y1)
      this.setState({bar_filtered_data : filtered_data})
    });
  
    d3.select('svg').call(brush)
    
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

  // Handle interactive selection for Stacked Bar Chart
  pick_4Stacked = (event) => {
    this.setState({ y2: event.target.value }) // stores an array
  }

  render = () => {
    const { dropdown_scatter } = this.state
    const { dropdown_stacked } = this.state

    return (
      <div className="dashboard">
        <FileUpload onDataUpload={this.handleDataUpload} />

        <div id='left-visual'>
          {/** Y dropdown (Scatter) */}
          <select name="y-attr-scatter" id="y-attr-scatter" onChange={this.pick_yValue_4Scatterplot}>
          <option disabled selected value> -- select an option -- </option>
            {dropdown_scatter.map((attr, index) => (
                <option key={index} value={attr}  disabled={this.state.x1 === attr}>
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
                <option key={index} value={attr} disabled={this.state.y1 === attr}>
                  {attr}
                </option>
            ))}
          </select> 
        </div>
        {/** ------------------------------------------------------ */}
        <div id='right-visual'>

          {/** Scatterplot + slider in here */}
          <g>
            <svg className='stackedChart' >
              <g className='stacked_inner_chart' />
            </svg>
            <svg className='slider-streams'></svg>
          </g>

          {/** Dropdown (Stacked) + Legend for Bar Colors*/}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',}}>

            <Select
              isMulti
              options={dropdown_stacked}
              onChange={(selected) => console.log(selected)}
            />


            <p>Categories</p>
            <svg width="100" height="200">
              <h3>Placeholder</h3>
            </svg>

            
          </div>
        </div>
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



