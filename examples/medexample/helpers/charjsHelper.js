
var ctx = document.getElementById("myChart").getContext("2d");
const createGraph =  (axeX,axeY) => {
return new Chart(ctx, {

  type: 'line',
  data: {
    labels: axeX,
    datasets: [{
      label: 'Convergences',
      data: axeY,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    animation : false,
    elements: {
      line: {
        tension: 0, // disables bezier curves
      }
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: '# iteration'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: '% de convergence'
        },
        ticks: {
          beginAtZero:true,
          max :100
        }
      }]
    }
  }
});

}