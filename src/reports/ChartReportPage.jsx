import moment from 'moment';
import React, { useRef, useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ReportFilter from './components/ReportFilter';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch } from '../reactHelper';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import {
  altitudeFromMeters, distanceFromMeters, speedFromKnots, volumeFromLiters,
} from '../common/util/converter';
import useReportStyles from './common/useReportStyles';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { useSelector } from 'react-redux';
import { getBase64Image } from './components/MakeLogo';
const ChartReportPage = () => {
  const chartRef = useRef();
  const classes = useReportStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);
  const user = useSelector(state => state.session.user)
  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const hours12 = usePreference('twelveHourFormat');

  const [items, setItems] = useState([]);
  const [types, setTypes] = useState(['speed']);
  const [type, setType] = useState('speed');

  const values = items.map((it) => it[type]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  const handleSubmit = useCatch(async ({ deviceId, from, to, type }) => {

    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/reports/route?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      if (type === "json") {
        const positions = await response.json();
        const keySet = new Set();
        const keyList = [];
        const formattedPositions = positions.map((position) => {
          const data = { ...position, ...position.attributes };
          const formatted = {};
          formatted.fixTime = moment(position.fixTime).valueOf();
          Object.keys(data).filter((key) => !['id', 'deviceId'].includes(key)).forEach((key) => {
            const value = data[key];
            if (typeof value === 'number') {
              keySet.add(key);
              const definition = positionAttributes[key] || {};
              switch (definition.dataType) {
                case 'speed':
                  formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                  break;
                case 'altitude':
                  formatted[key] = altitudeFromMeters(value, altitudeUnit).toFixed(2);
                  break;
                case 'distance':
                  formatted[key] = distanceFromMeters(value, distanceUnit).toFixed(2);
                  break;
                case 'volume':
                  formatted[key] = volumeFromLiters(value, volumeUnit).toFixed(2);
                  break;
                case 'hours':
                  formatted[key] = (value / 1000).toFixed(2);
                  break;
                default:
                  formatted[key] = value;
                  break;
              }
            }
          });
          return formatted;
        });
        Object.keys(positionAttributes).forEach((key) => {
          if (keySet.has(key)) {
            keyList.push(key);
            keySet.delete(key);
          }
        });
        setTypes([...keyList, ...keySet]);
        setItems(formattedPositions);
      }

      else if (type == "pdf") {
        const doc = new jsPDF('landscape', 'pt', 'a4');

        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const imgWidth = 150;
        const imgHeight = 150;
        const xPosition = (pageWidth - imgWidth) / 2;
        const yPosition = (pageHeight - imgHeight) / 2;

        doc.addImage(imgData, 'PNG', 50, 150, (pageWidth - imgWidth), 300); // Adjust position and size as needed
        const imgURL = `/api/media/user/${user?.id}/${user?.attributes?.userImage}`
        getBase64Image(imgURL, (base64Img) => {
          doc.addImage(base64Img, 'PNG', pageWidth - 60, 10, 50, 50);
          // Add some text to the PDF
          doc.setFontSize(18);
          doc.text(t("reportChart"), 14, 30);

          // Save the PDF
          doc.save(`${t("reportChart")}.pdf`);
        })
      }


    }


    else {
      throw Error(await response.text());
    }
  });

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportChart']}>
      <ReportFilter handleSubmit={handleSubmit} >
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('reportChartType')}</InputLabel>
            <Select
              label={t('reportChartType')}
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!items.length}
            >
              {types.map((key) => (
                <MenuItem key={key} value={key}>{positionAttributes[key]?.name || key}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </ReportFilter>
      {items.length > 0 && (
        <div className={classes.chart} ref={chartRef}>
          <ResponsiveContainer>
            <LineChart
              data={items}
              margin={{
                top: 10, right: 40, left: 0, bottom: 10,
              }}
            >
              <XAxis
                dataKey="fixTime"
                type="number"
                tickFormatter={(value) => formatTime(value, 'time', hours12)}
                domain={['dataMin', 'dataMax']}
                scale="time"
              />
              <YAxis
                type="number"
                tickFormatter={(value) => value.toFixed(2)}
                domain={[minValue - valueRange / 5, maxValue + valueRange / 5]}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip
                formatter={(value, key) => [value, positionAttributes[key]?.name || key]}
                labelFormatter={(value) => formatTime(value, 'seconds', hours12)}
              />
              <Line type="monotone" dataKey={type} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageLayout>
  );
};

export default ChartReportPage;
