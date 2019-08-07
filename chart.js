var canvas = document.getElementById("my-chart");
var modal = document.getElementById("modal");

axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&interval=60min&symbol=IBM&outputsize=full&apikey=6XXXJS1ZXIORAEEXXXRPJ4')
    .then(R.prop('data'))
    .then(R.prop('Time Series (Daily)'))
    .then(R.pluck('4. close'))
    .then(keysAndValues)
    .catch(console.log);

function keysAndValues(stockData) {
    console.log(stockData);

    var keys = R.compose(R.reverse, R.keys)(stockData);
    var values = R.compose(R.reverse, R.values)(stockData);
    var movingAvg20 = nDayAverage(20, keys, values);
    createChart(keys, values, movingAvg20);
    modal.classList.remove('is-active');
}

function nDayAverage(n, keys, values) {
    var movingAvg = [];
    while (values.length > n) {
        avg = R.pipe(R.take(n), R.sum)(values)/n;
        values = values.slice(1);
        movingAvg.push(avg.toFixed(4));
    }

    //keys = keys.slice(n);
    keys = R.take(keys.length - n)(keys);

    var mappedIndex = R.addIndex(R.map);
    return mappedIndex((val, i) => {
        return {
            x: keys[i],
            y: val
        }
    })(movingAvg);
}

function createChart(keys, values, movingAvg20) {
    return new Chart(canvas, {
        type: 'line',
        data: {
            labels: keys,
            datasets: [
                {
                    label: '20 Day Avg',
                    data: movingAvg20,
                    pointRadius: 0,
                    borderWidth: 1,
                    borderColor: 'GREEN',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Moving Average of IBM Stock'
            },
            elements: {
                line: {
                    tension: 1,
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            },
            animation: {
                duration: 0,
            },
            hover: {
                animationDuration: 0,
            },
            responsiveAnimationDuration: 0,
        }
    });
}
