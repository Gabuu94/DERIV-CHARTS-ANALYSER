import React, { useState, useEffect, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import './ChartComponent.css'; // Import the custom CSS file

const ChartComponent = () => {
  const [chartData, setChartData] = useState([]);
  const [volatility, setVolatility] = useState('R_100');
  const [granularity, setGranularity] = useState(60);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chart, setChart] = useState(null);
  const [candlestickSeries, setCandlestickSeries] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Descriptive volatility labels for the dropdown
  const volatilities = [
    { value: 'R_100', label: 'Volatility 100 Index' },
    { value: 'R_75', label: 'Volatility 75 Index' },
    { value: 'R_50', label: 'Volatility 50 Index' },
    { value: 'R_25', label: 'Volatility 25 Index' },
    { value: 'R_10', label: 'Volatility 10 Index' },
  ];

  const timeframes = [
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 900, label: '15 minutes' },
  ];

  // Function to fetch chart data from the WebSocket
  const fetchChartData = useCallback(() => {
    setLoading(true);
    const socket = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

    socket.onopen = () => {
      console.log('WebSocket connection opened.');
      socket.send(
        JSON.stringify({
          ticks_history: volatility,
          granularity: granularity,
          style: 'candles',
          end: 'latest',
          count: 100,
        })
      );
    };

    // Handle WebSocket message for receiving data
    socket.onmessage = (event) => {
      setLoading(false);
      const response = JSON.parse(event.data);
      console.log('WebSocket message received:', response);
      if (response.candles) {
        const candles = response.candles.map((candle) => ({
          time: Math.floor(candle.epoch),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));
        setChartData(candles);
      } else if (response.error) {
        setError(response.error.message);
      }
    };

    // Handle WebSocket errors
    socket.onerror = (error) => {
      setLoading(false);
      setError('WebSocket error: ' + error.message);
      console.error('WebSocket error:', error);
    };

    // Clean up the WebSocket connection when the component is unmounted or updated
    return () => {
      console.log('Closing WebSocket connection.');
      socket.close();
    };
  }, [volatility, granularity]);

  // Fetch new chart data when volatility or granularity changes
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const handleVolatilityChange = (e) => {
    setVolatility(e.target.value);
  };

  const handleGranularityChange = (e) => {
    setGranularity(parseInt(e.target.value));
  };

  // Initialize the chart on component mount
  useEffect(() => {
    const chartContainer = document.getElementById('chart');
    if (chartContainer && !chart) {
      const newChart = createChart(chartContainer, {
        width: chartContainer.offsetWidth,
        height: 500,
        layout: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
        grid: {
          vertLines: {
            color: '#e0e0e0',
          },
          horzLines: {
            color: '#e0e0e0',
          },
        },
        priceScale: {
          borderColor: '#cccccc',
        },
        timeScale: {
          borderColor: '#cccccc',
        },
      });

      setChart(newChart);

      const series = newChart.addCandlestickSeries({
        upColor: 'green',
        downColor: 'red',
        borderVisible: false,
      });

      setCandlestickSeries(series);
    }

    return () => {
      if (chart) {
        chart.remove();
      }
    };
  }, [chart]);

  // Update the chart with new data
  useEffect(() => {
    if (candlestickSeries && chartData.length > 0) {
      candlestickSeries.setData(chartData);

      // Clear previous markers
      setMarkers([]);

      const newMarkers = [];
      chartData.forEach((candle, index) => {
        const buySignal = index > 0 && candle.close < chartData[index - 1].close;
        const sellSignal = index > 0 && candle.close > chartData[index - 1].close;

        if (buySignal) {
          newMarkers.push({
            time: candle.time,
            position: 'belowBar',
            color: 'blue',
            shape: 'arrowUp',
            text: 'Buy',
          });
        }

        if (sellSignal) {
          newMarkers.push({
            time: candle.time,
            position: 'aboveBar',
            color: 'red',
            shape: 'arrowDown',
            text: 'Sell',
          });
        }
      });

      setMarkers(newMarkers);
    }
  }, [candlestickSeries, chartData]);

  // Set chart markers for buy/sell signals
  useEffect(() => {
    if (candlestickSeries && markers.length > 0) {
      candlestickSeries.setMarkers(markers);
    }
  }, [candlestickSeries, markers]);

  // Handle chart resizing
  useEffect(() => {
    const handleResize = () => {
      if (chart) {
        chart.applyOptions({ width: window.innerWidth, height: 500 });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chart]);

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="dropdown-container">
        <label htmlFor="volatility">Volatility: </label>
        <select id="volatility" value={volatility} onChange={handleVolatilityChange} className="custom-dropdown">
          {volatilities.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>

        <label htmlFor="timeframe">Timeframe: </label>
        <select id="timeframe" value={granularity} onChange={handleGranularityChange} className="custom-dropdown">
          {timeframes.map((tf) => (
            <option key={tf.value} value={tf.value}>
              {tf.label}
            </option>
          ))}
        </select>
      </div>
      <div id="chart" style={{ flex: '1', position: 'relative', width: '100%', height: '500px' }}></div>
    </div>
  );
};

export default ChartComponent;
