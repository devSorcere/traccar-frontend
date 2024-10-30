import React, { Fragment, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import ReportFilter from "./components/ReportFilter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import PositionValue from "../common/components/PositionValue";
import ColumnSelect from "./components/ColumnSelect";
import usePositionAttributes from "../common/attributes/usePositionAttributes";
import { useCatch, useEffectAsync } from "../reactHelper";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import MapRoutePoints from "../map/MapRoutePoints";
import MapPositions from "../map/MapPositions";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import scheduleReport from "./common/scheduleReport";
import { MakePdf } from "./components/MakePdf";
import { useAttributePreference, usePreference } from "../common/util/preferences";

const RouteReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();
  const user = useSelector(state => state.session.user)
  const positionAttributes = usePositionAttributes(t);
  const devices = useSelector((state) => state?.devices?.items);
  const server = useSelector((state) => state.session.server);
  const watherMark = server?.attributes?.attributeWaterMark; // variavel para inserir marca d'agua no relatorio
  const selectDdeviceIds = useSelector((state) => state.devices.selectedIds);
  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const coordinateFormat = usePreference('coordinateFormat');
  const hours12 = usePreference('twelveHourFormat');
  const [available, setAvailable] = useState([]);
  const geofences = useSelector((state) => state.geofences.items);
  const [columns, setColumns] = useState([
    "fixTime",
    "latitude",
    "longitude",
    "speed",
    "address",
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const selectedColumns = columns;

  const onMapPointClick = useCallback(
    (positionId) => {
      setSelectedItem(items.find((it) => it.id === positionId));
    },
    [items, setSelectedItem]
  );
  const [drivers, setDrivers] = useState([]);
  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/drivers");
      if (response.ok) {
        setDrivers(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, []);
  const handleSubmit = useCatch(async ({ deviceIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    const qtdDevices = deviceIds.length; /* Envia quantidade de dispositivos no relatório */
    deviceIds.forEach((deviceId) => query.append("deviceId", deviceId));

    if (type === "export") {
      window.location.assign(`/api/reports/route/xlsx?${query.toString()}`);
    } else if (type === "pdf") {

      let selectDevice = [];
      await Promise.all(
        selectDdeviceIds.map((id) => {
          selectDevice.push(devices[id].name)
        })
      )
      let new_columns = [];
      await Promise.all(
        columns.map(async (item) => {
          new_columns.push(positionAttributes[item]?.name || item);
        })
      );
      const imgURL = `/api/media/user/${user?.id}/${user?.attributes?.userImage}`
      MakePdf(t, t("reportRoute"), selectDevice, from, to, items, columns, new_columns, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences, imgURL, drivers);

    } else if (type === "mail") {
      const response = await fetch(
        `/api/reports/route/mail?${query.toString()}`
      );
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/route?${query.toString()}`, {
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          const keySet = new Set();
          const keyList = [];
          data.forEach((position) => {
            Object.keys(position).forEach((it) => keySet.add(it));
            Object.keys(position.attributes).forEach((it) => keySet.add(it));
          });
          ["id", "deviceId", "outdated", "network", "attributes"].forEach(
            (key) => keySet.delete(key)
          );
          Object.keys(positionAttributes).forEach((key) => {
            if (keySet.has(key)) {
              keyList.push(key);
              keySet.delete(key);
            }
          });
          setAvailable(
            [...keyList, ...keySet].map((key) => [
              key,
              positionAttributes[key]?.name || key,
            ])
          );
          setItems(data);
          // routesPDF(data, registers, from, to, devices, qtdDevices);
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = "route";
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate("/reports/scheduled");
    }
  });

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportRoute"]}
    >
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {[...new Set(items.map((it) => it.deviceId))].map((deviceId) => {
                const positions = items.filter(
                  (position) => position.deviceId === deviceId
                );
                return (
                  <Fragment key={deviceId}>
                    <MapRoutePath positions={positions} />
                    <MapRoutePoints
                      positions={positions}
                      onClick={onMapPointClick}
                    />
                  </Fragment>
                );
              })}
              <MapPositions positions={[selectedItem]} titleField="fixTime" />
            </MapView>
            <MapCamera positions={items} />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter
              handleSubmit={handleSubmit}
              handleSchedule={handleSchedule}
              multiDevice
            >
              <ColumnSelect
                columns={columns}
                setColumns={setColumns}
                columnsArray={available}
                rawValues
                disabled={!items.length}
              />
            </ReportFilter>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                <TableCell>{t("sharedDevice")}</TableCell>
                {columns.map((key) => (
                  <TableCell key={key}>
                    {positionAttributes[key]?.name || key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.slice(0, 4000).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className={classes.columnAction} padding="none">
                      {selectedItem === item ? (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedItem(null)}
                        >
                          <GpsFixedIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedItem(item)}
                        >
                          <LocationSearchingIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>{devices[item.deviceId].name}</TableCell>
                    {columns.map((key) => (
                      <TableCell key={key}>
                        <PositionValue
                          drivers={drivers}
                          position={item}
                          property={item.hasOwnProperty(key) ? key : null}
                          attribute={item.hasOwnProperty(key) ? null : key}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableShimmer columns={columns.length + 2} startAction />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <ToastContainer />
    </PageLayout>
  );
};

export default RouteReportPage;

