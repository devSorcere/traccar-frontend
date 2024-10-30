import AnchorIcon from "@mui/icons-material/Anchor";
import Battery20Icon from "@mui/icons-material/Battery20";
import Battery60Icon from "@mui/icons-material/Battery60";
import BatteryCharging20Icon from "@mui/icons-material/BatteryCharging20";
import BatteryCharging60Icon from "@mui/icons-material/BatteryCharging60";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import StopIcon from "@mui/icons-material/Stop";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import SensorsIcon from "@mui/icons-material/Sensors";
import SensorsOffIcon from "@mui/icons-material/SensorsOff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCarBattery } from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  Badge,
  IconButton,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useTranslation } from "../common/components/LocalizationProvider";
import {
  formatBoolean,
  formatPercentage,
  formatSpeed,
  formatNumber,
} from "../common/util/formatter";
import { useAdministrator } from "../common/util/permissions";
import { useAttributePreference } from "../common/util/preferences";
import { mapIconKey, mapIcons } from "../map/core/preloadImages";
import { ReactComponent as EngineIcon } from "../resources/images/data/engine.svg";
import { devicesActions, geofencesActions } from "../store";
import { useEffectAsync } from "../reactHelper";

const useStyles = makeStyles((theme) => ({
  icon: {
    display: "flex",
    width: "45px",
    height: "45px",
  },
  media: {
    display: "flex",
    width: "48px",
    height: "48px",
    borderRadius: "10%",
    objectFit: "cover",
  },
  batteryText: {
    fontSize: "0.75rem",
    fontWeight: "normal",
    lineHeight: "0.875rem",
  },
  key: {
    transform: "rotate(180deg)",
  },
  conatinerGrid: {
    display: "flex",
    flexDirection: "column",
    paddingLeft: 5,
    minWidth: "100%",
  },
  primaryText: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingLeft: 5,
    paddingRight: 2,
    width: "100%",
    minWidth: "100%",
  },
  secondaryTextTitle: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingLeft: 3,
    width: "100%",
    minWidth: "100%",
  },
  secondaryText: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    minWidth: "100%",
  },
  secondaryTextIcons: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    minWidth: "100%",
  },
  positive: {
    color: theme.palette.success.main,
  },
  medium: {
    color: theme.palette?.medium?.main,
  },
  negative: {
    color: theme.palette?.error?.main,
  },
  neutral: {
    color: theme.palette?.neutral?.main,
  },
  blinkingIcon: {
    animation: "$blink 1s infinite", // Aplica a animação de piscar no ícone que possuir a classe "blinkingIcon"
  },
  "@keyframes blink": {
    "20%": { opacity: 1 },
    "50%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
}));

