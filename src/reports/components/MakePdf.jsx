import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatAlarm, formatAltitude, formatBoolean, formatConsumption, formatCoordinate, formatCourse, formatDistance, formatHours, formatNumber, formatNumericHours, formatOdometer, formatPercentage, formatSpeed, formatTime, formatVoltage, formatVolume } from '../../common/util/formatter';
import AddressValue from '../../common/components/AddressValue';
import { getBase64Image } from './MakeLogo';
export async function MakePdf(t, pageName, devices, from, to, data, columns, new_columns, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences, imgURL, drivers) {
    let rows = [];
    await Promise.all(
        data.map(async (item) => {
            const row = await Row(item, columns, t, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences, drivers);
            rows.push(row);
        })
    );
    generatePDF(t, pageName, rows, devices, from, to, new_columns, hours12, imgURL)
}
async function Row(item, columns, t, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences, drivers) {
    let new_row = []
    await columns.map(column =>
        new_row.push(ConvertValue(item, column, t, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences, drivers))
    )
    return new_row
}

function ConvertValue(row, column, t, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences, drivers) {
    switch (column) {
        case 'fixTime':
        case 'deviceTime':
        case 'serverTime':
            // aminute
            return (formatTime(row[column], "seconds", hours12) == "an hour" ? t('anhour') : formatTime(row[column], "seconds", hours12) == "a minute" ? t("aminute") : formatTime(row[column], "seconds", hours12) == "a day" ? t("aday") : formatTime(row[column], "seconds", hours12) == "a week" ? t("aweek") : formatTime(row[column], "seconds", hours12) == "a month" ? t('amonth') : formatTime(row[column], "seconds", hours12)).replaceAll("month", t("month")).replaceAll("week", t("week")).replaceAll("day", t("day")).replaceAll("hour", t("hour")).replaceAll("minute", t("minute")).replaceAll("second", t("second")).replaceAll("a few", t("afew"));
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
            return row.attributes[column] != null ? formatPercentage(row.attributes[column], t) : '';
        case 'volume':
            return row[column] != null ? formatVolume(row[column], volumeUnit, t) : '';
        case 'fuelConsumption':
            return row[column] != null ? formatConsumption(row[column], t) : '';
        case 'coolantTemp':
            return formatTemperature(row[column]);
        case 'alarm':
            return formatAlarm(row[column], t);
        case 'driverUniqueId':
    
            return drivers.filter(driver => driver.uniqueId === row.attributes[column]).length > 0 ? drivers.filter(driver => driver.uniqueId === row.attributes[column])[0].name : "";
        case 'odometer':
        case 'serviceOdometer':
        case 'tripOdometer':
        case 'obdOdometer':
        case 'distance':
        case 'totalDistance':
            return row.attributes[column] != null ? formatDistance(row.attributes[column], distanceUnit, t) : '';
        case 'hours':
            return row.attributes[column] != null ? formatNumericHours(row.attributes[column], t).replaceAll("month", t("month")).replaceAll("week", t("week")).replaceAll("day", t("day")).replaceAll("hour", t("hour")).replaceAll("minute", t("minute")).replaceAll("second", t("second")).replaceAll("a few", t("afew")) : '';
        case 'geofenceIds':
            if (row[column])
                return row[column].map((id) => geofences[id]?.name).join(', ');
            else return ""
        case "startTime":
        case "endTime":
            return formatTime(row[column], "minutes", hours12).replaceAll("month", t("month")).replaceAll("week", t("week")).replaceAll("day", t("day")).replaceAll("hour", t("hour")).replaceAll("minute", t("minute")).replaceAll("second", t("second")).replaceAll("a few", t("afew"));
        case "startOdometer":
        case "endOdometer":
        case "distance":
            return formatOdometer(row[column], distanceUnit, t);
        case "averageSpeed":
        case "maxSpeed":
            return formatSpeed(row[column], speedUnit, t);
        case "result":
            return row.attributes[column] === "RELAY 0 OK" ? t("positionUnlocked") : row.attributes[column] === "RELAY 1 OK" ? t("positionBlocked") : row.attributes[column];
        case "duration":
        case "engineHours":
            return (formatHours(row[column]) === "an hour" ? t('anhour') : formatHours(row[column]) === "a minute" ? t("aminute") : formatHours(row[column]) === "a day" ? t("aday") : formatHours(row[column]) === "a month" ? t("a month") : formatHours(row[column]) === "a week" ? t("aweek") : formatHours(row[column])).replaceAll("day", t("day")).replaceAll("month", t("month")).replaceAll("week", t("week")).replaceAll("hour", t("hour")).replaceAll("minute", t("minute")).replaceAll("second", t("second")).replaceAll("a few", t("afew"));
        case "spentFuel":
            return formatVolume(row[column], volumeUnit, t);
        case 'address':
            return row[column];

        default:
            if (typeof row[column] === 'number') {
                return formatNumber(row[column]);
            } if (typeof row[column] === 'boolean') {
                return formatBoolean(row[column], t);
            }
            if (typeof row.attributes[column] === 'number') {
                return formatNumber(row.attributes[column]);
            } if (typeof row.attributes[column] === 'boolean') {
                return formatBoolean(row.attributes[column], t);
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
                // Add page number
                doc.addImage(base64Img, 'PNG', pageWidth - 60, 10, 50, 50);
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

export function ConvertNumber(input) {
    // Remove the 'km' part and convert to a number
    let number = parseFloat(input.replace(' km', ''));

    // Format the number with commas
    let formattedNumber = number.toLocaleString();

    // Reattach 'km' and log the result
    let result = `${formattedNumber} km`;
}
