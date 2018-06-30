function getData(sample, callback) {

    
    Plotly.d3.json(`/samples/${sample}`, function(error, sample_value_data) {
        if (error) return console.warn(error);
        console.log(sample_value_data);
  
        Plotly.d3.json('/otu', function(error, otu_data) {
            if (error) return console.warn(error);
            console.log(otu_data);
  
          Plotly.d3.json(`/wfreq/${sample}`, function(error, wfreq_data) {
                if (error) return console.warn(error);
                console.log(wfreq_data);
                callback(sample_value_data, otu_data, wfreq_data);
          });
        });
        update_charts(sample, sample_value_data, otu_data, wfreq_data);
    });
    Plotly.d3.json(`/metadata/${sample}`, function(error, meta_data) {
        if (error) return console.warn(error);
        console.log(meta_data);
        update_metaData(meta_data);
    });
    };
  
  function update_metaData(meta_data) {
      
      var Panel = document.getElementById("sample-metadata");
     
      Panel.innerHTML = '';
      
      for(var key in meta_data) {
          h6tag = document.createElement("h6");
          h6Text = document.createTextNode(`${key}: ${meta_data[key]}`);
          h6tag.append(h6Text);
          Panel.appendChild(h6tag);
      }
  };
  
  function build_charts( sample_value_data, otu_data) {

      var OTU_Description = sample_value_data[0]['otu_ids'].map(function(item) {
          return otu_data[item]
      });
  
      console.log(sample_value_data[0]['sample_values'].slice(0, 10));
      console.log(sample_value_data[0]['otu_ids'].slice(0, 10));
      
      var pie_data = [{
          values: sample_value_data[0]['sample_values'].slice(0, 10),
          labels: sample_value_data[0]['otu_ids'].slice(0, 10),
          hovertext:  OTU_Description.slice(0, 10),
          hoverinfo: 'hovertext',
          type: 'pie'
      }];
      var pie_layout = {
  
            margin: { t: 2, b: 2, l:2, r:2},
            height: 600,
            width: 500
    
      };
      var Pie = document.getElementById('pie-chart');
      Plotly.plot(Pie, pie_data, pie_layout);

      var bubble_data = [{
          x: sample_value_data[0]['otu_ids'],
          y: sample_value_data[0]['sample_values'],
          text: OTU_Description,
          mode: 'markers',
          marker: {
              size: sample_value_data[0]['sample_values'],
              color: sample_value_data[0]['otu_ids'],
              colorscale: "Rainbow",
          }
      }];
      var bubble_layout = {
          margin: {l: 0, r: 0, b: 5,  t: 5,  pad:0},
          hovermode: 'closest',
          height: 800,
          width: 1200,
          xaxis: { title: "OTU" },
          yaxis: { title: "Sample Values" }
                     
      };
      var Bubble = document.getElementById('bubble-chart');
      Plotly.plot(Bubble, bubble_data, bubble_layout);
      
  };
  
  function update_charts(sample, sample_value_data, otu_data, wfreq_data) {
  
      optionChanged(sample) ;

      var new_otu_ids = sample_value_data[0]['otu_ids'];

      var new_OTU_Description = new_otu_ids.map(function(item) {
          return otu_data[item]
      });

      var Bubble = document.getElementById('bubble');
      Plotly.restyle(Bubble, 'x', [new_otu_ids]);
      Plotly.restyle(Bubble, 'y', [new_sample_values]);
      Plotly.restyle(Bubble, 'text', [new_OTU_Description]);
      Plotly.restyle(Bubble, 'marker.size', [new_sample_values]);
      Plotly.restyle(Bubble, 'marker.color', [new_otu_ids]);

      var Pie = document.getElementById('pie');
      Plotly.restyle(Pie, "values",[new_sample_values.slice(0, 10)]);
      Plotly.restyle(Pie, "labels", [new_otu_ids.slice(0, 10)]);
      Plotly.restyle(Pie, "hovertext", [new_OTU_Description.slice(0, 10)]);
      Plotly.restyle(Pie, "hoverinfo", 'hovertext');
      Plotly.restyle(Pie, "type", 'pie');
  
  }

  function getNames_dropdown_options() {
  
      var selDataset = document.getElementById('selDataset');
      
      Plotly.d3.json('/names', function(error, sample_names) {
          if (error) return console.warn(error);
          console.log(sample_names);
  
          for (var i = 0; i < sample_names.length;  i++) {
      
              var currentOption = document.createElement('option');
              currentOption.text = sample_names[i];
              currentOption.value = sample_names[i];
              selDataset.appendChild(currentOption);
          };
          getData(sample_names[0], build_charts);
      });
  };
  
  function optionChanged(new_sample) {
      
      getData(new_sample, callback);
      
  };
  
  function init() {
      getNames_dropdown_options();
  }

  init();