const DeviceRow = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();

  const item = data[index];

  const position = useSelector((state) => state?.session?.positions[item.id]);

  const device = useSelector((state) => state?.devices?.items[item.id]);
  const fence = useSelector((state) => state.geofences.items);
  const deviceStatusCount = (isAnchor, deviceId) =>
    Object.values(fence).filter(
      (d) =>
        d.attributes?.isAnchor === isAnchor &&
        d.attributes?.deviceId === deviceId
    ).length;

  const deviceAnchorCount = deviceStatusCount(true, device?.id || null);
  const deviceNonAnchorCount = deviceStatusCount(false, device?.id || null);
  // Inicializa o estado anchorId com uma string vazia
  const [anchorId, setAnchorId] = useState("");

  useEffect(() => {
    // Função para encontrar o ID da cerca âncora para o dispositivo atual
    const findAnchorId = (isAnchor, deviceId) => {
      const anchors = Object.values(fence).filter(
        (d) =>
          d.attributes?.isAnchor === isAnchor &&
          d.attributes?.deviceId === deviceId
      );
      if (anchors.length > 0) {
        return anchors[0].id;
      }
      return ""; // Retorna uma string vazia caso não encontre nenhuma cerca correspondente
    };
    // Encontra o ID da cerca âncora para o dispositivo atual
    const deviceAnchorId = findAnchorId(true, device?.id || null);
    setAnchorId(deviceAnchorId); // Atualiza o estado anchorId com o ID da cerca âncora
  }, [fence]); // Executa sempre que device ou fence mudar

  const updateGeofence = async () => {
    try {
      const response = await fetch(`/api/geofences/`);
      if (response.ok) {
        const data = await response.json();
        dispatch(geofencesActions.refresh(data));
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.log("Erro ao buscar geocercas:", error);
      // Lidar com o erro de acordo com as necessidades da sua aplicação
    }
  };

  useEffect(() => {
    let isMounted = true; // Variável para controlar se o componente está montado

    const fetchData = async () => {
      if (isMounted) {
        await updateGeofence();
      }
    };

    const interval = setInterval(fetchData, 60000);

    return () => {
      clearInterval(interval);
      isMounted = false; // Marcar o componente como desmontado ao limpar o intervalo
    };
  }, [dispatch]); // Adicione qualquer dependência necessária para o useEffect

  const deviceImage = device?.attributes?.deviceImage;
  const deviceId = device?.uniqueId;


  const devicePrimary = useAttributePreference("devicePrimary", "name");
  const deviceSecondary = useAttributePreference("deviceSecondary", "");

  const primaryText = () => (
    <div className={classes?.primaryText}>{item[devicePrimary]}</div>
  );
  const secondaryText = () => (
    <div className={classes.conatinerGrid}>
      <div className={classes.primaryTextTitle}>
        {deviceSecondary && item[deviceSecondary] && `${item[deviceSecondary]}`}
      </div>
      <div className={classes.secondaryText}>
        {/* FORMATADO DATA E HORA PARA PORTUGUES */}
        {` ${moment(position?.fixTime).format(
          "DD/MM/YYYY HH:mm:ss"
        )} | ${formatSpeed(
          position?.speed || 0,
          position?.attributes?.speedUnit || "kmh",
          t
        )}`}
      </div>
      {/* {moment(positions[index].fixTime).format('DD/MM/YYYY HH:mm:ss')}  */}
      <div className={classes.secondaryTextIcons}>
        {/* INFORMAÇAO SOBRE SATELITES DO DISPOSITIVOS */}
        {(position?.attributes?.sat ||
          position?.attributes?.sat !== undefined) &&
          item?.status === "online" &&
          (position?.attributes?.sat !== undefined &&
            position?.attributes?.sat > 0 &&
            item?.status === "online" ? (
            <Tooltip title={position?.attributes?.sat}>
              <IconButton size="small">
                <SatelliteAltIcon
                  fontSize="small"
                  className={classes.positive}
                />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={position?.attributes?.sat}>
              <IconButton size="small">
                <SatelliteAltIcon
                  fontSize="small"
                  className={classes.negative}
                />
              </IconButton>
            </Tooltip>
          ))}
        {position?.attributes?.sat > 0 && item?.status !== "online" && (
          <Tooltip title={position?.attributes?.sat}>
            <IconButton size="small">
              <SatelliteAltIcon fontSize="small" className={classes.neutral} />
            </IconButton>
          </Tooltip>
        )}

        {item?.status === "online" ? (
          <Tooltip title="Online">
            <IconButton size="small">
              <SensorsIcon fontSize="small" className={classes.positive} />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Offline">
            <IconButton size="small">
              <SensorsOffIcon fontSize="small" className={classes.negative} />
            </IconButton>
          </Tooltip>
        )}
        {position?.attributes?.motion && item?.status === "online" ? (
          <Tooltip title="Em Movimento">
            <IconButton size="small">
              <KeyboardDoubleArrowRightIcon
                fontSize="small"
                className={classes.negative}
              />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Parado">
            <IconButton size="small">
              <StopIcon fontSize="small" className={classes.neutral} />
            </IconButton>
          </Tooltip>
        )}
        {deviceAnchorCount > 0 && (
          <Tooltip title="Âncora Ativada">
            <IconButton size="small">
              <AnchorIcon
                fontSize="small"
                width={20}
                height={20}
                className={classes.negative}
              />
            </IconButton>
          </Tooltip>
        )}
        {deviceAnchorCount <= 0 && (
          <Tooltip title="Âncora">
            <IconButton size="small">
              <AnchorIcon
                fontSize="small"
                width={20}
                height={20}
                className={classes.neutral}
              />
            </IconButton>
          </Tooltip>
        )}

        {(position?.attributes?.event === "jt" ||
          position?.attributes?.blocked === true ||
          position?.attributes?.out1 === true) &&
          item?.status === "online" && (
            <Tooltip title="Bloqueado">
              <IconButton size="small">
                <LockIcon fontSize="small" className={classes.negative} />
              </IconButton>
            </Tooltip>
          )}
        {(position?.attributes?.event === "kt" ||
          position?.attributes?.blocked === false ||
          position?.attributes?.out1 === false) &&
          item?.status === "online" && (
            <Tooltip title="Liberado">
              <IconButton size="small">
                <LockOpenIcon fontSize="small" color="success" />
              </IconButton>
            </Tooltip>
          )}
        {position?.attributes?.event !== "kt" &&
          position?.attributes?.event !== "jt" &&
          position?.attributes?.blocked !== true &&
          position?.attributes?.blocked !== false &&
          position?.attributes?.out1 !== true &&
          position?.attributes?.out1 !== false &&
          position?.protocol !== "osmand" &&
          item?.status === "online" && (
            <Tooltip title="Obtendo Status">
              <IconButton size="small">
                <LockIcon fontSize="small" className={classes.neutral} />
              </IconButton>
            </Tooltip>
          )}
        {item?.status !== "online" && position?.protocol !== "osmand" && (
          <Tooltip title="Obtendo Status">
            <IconButton size="small">
              <LockIcon fontSize="small" className={classes.neutral} />
            </IconButton>
          </Tooltip>
        )}
        {/* ALARME NATIVO TRACCAR */}
        {/*  {position?.attributes.hasOwnProperty('alarm') && item?.status === 'online' && (
          <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position?.attributes?.alarm, t)}`}>
            <IconButton size="small">
              <NotificationsActiveIcon fontSize="small" className={classes.negative} />
            </IconButton>
          </Tooltip>
        )} */}
        {(position?.attributes?.alarm === "powerCut" &&
          position?.attributes?.charge === false &&
          item?.status === "online") ||
          (position?.attributes?.alarm === "powerCut" &&
            (position?.attributes?.charge === false ||
              position?.attributes?.charge === undefined) &&
            item?.status === "online") ? (
          <Tooltip title="Alimentação Cortada">
            <IconButton size="small">
              <ReportProblemIcon
                fontSize="small"
                className={`${classes.negative} ${classes.blinkingIcon}`}
              />
            </IconButton>
          </Tooltip>
        ) : (
          ((position?.attributes?.alarm === "lowBattery" &&
            position?.attributes?.charge === false &&
            item?.status === "online") ||
            (position?.attributes?.charge === undefined &&
              position?.attributes?.batteryLevel < 30 &&
              item?.status === "online")) && (
            <Tooltip title="Bateria Baixa">
              <IconButton size="small">
                <ReportProblemIcon
                  fontSize="small"
                  className={`${classes.negative} ${classes.blinkingIcon}`}
                />
              </IconButton>
            </Tooltip>
          )
        )}
        {position?.attributes.hasOwnProperty("ignition") &&
          item?.status === "online" && (
            <Tooltip
              title={`${t("positionIgnition")}: ${formatBoolean(
                position?.attributes?.ignition,
                t
              )}`}
            >
              <IconButton size="small">
                {position?.attributes?.ignition ? (
                  <EngineIcon
                    width={20}
                    height={22}
                    className={classes.key}
                    style={{ color: "green" }}
                  />
                ) : (
                  <EngineIcon
                    width={20}
                    height={22}
                    className={classes.key}
                    style={{ color: "red" }}
                  />
                )}
              </IconButton>
            </Tooltip>
          )}
        {item?.status !== "online" && position?.protocol !== "osmand" && (
          <Tooltip
            title={`${t("positionIgnition")}: ${formatBoolean(
              position?.attributes?.ignition,
              t
            )}`}
          >
            <IconButton size="small">
              <EngineIcon
                width={20}
                height={22}
                className={classes.key}
                style={{ color: "grey" }}
              />
            </IconButton>
          </Tooltip>
        )}
        {/* EXIBE INFORMAÇÃO DE BATERIA */}
        {item?.status === "online" && position?.attributes?.batteryLevel && (
          <Tooltip
            title={`${t("positionBatteryLevel")}: ${formatPercentage(
              position?.attributes?.batteryLevel === 4000
                ? 100
                : position?.attributes?.batteryLevel
            )}`}
          >
            {/* <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position?.attributes?.batteryLevel === 4000 && position?.attributes?.charge ? 100 : position?.attributes?.batteryLevel)}`}> */}
            <IconButton size="small">
              {position?.attributes?.batteryLevel > 70 ? (
                position?.attributes?.charge ? (
                  <BatteryChargingFullIcon
                    fontSize="small"
                    className={classes.positive}
                  />
                ) : (
                  <BatteryFullIcon
                    fontSize="small"
                    className={classes.positive}
                  />
                )
              ) : position?.attributes?.batteryLevel > 30 ? (
                position?.attributes?.charge ? (
                  <BatteryCharging60Icon
                    fontSize="small"
                    className={classes.medium}
                  />
                ) : (
                  <Battery60Icon fontSize="small" className={classes.medium} />
                )
              ) : position?.attributes?.batteryLevel === undefined ? (
                position?.attributes?.charge === undefined ? (
                  <BatteryFullIcon
                    fontSize="small"
                    className={classes.neutral}
                  />
                ) : (
                  <BatteryFullIcon
                    fontSize="small"
                    className={classes.neutral}
                  />
                )
              ) : position?.attributes?.charge ? (
                <BatteryCharging20Icon
                  fontSize="small"
                  className={classes.negative}
                />
              ) : (
                <Battery20Icon fontSize="small" className={classes.negative} />
              )}
              {/* VERFICA SE BATERIA DO GT-06 ESTA COM 4000% E CORRIGE */}
              {position?.attributes?.batteryLevel && (
                <Typography sx={{ fontSize: 11 }}>
                  {formatPercentage(
                    position?.attributes?.batteryLevel === 4000
                      ? 100
                      : position?.attributes?.batteryLevel
                  )}
                </Typography>
              )}
            </IconButton>
          </Tooltip>
        )}
        {item?.status !== "online" && position?.attributes?.batteryLevel && (
          <Tooltip
            title={`${t("positionBatteryLevel")}: ${formatPercentage(
              position?.attributes?.batteryLevel === 4000
                ? 100
                : position?.attributes?.batteryLevel
            )}`}
          >
            <IconButton size="small">
              <BatteryFullIcon fontSize="small" className={classes.neutral} />
              {position?.attributes?.batteryLevel && (
                <Typography sx={{ fontSize: 11 }}>
                  {formatPercentage(
                    position?.attributes?.batteryLevel === 4000
                      ? 100
                      : position?.attributes?.batteryLevel
                  )}
                </Typography>
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* INICIO -  EXIBE INFORMAÇÃO DE BATERIA DO VEICULO PROTOCOLOS:  EASYTRACKER, J164G, NT20, E3+ */}
        {item?.status === "online" &&
          position?.protocol === "easytrack" &&
          position?.attributes?.power && (
            <Tooltip
              title={`${t("positionBatteryLevel")}: ${formatPercentage(
                position?.attributes?.power
              )}`}
            >
              <IconButton size="small">
                {position?.attributes?.power > 70 ? (
                  position?.attributes?.charge ? (
                    <BatteryChargingFullIcon
                      fontSize="small"
                      className={classes.positive}
                    />
                  ) : (
                    <BatteryFullIcon
                      fontSize="small"
                      className={classes.positive}
                    />
                  )
                ) : position?.attributes?.power > 30 ? (
                  position?.attributes?.charge ? (
                    <BatteryCharging60Icon
                      fontSize="small"
                      className={classes.medium}
                    />
                  ) : (
                    <Battery60Icon
                      fontSize="small"
                      className={classes.medium}
                    />
                  )
                ) : position?.attributes?.power === undefined ? (
                  position?.attributes?.charge === undefined ? (
                    <BatteryFullIcon
                      fontSize="small"
                      className={classes.neutral}
                    />
                  ) : (
                    <BatteryFullIcon
                      fontSize="small"
                      className={classes.neutral}
                    />
                  )
                ) : position?.attributes?.charge ? (
                  <BatteryCharging20Icon
                    fontSize="small"
                    className={classes.negative}
                  />
                ) : (
                  <Battery20Icon
                    fontSize="small"
                    className={classes.negative}
                  />
                )}
                {position?.attributes?.power && (
                  <Typography sx={{ fontSize: 11 }}>
                    {formatPercentage(position?.attributes?.power)}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          )}
        {/* INICIO -  EXIBE INFORMAÇÃO DE BATERIA DO dispositivo PROTOCOLOS:  SUNTECH */}
        {item?.status === "online" &&
          position?.protocol === "suntech" &&
          position?.attributes?.battery && (
            <Tooltip
              title={`${t("positionBatteryLevel")}: ${position?.attributes?.battery >= 4.06
                ? formatPercentage(position?.attributes?.battery ? 100 : "")
                : position?.attributes?.battery >= 4.06
                  ? formatPercentage(position?.attributes?.battery ? 93 : "")
                  : position?.attributes?.battery >= 3.97
                    ? formatPercentage(position?.attributes?.battery ? 74 : "")
                    : position?.attributes?.battery >= 3.89
                      ? formatPercentage(position?.attributes?.battery ? 58 : "")
                      : position?.attributes?.battery >= 3.83
                        ? formatPercentage(position?.attributes?.battery ? 42 : "")
                        : position?.attributes?.battery >= 3.75
                          ? formatPercentage(position?.attributes?.battery ? 26 : "")
                          : position?.attributes?.battery >= 2.75
                            ? formatPercentage(position?.attributes?.battery ? 13 : "")
                            : position?.attributes?.battery >= 1.5
                              ? formatPercentage(position?.attributes?.battery ? 7 : "")
                              : position?.attributes?.battery >= 0.75
                                ? formatPercentage(position?.attributes?.battery ? 3 : "")
                                : position?.attributes?.battery >= 0.5
                                  ? formatPercentage(position?.attributes?.battery ? 1 : "")
                                  : formatPercentage(position?.attributes?.battery ? 0 : "")
                }`}
            >
              <IconButton size="small">
                {position?.attributes?.battery > 4.0 ? (
                  position?.attributes?.power >= 11.5 ? (
                    <BatteryChargingFullIcon
                      fontSize="small"
                      className={classes.positive}
                    />
                  ) : (
                    <BatteryFullIcon
                      fontSize="small"
                      className={classes.positive}
                    />
                  )
                ) : position?.attributes?.battery > 3.5 ? (
                  position?.attributes?.power >= 11.5 ? (
                    <BatteryCharging60Icon
                      fontSize="small"
                      className={classes.medium}
                    />
                  ) : (
                    <Battery60Icon
                      fontSize="small"
                      className={classes.medium}
                    />
                  )
                ) : position?.attributes?.battery === undefined ? (
                  position?.attributes?.power === undefined ? (
                    <BatteryFullIcon
                      fontSize="small"
                      className={classes.neutral}
                    />
                  ) : (
                    <BatteryFullIcon
                      fontSize="small"
                      className={classes.neutral}
                    />
                  )
                ) : position?.attributes?.power >= 11.5 ? (
                  <BatteryCharging20Icon
                    fontSize="small"
                    className={classes.negative}
                  />
                ) : (
                  <Battery20Icon
                    fontSize="small"
                    className={classes.negative}
                  />
                )}
                {position?.attributes?.battery && (
                  <Typography sx={{ fontSize: 11 }}>
                    {position?.attributes?.battery >= 4.06
                      ? formatPercentage(
                        position?.attributes?.battery ? 100 : ""
                      )
                      : position?.attributes?.battery >= 4.06
                        ? formatPercentage(
                          position?.attributes?.battery ? 93 : ""
                        )
                        : position?.attributes?.battery >= 3.97
                          ? formatPercentage(
                            position?.attributes?.battery ? 74 : ""
                          )
                          : position?.attributes?.battery >= 3.89
                            ? formatPercentage(
                              position?.attributes?.battery ? 58 : ""
                            )
                            : position?.attributes?.battery >= 3.83
                              ? formatPercentage(
                                position?.attributes?.battery ? 42 : ""
                              )
                              : position?.attributes?.battery >= 3.75
                                ? formatPercentage(
                                  position?.attributes?.battery ? 26 : ""
                                )
                                : position?.attributes?.battery >= 2.75
                                  ? formatPercentage(
                                    position?.attributes?.battery ? 13 : ""
                                  )
                                  : position?.attributes?.battery >= 1.5
                                    ? formatPercentage(position?.attributes?.battery ? 7 : "")
                                    : position?.attributes?.battery >= 0.75
                                      ? formatPercentage(position?.attributes?.battery ? 3 : "")
                                      : position?.attributes?.battery >= 0.5
                                        ? formatPercentage(position?.attributes?.battery ? 1 : "")
                                        : formatPercentage(
                                          position?.attributes?.battery ? 0 : ""
                                        )}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          )}
        {item?.status !== "online" &&
          position?.protocol === "suntech" &&
          position?.attributes?.battery >= 0 && (
            <Tooltip
              title={`${t("positionBatteryLevel")}: ${position?.attributes?.battery >= 4.06
                ? formatPercentage(position?.attributes?.battery ? 100 : "")
                : position?.attributes?.battery >= 4.06
                  ? formatPercentage(position?.attributes?.battery ? 93 : "")
                  : position?.attributes?.battery >= 3.97
                    ? formatPercentage(position?.attributes?.battery ? 74 : "")
                    : position?.attributes?.battery >= 3.89
                      ? formatPercentage(position?.attributes?.battery ? 58 : "")
                      : position?.attributes?.battery >= 3.83
                        ? formatPercentage(position?.attributes?.battery ? 42 : "")
                        : position?.attributes?.battery >= 3.75
                          ? formatPercentage(position?.attributes?.battery ? 26 : "")
                          : position?.attributes?.battery >= 2.75
                            ? formatPercentage(position?.attributes?.battery ? 13 : "")
                            : position?.attributes?.battery >= 1.5
                              ? formatPercentage(position?.attributes?.battery ? 7 : "")
                              : position?.attributes?.battery >= 0.75
                                ? formatPercentage(position?.attributes?.battery ? 3 : "")
                                : position?.attributes?.battery >= 0.5
                                  ? formatPercentage(position?.attributes?.battery ? 1 : "")
                                  : formatPercentage(position?.attributes?.battery ? 0 : "")
                }`}
            >
              <IconButton size="small">
                <BatteryFullIcon fontSize="small" className={classes.neutral} />
                {position?.attributes?.battery >= 0 && (
                  <Typography sx={{ fontSize: 11 }}>
                    {position?.attributes?.battery >= 4.06
                      ? formatPercentage(
                        position?.attributes?.battery ? 100 : ""
                      )
                      : position?.attributes?.battery >= 4.06
                        ? formatPercentage(
                          position?.attributes?.battery ? 93 : ""
                        )
                        : position?.attributes?.battery >= 3.97
                          ? formatPercentage(
                            position?.attributes?.battery ? 74 : ""
                          )
                          : position?.attributes?.battery >= 3.89
                            ? formatPercentage(
                              position?.attributes?.battery ? 58 : ""
                            )
                            : position?.attributes?.battery >= 3.83
                              ? formatPercentage(
                                position?.attributes?.battery ? 42 : ""
                              )
                              : position?.attributes?.battery >= 3.75
                                ? formatPercentage(
                                  position?.attributes?.battery ? 26 : ""
                                )
                                : formatPercentage(
                                  position?.attributes?.battery ? 0 : ""
                                )}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          )}

        {/* easytracker */}
        {item?.status !== "online" &&
          position?.protocol === "easytrack" &&
          position?.attributes?.power && (
            <Tooltip
              title={`${t("positionBatteryLevel")}: ${formatPercentage(
                position?.attributes?.power
              )}`}
            >
              <IconButton size="small">
                <BatteryFullIcon fontSize="small" className={classes.neutral} />
                {position?.attributes?.power && (
                  <Typography sx={{ fontSize: 10 }}>
                    {formatPercentage(position?.attributes?.power)}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          )}

        {/* EXIBE INFORMAÇÃO DE TENSAO DO VEICULO PROTOCOLO EASYTRACKER, GT06, J16 */}
        {item?.status === "online" &&
          position?.attributes?.adc1 !== undefined &&
          position?.attributes?.adc1 >= 0 && (
            <Tooltip
              title={`Bateria do Veículo: ${formatNumber(
                position?.attributes?.adc1
              )}v`}
            >
              <IconButton size="small">
                {position?.attributes?.adc1 < 11.5 ? (
                  <FontAwesomeIcon
                    icon={faCarBattery}
                    className={classes.negative}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faCarBattery}
                    className={classes.positive}
                  />
                )}
                {position?.attributes?.adc1 >= 0 && (
                  <Typography sx={{ fontSize: 11, paddingLeft: 0.1 }}>
                    {`${formatNumber(position?.attributes?.adc1)}v`}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          )}
        {/* INICIO - EXIBE INFORMAÇÃO DE TENSAO DO VEICULO PROTOCOLOS: E3+, J16 */}
        {item?.status !== "online" &&
          position?.attributes?.adc1 !== undefined &&
          position?.attributes?.adc1 >= 0 && (
            <Tooltip
              title={`Bateria do Veículo: ${formatNumber(
                position?.attributes?.adc1
              )}v`}
            >
              <IconButton size="small">
                <FontAwesomeIcon
                  icon={faCarBattery}
                  className={classes.neutral}
                />
                {position?.attributes?.adc1 >= 0 && (
                  <Typography sx={{ fontSize: 11, paddingLeft: 0.5 }}>
                    {`${formatNumber(position?.attributes?.adc1)}v`}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          )}
        {/* EXIBE INFORMAÇÃO DE TENSAO DA BATERIA DO VEICULO PROTOCOLO suntech */}
        {item?.status === "online" &&
          position?.protocol === "suntech" &&
          position?.attributes?.power >= 0 &&
          position?.attributes?.power !== undefined && (
            <Tooltip
              title={`Bateria do Veículo: ${formatNumber(
                position?.attributes?.power
              )}v`}
            >
              <IconButton size="small">
                {position?.attributes?.power < 11.5 ? (
                  <FontAwesomeIcon
                    icon={faCarBattery}
                    className={classes.negative}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faCarBattery}
                    className={classes.positive}
                  />
                )}
                {position?.attributes?.power >= 0 && (
                  <Typography sx={{ fontSize: 11, paddingLeft: 0.5 }}>
                    {`${formatNumber(position?.attributes?.power)}v`}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          )}
        {/* INICIO - EXIBE INFORMAÇÃO DE TENSAO DA BATERIA DO VEICULO PROTOCOLOS: SUNTECH */}
        {item?.status !== "online" &&
          position?.protocol === "suntech" &&
          position?.attributes?.power >= 0 && (
            <Tooltip
              title={`Bateria do Veículo: ${formatNumber(
                position?.attributes?.power
              )}v`}
            >
              <IconButton size="small">
                <FontAwesomeIcon
                  icon={faCarBattery}
                  className={classes.neutral}
                />
                {position?.attributes?.power >= 0 && (
                  <Typography sx={{ fontSize: 11, paddingLeft: 0.5 }}>
                    {`${formatNumber(position?.attributes?.power)}v`}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          )}
      </div>
    </div>
  );

  return (
    <div style={style}>
      {/* NAO REMOVER ESSE style SENAO QUEBRA O GRID DA APLICAÇÃO, TRABALHO EM CONJUNTO COM DeviceList-itemSize={110} */}
      <ListItemButton
        key={item?.id}
        onClick={() => dispatch(devicesActions.selectId(item?.id))}
        disabled={!admin && item?.disabled}
        alignItems="center"
      >
        <ListItemAvatar>
          {/* INSERE A IMAGEM DO DISPOSITIVO NO GRID CASO POSSUA */}
          {deviceImage ? (
            <Avatar sx={{ width: 50, height: 50 }}>
              <img
                className={classes.media}
                src={`/api/media/${deviceId}/${deviceImage}`}
                alt={device?.name}
              />
            </Avatar>
          ) : (
            <Avatar sx={{ width: 50, height: 50, bgcolor: "transparent" }}>
              <Badge
                color={item.status === "online" ? "success" : "error"}
                variant="dot"
                overlap="circular"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <img
                  className={classes.icon}
                  src={mapIcons[mapIconKey(item?.category)][position?.attributes?.motion ? "info" : item.status === "online" ? "success" : "error"]}
                  alt="Icone do Dispositivo"
                />
              </Badge>
            </Avatar>
          )}
        </ListItemAvatar>

        <ListItemText
          primary={primaryText()}
          primaryTypographyProps={{ noWrap: true }}
          secondary={secondaryText()}
          secondaryTypographyProps={{ noWrap: true }}
        />
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
