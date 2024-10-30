import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatAlarm, formatAltitude, formatBoolean, formatConsumption, formatCoordinate, formatCourse, formatDistance, formatHours, formatNumber, formatNumericHours, formatOdometer, formatPercentage, formatSpeed, formatTime, formatVoltage, formatVolume } from '../../common/util/formatter';
import { ConvertNumber } from './MakePdf';
import { getBase64Image } from './MakeLogo';
export async function MakePdf(t, pageName, devices, from, to, data, columns, new_columns, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences, imgURL) {
    let rows = [];
    await Promise.all(
        data.map(async (item) => {
            const row = await Row(item, columns, t, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences);
            rows.push(row);
        })
    );
    generatePDF(t, pageName, rows, devices, from, to, new_columns, hours12, imgURL)
}
async function Row(item, columns, t, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences) {
    let new_row = []
    await columns.map(column =>
        new_row.push(ConvertValue(item, column, t, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences))
    )
    return new_row
}

function ConvertValue(row, column, t, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences) {
    switch (column) {
        case 'fixTime':
        case 'deviceTime':
        case 'serverTime':
            return (formatTime(row[column], "seconds", hours12) == "an hour" ? t('anhour') : formatTime(row[column], "seconds", hours12) == "a minute" ? t("aminute") : formatTime(row[column], "seconds", hours12) == "a day" ? t("aday") : formatTime(row[column], "seconds", hours12) == "a week" ? t("aweek") : formatTime(row[column], "seconds", hours12) == "a month" ? t('amonth') : formatTime(row[column], "seconds", hours12)).replaceAll("month", t("month")).replaceAll("week", t("week")).replaceAll("day", t("day")).replaceAll("hour", t("hour")).replaceAll("minute", t("minute").replaceAll("second", t("second")).replaceAll("a few", t("afew")));
        case 'latitude':
            return formatCoordinate('latitude', row[column], coordinateFormat);
        case 'longitude':
            return formatCoordinate('longitude', row[column], coordinateFormat);
        case 'speed':
        case 'obdSpeed':
            return row[column] != null ? formatSpeed(row[column], speedUnit, t) : '';
        case 'course':
            return formatCourse(row[column]);
        case 'altitude':
            return formatAltitude(row[column], altitudeUnit, t);
        case 'power':
        case 'battery':
            return formatVoltage(row[column], t);
        case 'batteryLevel':
            return row[column] != null ? formatPercentage(row[column], t) : '';
        case 'volume':
            return row[column] != null ? formatVolume(row[column], volumeUnit, t) : '';
        case 'fuelConsumption':
            return row[column] != null ? formatConsumption(row[column], t) : '';
        case 'coolantTemp':
            return formatTemperature(row[column]);
        case 'alarm':
            return formatAlarm(row[column], t);
        case 'odometer':
        case 'serviceOdometer':
        case 'tripOdometer':
        case 'obdOdometer':
        case 'distance':
        case 'totalDistance':
            return row[column] != null ? formatDistance(row[column], distanceUnit, t) : '';
        case "startOdometer":
        case "endOdometer":
            return row[column] != null ? formatOdometer(row[column], distanceUnit, t) : '';
        case 'hours':
            return row[column] != null ? formatNumericHours(row[column], t) : '';
        case 'geofenceIds':
            return row[column].map((id) => geofences[id]?.name).join(', ');
        case "startTime":
        case "endTime":
            return formatTime(row[column], "minutes", hours12).replaceAll("month", t("month")).replaceAll("week", t("week")).replaceAll("day", t("day")).replaceAll("hour", t("hour")).replaceAll("minute", t("minute").replaceAll("second", t("second")).replaceAll("a few", t("afew")));

        case "averageSpeed":
        case "maxSpeed":
            return formatSpeed(row[column], speedUnit, t);
        case "duration":
            return (formatHours(row[column]) === "an hour" ? t('anhour') : formatTime(row[column], "seconds", hours12) == "a minute" ? t("aminute") : formatTime(row[column], "seconds", hours12) == "a day" ? t("aday") : formatTime(row[column], "seconds", hours12) == "a week" ? t("aweek") : formatTime(row[column], "seconds", hours12) == "a month" ? t("amonth") : formatHours(row[column]).replaceAll("month", t("month")).replaceAll("week", t("week")).replaceAll("day", t("day")).replaceAll("hour", t("hour")).replaceAll("minute", t("minute")).replaceAll("second", t("second")).replaceAll("a few", t("afew")));
        case "spentFuel":
            return formatVolume(row[column], volumeUnit, t);

        default:
            if (typeof row[column] === 'number') {
                return formatNumber(row[column]);
            } if (typeof row[column] === 'boolean') {
                return formatBoolean(row[column], t);
            }
            if (typeof row[column] === 'number') {
                return formatNumber(row[column]);
            } if (typeof row[column] === 'boolean') {
                return formatBoolean(row[column], t);
            }
            return row[column] || '';
    }

}

const generatePDF = (t, pageName, rows, devices, from, to, new_columns, hours12, imgURL) => {
    // Create a new instance of jsPDF

    const doc = new jsPDF('portrait', 'pt', 'a3');
    getBase64Image(imgURL, (base64Img) => {
        // Add Title
        doc.setFontSize(22);
        doc.text(pageName, 38, 20);

        // Add Subtitle
        doc.setFontSize(16);
        doc.text(`${t('deviceTitle')}: ${devices} `, 38, 35);
        doc.text(`${t('reportFrom')}: ${formatTime(from, 'seconds', hours12)} `, 38, 50);
        doc.text(`${t('reportTo')}: ${formatTime(to, 'seconds', hours12)} `, 38, 65);
        let pageCount = doc.internal.getNumberOfPages();
        doc.autoTable({
            head: [new_columns],
            body: rows,
            styles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 10,
                cellPadding: 5,
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                halign: 'center', // Centered header text

            },
            headStyles: {
                fillColor: [200, 200, 200], // Light gray background
                textColor: [0, 0, 0], // Black text
                fontSize: 12,
                fontStyle: 'bold', // Bold header text
                halign: 'center', // Centered header text
            },
            margin: { top: 75 },
            didDrawCell: (data) => {
                if (data.cell.section === 'body') {
                    // Custom cell styling if needed
                }
            },
            didDrawPage: () => {
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                doc.addImage(base64Img, 'PNG', pageWidth - 60, 10, 50, 50);
                // Add page number
                doc.setFontSize(10);
                doc.text(`${t("page")} ${doc.internal.getCurrentPageInfo().pageNumber} - ${pageCount}`, pageWidth - 250, pageHeight - 20);
            },
        });

        // Add Page Number
        // doc.setFontSize(10);
        // const totalPages = doc.internal.getNumberOfPages();
        // doc.text(`Page 1 of ${totalPages} `, 190, 287, { align: 'right' });

        // Save PDF

        doc.save(`${pageName}.pdf`);
    })
};
