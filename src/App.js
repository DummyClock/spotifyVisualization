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
      .width(500)
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
    const svg = d3.select('.scatterplot')
        .attr("width", innerWidth + margin.left + margin.right)
        .attr("height", innerHeight + margin.top + margin.bottom) 
    let innerChart = svg.selectAll(".inner_chart")
        .data([null])
        .join("g")
        .attr("class", "inner_chart")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)  

    // X-axis + Y-axis
    const xValues = data.map(d => d[x1])
    const yValues = data.map(d => d[y1])

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
      .attr("class", "x-axis-label")
      .attr("x", innerWidth / 2) 
      .attr("y", innerHeight + margin.bottom ) 
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

    var brush = d3.brush().on('start brush', (e) => {
      var filtered_data = this.state.scatter_filtered_data.filter(point => {
        var x = xScale(point[x1]) + margin.left
        var y = yScale(point[y1]) + margin.top
        return x >= e.selection[0][0] && x <= e.selection[1][0] && y >= e.selection[0][1] && y <= e.selection[1][1]
      });
      this.setState({ bar_filtered_data: filtered_data }, () => {
      this.scatter(this.state.x1, this.state.y1); 
      this.stack(); 
      this.rebuildZoomSlider(); // force reset
  });
    });
  
    d3.select('svg').call(brush)
  }

  rebuildZoomSlider() {
    d3.select('.slider-streams').selectAll('*').remove(); 
    this.createZoomSlider(); 
  }

  createZoomSlider(xScale) {
    const originalData = [...this.state.bar_filtered_data];
    const allTrackNames = originalData.map(d => d.TrackName);
    const minIndex = 0;
    const maxIndex = allTrackNames.length - 1;
    
    const sliderRange = sliderBottom()
      .min(minIndex)
      .max(maxIndex)
      .step(1)
      .width(300)
      .ticks(5)
      .tickFormat(() => "")
      .default([minIndex, maxIndex])
      .fill('#85bb65')
      .on('onchange', val => {             
        const visibleTracks = allTrackNames.slice(val[0], val[1] + 1);
        const filtered = originalData.filter(d => visibleTracks.includes(d.TrackName));  
        this.setState({ bar_filtered_data: filtered }, () => { this.stack(false) }); // prevent slider duplicating 
      });

    
    // Add slider to page
    const gRange = d3.select('.slider-streams')
        .attr('width', 900)
        .attr('height', 100)
        .append('g')
        .attr('class', 'slider-g')
        .attr('transform', 'translate(90,40)');

    gRange.call(sliderRange);
  }
    
  stack() {
    if (!this.state.y2 || this.state.y2.length === 0 || !this.state.bar_filtered_data.length) return;
    const brushData = this.state.bar_filtered_data;
    const selectedAttr = this.state.y2.map(attr => attr.value);

    // Recalculate innerWidth based on current margin (important if margin changes)
    const currentInnerWidth = 600 - margin.left - margin.right;
    const currentInnerHeight = 400 - margin.top - margin.bottom;

    let svg = d3.select('.stackedChart');
    if (svg.empty()) {
      svg = d3.select('.stackedChart')
        .attr("width", currentInnerWidth + margin.left + margin.right) 
        .attr("height", currentInnerHeight + margin.top + margin.bottom + margin.bottom + 60); 
    } else {
      svg.attr("width", currentInnerWidth + margin.left + margin.right)
        .attr("height", currentInnerHeight + margin.top + margin.bottom + margin.bottom + 60);
    }

    let innerChart = svg.select(".stacked_inner_chart");
    if (innerChart.empty()) {
      innerChart = svg.append("g")
        .attr("class", "stacked_inner_chart")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    } else {
      innerChart.attr("transform", `translate(${margin.left}, ${margin.top})`);
    }

    // Scales & Axis
    const xScale = d3.scaleBand()
      .domain(brushData.map(d => d.TrackName))
      .range([0, currentInnerWidth]) 
      .padding(0.2);

    const colorScale = d3.scaleOrdinal().domain(selectedAttr).range(["red", "green", "orange", "yellow", "blue", "purple", "brown"]);
    const stackGen = d3.stack().keys(selectedAttr);
    const stackedSeries = stackGen(brushData);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedSeries, d => d3.max(d, d => d[1])) * 1.1])
      .range([currentInnerHeight, 0]); 

  
    // Draw/update rectangles
    innerChart.selectAll(".layer")
      .data(stackedSeries)
      .join("g")
      .attr("class", "layer")
      .attr("fill", d => colorScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", d => xScale(d.data.TrackName))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on("mouseover", function(event, d) {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(`<h3>Artist(s): ${d.data.ArtistName}</h3> <h4>Track: ${d.data.TrackName}</h4><br>  - ${this.parentNode.__data__.key}: ${d[1] - d[0]}`);
      })
      .on("mousemove", function(event) {
          d3.select("#tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
          d3.select("#tooltip")
            .style("opacity", 0);
      });

    // Add Legend
    const legend = d3.select(".stacked-legend")
      .selectAll(".legend-item")
      .data(selectedAttr)
      .join("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(10,${i * 20 + 10})`);

        // Add colored rectangles
    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => colorScale(d));

        // Add text labels
    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("font-size", "12px")
      .text(d => d);

    // Create axes
    let xAxis = svg.select(".x-axis");
    if (xAxis.empty()) {
      xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${margin.left}, ${currentInnerHeight + margin.top})`)
        .call(d3.axisBottom(xScale).tickFormat(track => {
          const song = brushData.find(d => d.TrackName === track);
          const artist = song ? song.ArtistName : "Unknown";
          // Shorten the track name if it's too long
          const song_short = track.length > 10 ? track.substring(0, 10) + '...' : track;
          const artist_short = artist.length > 10 ? artist.substring(0, 10) + '...' : artist;
          return `${song_short} | (${artist_short})`;
        }))
    } else {
      xAxis.attr("transform", `translate(${margin.left}, ${currentInnerHeight + margin.top})`).call(d3.axisBottom(xScale)
        .tickFormat(track => {
          const song = brushData.find(d => d.TrackName === track);
          const artist = song ? song.ArtistName : "Unknown";
          // Shorten the track name if it's too long
          const song_short = track.length > 10 ? track.substring(0, 10) + '...' : track;
          const artist_short = artist.length > 10 ? artist.substring(0, 10) + '...' : artist;
          return `${song_short} | (${artist_short})`;
        }))
    }

    xAxis.selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em");


    let yAxis = svg.select(".y-axis");
    if (yAxis.empty()) {
      yAxis = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale).ticks(5));
    } else {
      yAxis.attr("transform", `translate(${margin.left}, ${margin.top})`).call(d3.axisLeft(yScale).ticks(5));
    }

    // Add labels for the axis lines
    let xAxisLabel = innerChart.select(".x-axis-label");
    if (xAxisLabel.empty()) {
      innerChart.append("text")
        .attr("class", "x-axis-label")
        .attr("x", currentInnerWidth / 2)
        .attr("y", currentInnerHeight + margin.bottom + 60)
        .attr("text-anchor", "middle")
        .text("Songs");
    } else {
      xAxisLabel.attr("x", currentInnerWidth / 2)
                .attr("y", currentInnerHeight + margin.bottom + 60);
    }

    let yAxisLabel = innerChart.select(".y-axis-label");
    if (yAxisLabel.empty()) {
      innerChart.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -currentInnerHeight / 2)
        .attr("y", -margin.left / 1.5)
        .attr("text-anchor", "middle")
        .text("Percentage (%)");
    } else {
      yAxisLabel.attr("x", -currentInnerHeight / 2)
                .attr("y", -margin.left / 1.5);
    }

    if (!this.sliderInitialized) {
      this.createZoomSlider(xScale);
      this.sliderInitialized = true;
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

  // Handle interactive selection for Stacked Bar Chart
  pick_4Stacked = (event) => {
    this.setState({ y2: event.target.value }) // stores an array
  }

  render = () => {
    const { dropdown_scatter } = this.state
    const { dropdown_stacked } = this.state
    const { bar_filtered_data } = this.state
    const { data } = this.state

    return (
      <div className="dashboard" >
        <FileUpload onDataUpload={this.handleDataUpload} />
 
        <div id="theBox">
          { !data || data.length <= 0 && <p style={{textAlign: 'center', fontStyle: 'italic',}}>Upload a file to get started</p> }
          { data.length > 0 &&
            <div id='left-visual' style={{"width":"auto", "height":"auto", "padding":"20px"}}>
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
              <div>
                <svg className='scatterplot' style={{ width: '100%' }}>
                  <g className='inner_chart' />
                </svg>
                <svg className='slider-year'></svg>
              </div>

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
        }
        {/** ------------------------------------------------------ */}
         { this.state.x1 && this.state.y1 && 
         <div id='right-visual' style={{"width":"auto", "height":"auto", "padding":"20px"}}>

            {/** Stacked Bar Chart + slider in here */}
            {bar_filtered_data.length === 0 && (
              <p style={{ textAlign: 'center', fontStyle: 'italic',}}>
                Use the brush tool on the scatterplot to populate this chart.
              </p>
            )}
            <div style={{"width":"auto", "height":"auto"}}>
                <svg className='stackedChart'>
                    <g className='stacked_inner_chart'/>
                </svg>
                <svg className='slider-streams'></svg>
            </div>

            <div id="tooltip" style={{
              position: "absolute",
              background: "white",
              border: "1px solid gray",
              padding: "5px",
              fontSize: "12px",
              pointerEvents: "none",
              opacity: 0
            }}></div>
            
            {/** Dropdown (Stacked) + Legend for Bar Colors*/}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width:'auto', height:'auto'}}>

              <p>Categories</p>
              <svg className="stacked-legend" width="150" height={200}></svg>
              <div style={{ width: '200px'}}>
                <Select
                  isMulti
                  options={dropdown_stacked}
                  onChange={(selected) => {
                    this.setState({ y2: selected }, () => this.stack());
                  }}
                />
              </div>

            </div>
          </div>}
        </div>

      </div>
    );
  }
}

export default Dashboard;



