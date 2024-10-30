import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useEffectAsync } from "../reactHelper";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import { usePreference } from "../common/util/preferences";
import { formatTime } from "../common/util/formatter";
import { useDeviceReadonly } from "../common/util/permissions";
import useSettingsStyles from "./common/useSettingsStyles";
import { mapIconKey, mapIcons, mapOriginalIcons } from "../map/core/preloadImages";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  icon: {
    display: "flex",
    width: "35px",
    height: "35px",
  },
  media: {
    display: "flex",
    width: "35px",
    height: "35px",
    objectFit: "cover",
  },
}));
const DevicesPage = () => {
  const classe = useStyles();
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);

  const hours12 = usePreference("twelveHourFormat");

  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const positions = useSelector((state) => state?.session?.positions)



  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/devices");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const actionConnections = {
    key: "connections",
    title: t("sharedConnections"),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "deviceTitle"]}
    >
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t("sharedFile")}</TableCell>
            <TableCell>{t("sharedId")}</TableCell>
            <TableCell>{t("sharedName")}</TableCell>
            <TableCell>{t("deviceIdentifier")}</TableCell>
            <TableCell>{t("groupParent")}</TableCell>
            <TableCell>{t("sharedPhone")}</TableCell>
            <TableCell>{t("deviceModel")}</TableCell>
            <TableCell>{t("deviceContact")}</TableCell>
            <TableCell>{t("userExpirationTime")}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.filter(filterByKeyword(searchKeyword)).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <ListItemAvatar>
                    {item?.attributes?.deviceImage ? (
                      <Avatar
                        variant="circular"
                        className={classe.media}
                        src={`/api/media/${item?.uniqueId}/${item?.attributes?.deviceImage}`}
                        alt={item?.name}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 45,
                          height: 45,
                          bgcolor: "transparent",
                          border: `1px solid ${item.status === "online" ? "green" : "red"
                            }`,
                        }}
                      >
                        <img
                          className={classe.icon}
                          src={mapIcons[mapIconKey(item?.category)][positions?.[items.id]?.attributes?.motion ? "info" : item.status === "online" ? "success" : "error"]}
                          // src={mapOriginalIcons[mapIconKey(item?.category)]}
                          alt="Icone do Dispositivo"
                        />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                </TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.uniqueId}</TableCell>
                <TableCell>
                  {item.groupId ? groups[item.groupId]?.name : null}
                </TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.contact}</TableCell>
                <TableCell>
                  {formatTime(item.expirationTime, "date", hours12)}
                </TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/device"
                    endpoint="devices"
                    setTimestamp={setTimestamp}
                    customActions={[actionConnections]}
                    readonly={deviceReadonly}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={7} endAction />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/device" />
    </PageLayout>
  );
};

export default DevicesPage;
