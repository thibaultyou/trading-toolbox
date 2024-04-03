import React, { useEffect, useRef } from 'react';
import {
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineStyle,
} from 'lightweight-charts';
import { Setup } from '../../types/setup.types';
import Paper from '../atoms/Paper';
import { useTickersContext } from '../../containers/TickersContext';
import { ActionType } from '../../types/action.types';
import { getCurrentDate } from '../../utils/time.utils';

type TradingViewChartProps = {
  setup: Setup;
};

const TradingViewChart: React.FC<TradingViewChartProps> = ({ setup }) => {
  const { tickerHistory, fetchTickerHistory } = useTickersContext();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const longLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const shortLineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    fetchTickerHistory(setup.ticker);
    // const intervalId = setInterval(() => {
    //     fetchTickerHistory(setup.ticker, true);
    // }, 30000); // fetch new data every 30 seconds

    // return () => clearInterval(intervalId);
  }, [setup.ticker]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: 0,
      height: 300,
      autoSize: true,
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#089981',
      downColor: '#e91e63',
      wickUpColor: '#089981',
      wickDownColor: '#e91e63',
      borderVisible: false,
    });

    if (candlestickSeriesRef.current && tickerHistory.length) {
      candlestickSeriesRef.current.setData(tickerHistory);
    }

    longLineSeriesRef.current = chartRef.current.addLineSeries({
      lastValueVisible: false,
    });

    shortLineSeriesRef.current = chartRef.current.addLineSeries({
      lastValueVisible: false,
    });

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [setup, setup.ticker, tickerHistory, chartContainerRef.current]);

  useEffect(() => {
    if (!chartRef.current) return;

    setup.actions.forEach((action) => {
      const price = Number(action.value);
      if (!isNaN(price)) {
        if (longLineSeriesRef.current) {
          if (action.type === ActionType.MARKET_LONG) {
            longLineSeriesRef.current.setData([
              { time: getCurrentDate(), value: price },
            ]);
            longLineSeriesRef.current.createPriceLine({
              price,
              color: '#089981',
              lineStyle: LineStyle.Solid,
              axisLabelVisible: true,
              title: 'LONG',
            });
          }
        }

        if (shortLineSeriesRef.current) {
          if (action.type === ActionType.MARKET_SHORT) {
            shortLineSeriesRef.current.setData([
              { time: getCurrentDate(), value: price },
            ]);
            shortLineSeriesRef.current.createPriceLine({
              price,
              color: '#e91e63',
              lineStyle: LineStyle.Solid,
              axisLabelVisible: true,
              title: 'SHORT',
            });
          }
        }
      }
    });
    chartRef.current.timeScale().fitContent();
  }, [setup.actions, chartRef.current]);

  return (
    <Paper>
      <div ref={chartContainerRef} />
    </Paper>
  );
};

export default TradingViewChart;
