'use strict';

var UPDATE_GRAPH_INTERVAL_ID;
var CURRENT_INDEX_IN_GRAPH_DISPLAY = 0;


function App() {

  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [data, setData] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [selectedSet, setSelectedSet] = React.useState(0);
  const [experimentFilter, setExperimentFilter] = React.useState('');
  const [graphElemSelect, setGraphElemSelect] = React.useState(null);
  const [selectedView, setSelectedView] = React.useState('Throughput View');
  const [animationSpeedValue, setAnimationSpeedValue] = React.useState(3);

  const popoverRef = React.useRef(null);
  const popoverRef2 = React.useRef(null);

  const getData = () => {
    // add_loading()
    const preloader = document.querySelector('.page-loading');
    preloader.classList.add('active');
    // getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    // get_user_data_api((data) => setUserInfo(data.data));
    get_graphs_api((data) => {
      preloader.classList.remove('active');
      preloader.remove();
      setData(data.data);
      // remove_loading();
    });
  };

  React.useEffect(() => {
    if (popoverRef2.current !== popoverRef.current) { // If already done, this is O(1)
      if (popoverRef.current) {
        new bootstrap.Popover(popoverRef.current);
      }
      // Do this just one time;
      popoverRef2.current = popoverRef.current;
    }
  });


  React.useEffect(() => {
    getData();
  }, []);
  React.useEffect(() => {
    if (data != null) {
      stopAnimation();
      hideProgressBar();
      constructVerticalBarGraph(data.entries[selectedSet]);
      buildTopology(selectedSet);
      CURRENT_INDEX_IN_GRAPH_DISPLAY = 0;
    }
  }, [data, selectedSet]);

  const sendQuestion = () => {
    const text = document.querySelector("#question_textarea").value;
    if (!text) {
      alert("Message cannot be empty");
      return;
    }
    document.querySelector("#ask_question_btn").setAttribute("disabled", "true");
    ask_question_api(text, datasetData.id, () => {
      Swal.fire({
        title: 'Message sent!',
        text: "The admin will read your message and answer via email",
        icon: 'success',
        confirmButtonColor: "#434575",
      });
      document.querySelector("#question_textarea").value = "";
      document.querySelector("#ask_question_btn").removeAttribute("disabled");
    },
      () => {
        Swal.fire({
          title: 'There was an error',
          text: "Try again",
          icon: 'error',
          timer: 2000,
        });
        document.querySelector("#ask_question_btn").removeAttribute("disabled");
      },
    );
  };

  const addData = (chart, label, newData) => {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(newData);
    });
    chart.update();
  };

  const clearGraph = (chart) => {
    chart.data.labels = [];
    chart.data.datasets.forEach((dataset) => {
      dataset.data = [];
    });
    if (selectedSet != null && data.entries[selectedSet]) {
      chart.options.scales.y.suggestedMax = data.entries[selectedSet][2].reduce((a, b) => Math.max(a, b));
      chart.options.scales.x.max = data.entries[selectedSet][1].reduce((a, b) => Math.max(a, b));
      // chart.options.scales.x.suggestedMax = data.entries[selectedSet][1].reduce((a, b) => Math.max(a, b));
      // chart.options.scales.x.suggestedMin = data.entries[selectedSet][1].reduce((a, b) => Math.min(a, b));
    }
    chart.update('none');
  }

  const hideProgressBar = () => {
    document.getElementById('progress-bar-container').style.display = 'none';
    setProgressBarValue(0);
  }

  const stopAnimation = () => {
    clearInterval(UPDATE_GRAPH_INTERVAL_ID);
    UPDATE_GRAPH_INTERVAL_ID = null;
    if (CURRENT_INDEX_IN_GRAPH_DISPLAY >= data.entries[selectedSet][1].length) {
      hideProgressBar();
    }
  }

  const playAnimation = (speed = null) => {
    document.getElementById('progress-bar-container').style.display = 'block';
    const currentAnimationSpeed = speed == null ? animationSpeedValue : speed;
    const name = 'graph_div';
    if (window.barGraphs == {} || window.barGraphs == null || window.barGraphs[name] == null) {
      return;
    }
    if (UPDATE_GRAPH_INTERVAL_ID != null) {
      return false;
    }
    if (CURRENT_INDEX_IN_GRAPH_DISPLAY == 0) {
      clearGraph(window.barGraphs[name]);
    }
    UPDATE_GRAPH_INTERVAL_ID = setInterval(
      function () {
        if (window.barGraphs == {} || window.barGraphs == null || window.barGraphs[name] == null) {
          return;
        }
        const chart = window.barGraphs[name];
        if (chart.data.labels.length >= data.entries[selectedSet][1].length) {
          CURRENT_INDEX_IN_GRAPH_DISPLAY = 0;
          clearInterval(UPDATE_GRAPH_INTERVAL_ID);
          UPDATE_GRAPH_INTERVAL_ID = null;
          return;
        }
        addData(chart,
          data.entries[selectedSet][1][CURRENT_INDEX_IN_GRAPH_DISPLAY],
          data.entries[selectedSet][2][CURRENT_INDEX_IN_GRAPH_DISPLAY]
        );
        CURRENT_INDEX_IN_GRAPH_DISPLAY += 1;
        setProgressBarValue(parseInt(100 * CURRENT_INDEX_IN_GRAPH_DISPLAY / data.entries[selectedSet][1].length));
      }, 1000 / currentAnimationSpeed
    )
  };

  const buildTopology = () => {
    const elements = [];
    data.topologies[selectedSet][0].forEach((neighboursList, nnodeIdx) => {
      elements.push({
        data: {
          id: nnodeIdx, label: data.topologies[selectedSet][1][nnodeIdx]
        }
      });
      neighboursList.forEach((neigh) => {
        elements.push({ data: { id: nnodeIdx.toString() + '-' + neigh.toString(), source: nnodeIdx, target: neigh } });
      })
    });
    let nodesNamesColor = '#000';
    if (window.localStorage.getItem('mode') === 'dark') {
      nodesNamesColor = '#fff';
    }
    var cy = cytoscape({
      container: document.getElementById('topology_div'),
      elements: elements,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(label)',
            'color': nodesNamesColor,
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        roots: [0],
        animate: true,
        directed: true,
        transform: function (node, position) {
          return { x: position.y * 5, y: position.x / 5 };
          return position;
        }
      }
    });
    cy.selectionType('additive');
    cy.on('mousedown', 'node', function (evt) {
      var node = evt.target;
      cy.edges().forEach((edge) => {
        if (node.id() == edge.id().split('-')[0] || node.id() == edge.id().split('-')[1]) {
          edge.style({
            'width': 6
          });
        }
      })
    });
    cy.on('mouseup', 'node', function (evt) {
      // var node = evt.target;
      cy.edges().forEach((edge) => {
        edge.style({
          'width': 3
        });
      })
    });
    cy.on('tap', 'node', function (evt) {
      var node = evt.target;
      cy.nodes().forEach((nnode) => {
        nnode.style({
          backgroundColor: '#666'
        });
      })
      cy.edges().forEach((edge) => {
        edge.style({
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'width': 3
        });
      })
      node.style({
        backgroundColor: 'green'
      });
      setGraphElemSelect(node.id());
      console.log('tapped ' + node.id());
    });
    cy.on('dbltap', 'edge', function (evt) {
      var edge = evt.target;
      cy.nodes().forEach((nnode) => {
        nnode.style({
          backgroundColor: '#666'
        });
      })
      cy.edges().forEach((edge) => {
        edge.style({
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'width': 3
        });
      })
      edge.style({
        'line-color': 'green',
        'target-arrow-color': 'green',
        'width': 10
      });
    });
    // cy.fit();
    window.topologyGraph = cy;
    document.getElementById('theme-mode').addEventListener('click', function () {
      let nodesNamesColor = '#fff';
      if (window.localStorage.getItem('mode') === 'dark') {
        nodesNamesColor = '#000';
      }
      cy.nodes().forEach((nnode) => {
        nnode.style({
          color: nodesNamesColor
        });
      });
    })
  }

  const centerGraph = () => {
    if (window.topologyGraph != null) {
      window.topologyGraph.fit();
    }
  }

  const shouldShowExperiment = (experimentName) => {
    if (experimentFilter === '') {
      return true;
    }
    return experimentName.includes(experimentFilter);
  }

  const setProgressBarValue = (percentage) => {
    const progress_bar = document.getElementById('graph-progress-bar-id');
    progress_bar.style.width = percentage.toString() + '%';
    progress_bar.setAttribute('aria-valuenow', percentage);
    progress_bar.innerHTML = percentage.toString() + '%'
  }

  const constructVerticalBarGraph = (currentDatasetData) => {
    const name = 'graph_div';
    if (document.getElementById(name) != null && currentDatasetData != null) {
      if (window.barGraphs == undefined) {
        window.barGraphs = {};
      }
      if (window.barGraphs[name] != undefined) {
        window.barGraphs[name].destroy();
      }

      const transparentize = (value, opacity) => {
        var alpha = opacity === undefined ? 0.5 : 1 - opacity;
        return colorLib(value).alpha(alpha).rgbString();
      }

      const CHART_COLORS = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
      };

      const graphData = {
        labels: currentDatasetData[1],
        datasets: [
          {
            label: 'Throughput',
            data: currentDatasetData[2].map((x) => parseFloat(x)),
            borderColor: CHART_COLORS.blue,
            //backgroundColor: transparentize(CHART_COLORS.red, 0.5),
            yAxisID: 'y',
          },
          /*{
            label: 'Throughput * 1.1',
            data: currentDatasetData[2].map((x) => parseFloat(x) * 1.1),
            borderColor: CHART_COLORS.blue,
            //backgroundColor: transparentize(CHART_COLORS.blue, 0.5),
            yAxisID: 'y1',
          }*/
        ]
      };

      const config = {
        type: 'line',
        data: graphData,
        options: {
          animation: {
            duration: 0,
          },
          legend: { display: false },
          title: {
            display: false,
            // text: currentDatasetData[name]['title']
          },
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          stacked: false,
          plugins: {
            title: {
              display: false,
              text: ''
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left'
            },
            x: {
              type: 'linear',
              display: true,
              max: currentDatasetData[1].reduce((a, b) => Math.max(a, b))
              //position: 'left'
            },
            /*y1: {
              type: 'linear',
              display: true,
              position: 'right',
  
              // grid line settings
              grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
              },
            },*/
          }
        },
      };
      window.barGraphs[name] = new Chart(name, config);
    }
  }

  const isAdminBool = false;

  return (
    <div>
      <div className=''>
        {data != null &&

          <div style={{ marginRight: '5px', marginBottom: '20px' }}>
            {data != null &&
              <div style={{ height: '100%' }}>
                <div>
                  <div style={{ display: 'flex' }} className="mx-2">
                    <div className="btn-group dropdown">
                      <button type="button" className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {data.entries[selectedSet][0]}
                      </button>
                      <div className="dropdown-menu my-1" style={{ maxHeight: '300px', overflow: 'scroll' }}>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bx bx-search fs-base"></i>
                          </span>
                          <input type="text"
                            className="form-control"
                            placeholder="Search..."
                            value={experimentFilter}
                            onChange={e => { setExperimentFilter(e.target.value) }}
                          />
                        </div>
                        {
                          data.entries.map((entry, ii) => shouldShowExperiment(entry[0]) ? <button key={entry[0]} value={ii}
                            onClick={() => { setSelectedSet(ii) }} className="dropdown-item">{entry[0]}</button> : null)
                        }
                        <div className="dropdown-divider"></div>
                      </div>
                    </div>
                    <div style={{ width: '100%' }}>
                      <div className="btn-group dropdown" style={{ float: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-outline-secondary dropdown-toggle"
                          data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          {selectedView}
                        </button>
                        <div className="dropdown-menu my-1" style={{ maxHeight: '300px', overflow: 'scroll' }}>
                          <button onClick={() => { setSelectedView('Throughput View') }}
                            className="dropdown-item">Throughput View</button>
                          <button onClick={() => { setSelectedView('Other View') }}
                            className="dropdown-item">Other View</button>
                          <div className="dropdown-divider"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ position: 'relative' }} className="mx-2 row border border-2 border-dark mt-2">
                    <div id="topology_div" style={{ width: '100%', height: '200px', maxHeight: '200px', paddingTop: '40px' }}></div>
                    <button type="button" className="btn btn-dark btn-sm btn-debug rounded-pill" onClick={centerGraph}
                      style={{ top: 2, position: 'absolute', left: '45%', width: '10%' }}
                    >
                      Re-center
                    </button>
                    <button
                      ref={popoverRef}
                      type="button"
                      className="btn btn-sm rounded-pill btn-outline-secondary"
                      data-bs-container="body"
                      data-bs-toggle="popover"
                      data-bs-placement="top"
                      data-bs-trigger="hover"
                      style={{ top: 2, position: 'absolute', right: 2, width: '10%' }}
                      title=""
                      data-bs-content="Nodes are draggable. You can zoom in/out scrolling inside, then re-center with button. Click on a node or double click on edge to display the data of that element.">
                      <i className="bx bxs-info-circle fs-base"></i>
                    </button>
                  </div>
                  <div className="mx-2 mt-2 grid row row-cols-1 row-cols-md-2">
                    <div className="col-md-3 col" style={{ paddingLeft: '0px' }}>
                      <div className="border border-2 border-dark mr-4"
                        style={{ paddingLeft: '5px', height: '100%' }}>
                        <div className="row-cols-1">
                          <label className="col">Topology: Core Network</label>
                          <label className="col">Catalog Size: 2000</label>
                          <label className="col">Catalog Size: 2000</label>
                          <br />
                          <label>Object Parameter: X</label>
                          <br />
                          <label>Object Parameter: Z</label>
                          <br />
                          <label>Object Parameter: Y</label>
                          <hr className="hr hr-blurry" />
                          <label>This is a LABEL with a text so long that it needs to occupy more than one line</label>
                        </div>
                      </div>
                    </div>
                    <div className="col col-md-9 border border-2 border-dark px-2 py-2" >
                      <div style={{ display: 'flex' }}>
                        <button type="button" className="btn btn-dark btn-sm mr-1"
                          style={{ 'width': '5%' }}
                          onClick={() => {
                            playAnimation();
                          }}>
                          <i className="bx bx-play fs-base"></i>
                        </button>
                        <button type="button" className="btn btn-dark btn-sm mx-1"
                          style={{ 'width': '5%' }}
                          onClick={stopAnimation}>
                          <i className="bx bx-stop fs-base"></i>
                        </button>
                        <div className="input-group col-md-2">
                          <input type="number"
                            step={1.0} min={1.0} max={20.0} value={animationSpeedValue}
                            className="col-xs-1"
                            style={{ textAlign: 'right', width: '5%' }}
                            onChange={e => {
                              setAnimationSpeedValue(e.target.value);
                              if (UPDATE_GRAPH_INTERVAL_ID != null) {
                                stopAnimation();
                                playAnimation(e.target.value);
                              }
                            }}
                          />
                          <span className="input-group-text input-sm">per second</span>
                        </div>
                      </div>
                      <div className="progress mb-3 my-2" id='progress-bar-container' style={{ display: 'none' }}>
                        <div id="graph-progress-bar-id" className="progress-bar bg-gradient" role="progressbar" style={{ width: "0%" }} aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                          0%
                        </div>
                      </div>
                      <canvas id="graph_div" style={{ width: '100%', height: '500px', maxHeight: '500px' }}></canvas>
                    </div>
                  </div>
                </div>
              </div>
            }

            {!isAdminBool && false &&
              <div style={{ textAlign: "center", marginTop: '20px' }}>
                <label>Submit a Request</label>
                <br />
                <textarea id="question_textarea" style={{ width: "50%", height: "100px" }}></textarea>
                <br />
                <button id="ask_question_btn" style={{ backgroundColor: "#434575", borderColor: "#434575" }} className="btn btn-primary" onClick={() => { sendQuestion(); }}>Send question</button>
              </div>
            }
          </div>

        }
      </div>
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  React.createElement(App),
  domContainer
);
