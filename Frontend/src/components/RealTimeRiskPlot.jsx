import { useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import dayjs from 'dayjs';

export default function RealTimeRiskPlot() {
  const [rawData, setRawData] = useState([]);
  const [view, setView] = useState('rolling');
  const [range, setRange] = useState('7');
  const plotRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/analytics/fraud-data');
      if (Array.isArray(res.data)) {
        setRawData(res.data.map(d => ({
          timestamp: d.timestamp,
          risk_score: Number(d.risk_score),
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  const filtered = rawData.filter(d =>
    dayjs(d.timestamp).isAfter(dayjs().subtract(Number(range), 'day'))
  );

  const dailyMap = {};
  filtered.forEach(d => {
    const date = dayjs(d.timestamp).format('YYYY-MM-DD');
    if (!dailyMap[date]) dailyMap[date] = [];
    dailyMap[date].push(d.risk_score);
  });

  const dates = Object.keys(dailyMap).sort();
  const dailyAvg = dates.map(date => {
    const arr = dailyMap[date];
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  });

  const rollingAvg = dailyAvg.map((_, idx) => {
    const start = Math.max(0, idx - 6);
    const slice = dailyAvg.slice(start, idx + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

  const maxPoint = filtered.reduce(
    (prev, cur) => (cur.risk_score > prev.risk_score ? cur : prev),
    { risk_score: -Infinity, timestamp: '' }
  );

  const arrowSymbols = dailyAvg.map((val, idx) => {
    if (idx === 0) return 'circle';
    return val >= dailyAvg[idx - 1] ? 'triangle-up' : 'triangle-down';
  });

  const traces = [];

  if (view === 'rolling') {
    traces.push({
      x: dates,
      y: rollingAvg,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#38bdf8' },
    });
  } else {
    traces.push({
      x: dates,
      y: dailyAvg,
      type: 'scatter',
      mode: 'lines+markers',
      marker: { symbol: arrowSymbols, color: '#38bdf8' },
      line: { color: '#38bdf8' },
    });
  }

  if (maxPoint.timestamp) {
    traces.push({
      x: [dayjs(maxPoint.timestamp).format('YYYY-MM-DD')],
      y: [maxPoint.risk_score],
      type: 'scatter',
      mode: 'markers',
      marker: { color: 'red', size: 8 },
      hoverinfo: 'skip',
    });
  }

  const layout = {
    autosize: true,
    paper_bgcolor: '#1f2937',
    plot_bgcolor: '#1f2937',
    font: { color: '#ffffff' },
    margin: { t: 40, l: 40, r: 20, b: 40 },
    xaxis: { gridcolor: 'rgba(255,255,255,0.1)' },
    yaxis: { gridcolor: 'rgba(255,255,255,0.1)', rangemode: 'tozero' },
  };

  const handleDownload = () => {
    if (!plotRef.current) return;
    const node = plotRef.current; // Plotly component
    window.Plotly?.toImage(node.el, { format: 'png' }).then(url => {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'risk_chart.png';
      a.click();
    });
  };

  const exportCsv = () => {
    const header = 'timestamp,risk_score\n';
    const rows = filtered
      .map(d => `${d.timestamp},${d.risk_score}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-white">📊 Rolling Average Risk Score</h3>
          <p className="text-gray-400 text-xs">Live from prediction API</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
            className="bg-gray-700 text-white text-xs p-1 rounded"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <button
            type="button"
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            Download Chart
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="bg-green-600 hover:bg-green-500 text-white text-xs px-2 py-1 rounded"
          >
            Export Data
          </button>
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setView('rolling')}
          className={`text-xs px-2 py-1 rounded ${view === 'rolling' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Rolling Average
        </button>
        <button
          type="button"
          onClick={() => setView('trend')}
          className={`text-xs px-2 py-1 rounded ${view === 'trend' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Daily Trend Arrow
        </button>
      </div>
      <div className="w-full h-64">
        <Plot
          data={traces}
          layout={layout}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          ref={plotRef}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
}
