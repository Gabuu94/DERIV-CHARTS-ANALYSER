import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const ChartComponent = () => {
  const chartContainerRef = useRef(null);
  const [candlestickSeries, setCandlestickSeries] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState('R_100'); // Dropdown for volatility index
  const [selectedTimeframe, setSelectedTimeframe] = useState(60); // Dropdown for timeframes

  useEffect(() => {
    // Initialize the chart
    const chartInstance = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 450, // Increased height
      layout: {
        backgroundColor: '#FFFFFF',
        textColor: '#000',
      },
      grid: {
        vertLines: { color: '#e1e1e1' },
        horzLines: { color: '#e1e1e1' },
      },
      priceScale: {
        borderColor: '#cccccc',
      },
      timeScale: {
        borderColor: '#cccccc',
      },
    });

    // Create candlestick series
    const candleSeries = chartInstance.addCandlestickSeries({
      upColor: '#4caf50',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#4caf50',
      wickDownColor: '#ef5350',
      wickUpColor: '#4caf50',
    });

    setCandlestickSeries(candleSeries);

    const handleResize = () => {
      chartInstance.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!candlestickSeries) return;

    // WebSocket connection to fetch data based on market and timeframe
    const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

    ws.onopen = () => {
      console.log('WebSocket connection opened.');
      ws.send(JSON.stringify({
        ticks_history: selectedMarket,
        adjust_start_time: 1,
        count: 100,
        end: 'latest',
        start: 1,
        style: 'candles',
        subscribe: 1,
        granularity: selectedTimeframe, // Timeframe (seconds)
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.candles) {
        const formattedData = data.candles.map(candle => ({
          time: candle.epoch,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        candlestickSeries.setData(formattedData);

        // Example marker logic (reduced frequency)
        const generatedMarkers = formattedData.map((candle, index) => {
          if (index % 10 === 0 && candle.close > formattedData[index - 1]?.close) {
            return { time: candle.time, position: 'belowBar', color: 'green', shape: 'arrowUp', text: 'BUY' };
          } else if (index % 10 === 0 && candle.close < formattedData[index - 1]?.close) {
            return { time: candle.time, position: 'aboveBar', color: 'red', shape: 'arrowDown', text: 'SELL' };
          }
          return null;
        }).filter(marker => marker !== null);

        candlestickSeries.setMarkers(generatedMarkers);
      }
    };

    return () => {
      ws.close();
    };
  }, [candlestickSeries, selectedMarket, selectedTimeframe]);

  return (
    <div>
      <h2>Live Candlestick Chart with Buy/Sell Indicators</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        {/* Dropdown for selecting Volatility Index */}
        <select value={selectedMarket} onChange={e => setSelectedMarket(e.target.value)}>
          <option value="R_100">Volatility 100 Index</option>
          <option value="R_75">Volatility 75 Index</option>
          <option value="R_50">Volatility 50 Index</option>
          <option value="R_25">Volatility 25 Index</option>
          <option value="R_10">Volatility 10 Index</option>
        </select>

        {/* Dropdown for selecting Timeframes */}
        <select value={selectedTimeframe} onChange={e => setSelectedTimeframe(e.target.value)}>
          <option value={60}>1 Minute</option>
          <option value={300}>5 Minutes</option>
          <option value={1800}>30 Minutes</option>
          <option value={3600}>1 Hour</option>
        </select>
      </div>

      <div ref={chartContainerRef} style={{ width: '100%', height: '450px' }} /> {/* Increased height */}
    </div>
  );
};

export default ChartComponent;
