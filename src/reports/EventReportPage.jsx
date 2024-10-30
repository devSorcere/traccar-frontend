import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
  IconButton,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import { useSelector } from "react-redux";
import { formatSpeed, formatTime } from "../common/util/formatter";
import ReportFilter from "./components/ReportFilter";
import { prefixString } from "../common/util/stringUtils";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import usePersistedState from "../common/util/usePersistedState";
import ColumnSelect from "./components/ColumnSelect";
import { useCatch, useEffectAsync } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import {
  useAttributePreference,
  usePreference,
} from "../common/util/preferences";
import usePositionAttributes from "../common/attributes/usePositionAttributes";
import MapView from "../map/core/MapView";
import MapGeofence from "../map/MapGeofence";
import MapPositions from "../map/MapPositions";
import MapCamera from "../map/MapCamera";
import scheduleReport from "./common/scheduleReport";
import { MakePdf } from "./components/MakeOtherPdf";

const columnsArray = [
  ["eventTime", "positionFixTime"],
  ["type", "sharedType"],
  ["geofenceId", "sharedGeofence"],
  ["maintenanceId", "sharedMaintenance"],
  ["attributes", "commandData"],
];
const columnsMap = new Map(columnsArray);

const EventReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();
  const user = useSelector(state => state.session.user)
  const positionAttributes = usePositionAttributes(t);
  const devices = useSelector((state) => state.devices.items);
  const server = useSelector((state) => state.session.server);
  const watherMark = server?.attributes?.attributeWaterMark;
  const selectDdeviceIds = useSelector((state) => state.devices.selectedIds);
  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const coordinateFormat = usePreference('coordinateFormat');
  const hours12 = usePreference('twelveHourFormat');
  const geofences = useSelector((state) => state.geofences.items);

  const [allEventTypes, setAllEventTypes] = useState([
    ["allEvents", "eventAll"],
  ]);

  const [columns, setColumns] = usePersistedState("eventColumns", [
    "eventTime",
    "type",
    "attributes",
  ]);
  const [eventTypes, setEventTypes] = useState(["allEvents"]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [position, setPosition] = useState(null);
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


  useEffectAsync(async () => {
    if (selectedItem) {
      const response = await fetch(
        `/api/positions?id=${selectedItem.positionId}`
      );
      if (response.ok) {
        const positions = await response.json();
        if (positions.length > 0) {
          setPosition(positions[0]);
        }
      } else {
        throw Error(await response.text());
      }
    } else {
      setPosition(null);
    }
  }, [selectedItem]);

  useEffectAsync(async () => {
    const response = await fetch("/api/notifications/types");
    if (response.ok) {
      const types = await response.json();
      setAllEventTypes([
        ...allEventTypes,
        ...types.map((it) => [it.type, prefixString("event", it.type)]),
      ]);
    } else {
      throw Error(await response.text());
    }
  }, []);

  const handleSubmit = useCatch(async ({ deviceId, from, to, type }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    async function pdf() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/reports/events?${query.toString()}`,
          {
            headers: { Accept: "application/json" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setItems(data);
          if (data.length > 0) {
            const registers = data.length; /* Envia quantidade de registros para o relatório */

            await eventsPDF(
              data,
              registers,
              watherMark,
              from,
              to,
              devices,
              geofences,
              geofences,
              positionAttributes,
              t
            );
          } else {
            toast.error(
              "Nenhum resultado encontrado para o período informado!",
              {
                position: toast.POSITION.TOP_RIGHT,
              }
            );
          }
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
    eventTypes.forEach((it) => query.append("type", it));
    if (type === "export") {
      window.location.assign(`/api/reports/events/xlsx?${query.toString()}`);
    } else if (type === "mail") {
      const response = await fetch(
        `/api/reports/events/mail?${query.toString()}`
      );
      if (!response.ok) {
        throw Error(await response.text());
      }
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
          new_columns.push(t(columnsMap.get(item) === "commandData" ? "comando" : columnsMap.get(item)));
        })
      );
      const imgURL = `/api/media/user/${user?.id}/${user?.attributes?.userImage}`
      MakePdf(t, t("reportEvents"), selectDevice, from, to, items, columns, new_columns, coordinateFormat, speedUnit, altitudeUnit, volumeUnit, distanceUnit, hours12, geofences, imgURL, drivers);
    } else {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/reports/events?${query.toString()}`,
          {
            headers: { Accept: "application/json" },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setItems(data);
          } else {
            toast.error(
              "Nenhum resultado encontrado para o período informado!",
              {
                position: toast.POSITION.TOP_RIGHT,
              }
            );
          }
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = "events";
    if (eventTypes[0] !== "allEvents") {
      report.attributes.types = eventTypes.join(",");
    }
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate("/reports/scheduled");
    }
  });

  const formatValue = (item, key) => {
    switch (key) {
      case "eventTime":
        return formatTime(item[key], "seconds", hours12);
      case "type":
        return t(prefixString("event", item[key]));
      case "geofenceId":
        if (item[key] > 0) {
          const geofence = geofences[item[key]];
          return geofence && geofence.name;
        }
        return null;
      case "maintenanceId":
        return item[key] > 0 ? item[key] > 0 : null;
      case "attributes":
        switch (item.type) {
          case "alarm":
            return t(prefixString("alarm", item.attributes.alarm));
          case "deviceOverspeed":
            return formatSpeed(item.attributes.speed, speedUnit, t);
          case "driverChanged":
            return drivers.filter(driver => driver.uniqueId === item.attributes.driverUniqueId).length > 0 ? drivers.filter(driver => driver.uniqueId === item.attributes.driverUniqueId)[0].name : "";
          // case 'driverUniqueId':item.attributes.driverUniqueId;
          //   return drivers.filter(driver => driver.uniqueId === item.attributes).length > 0 ? drivers.filter(driver => driver.uniqueId === item.attributes)[0].name : "";
          case "media":
            return (
              <Link
                href={`/api/media/${devices[item.deviceId]?.uniqueId}/${item.attributes.file
                  }`}
                target="_blank"
              >
                {item.attributes.file}
              </Link>
            );
          case "commandResult":
            return item.attributes.result;
          default:
            return "";
        }
      default:
        return item[key];
    }
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportEvents"]}
    >
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {position && (
                <MapPositions positions={[position]} titleField="fixTime" />
              )}
            </MapView>
            {position && (
              <MapCamera
                latitude={position.latitude}
                longitude={position.longitude}
              />
            )}
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter
              handleSubmit={handleSubmit}
              handleSchedule={handleSchedule}
            >
              <div className={classes.filterItem}>
                <FormControl fullWidth>
                  <InputLabel>{t("reportEventTypes")}</InputLabel>
                  <Select
                    label={t("reportEventTypes")}
                    value={eventTypes}
                    onChange={(event, child) => {
                      let values = event.target.value;
                      const clicked = child.props.value;
                      if (values.includes("allEvents") && values.length > 1) {
                        values = [clicked];
                      }
                      setEventTypes(values);
                    }}
                    multiple
                  >
                    {allEventTypes.map(([key, string]) => (
                      <MenuItem key={key} value={key}>
                        {t(string)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <ColumnSelect
                columns={columns}
                setColumns={setColumns}
                columnsArray={columnsArray}
              />
            </ReportFilter>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                {columns.map((key) => (
                  <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className={classes.columnAction} padding="none">
                      {item.positionId ? (
                        selectedItem === item ? (
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
                        )
                      ) : (
                        ""
                      )}
                    </TableCell>
                    {columns.map((key) => (
                      <TableCell key={key}>{formatValue(item, key)}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableShimmer columns={columns.length + 1} />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <ToastContainer />
    </PageLayout>
  );
};

export default EventReportPage;
