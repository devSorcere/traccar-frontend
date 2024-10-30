import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LinkIcon from "@mui/icons-material/Link";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useCatch, useEffectAsync } from "../reactHelper";
import { formatBoolean, formatTime } from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import { useManager } from "../common/util/permissions";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import { usePreference } from "../common/util/preferences";
import useSettingsStyles from "./common/useSettingsStyles";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const UsersPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();
  const now = moment();
  const months = now.month() + 1;
  const years = now.year();

  const hours12 = usePreference("twelveHourFormat");
  const server = useSelector((state) => state.session.server);
  const URLWHATSAPP = server?.attributes?.whatsAppServerInvoiceURL;
  const COMPANYINVOICEWHATSAPP =
    server?.attributes?.whatsAppServerInvoiceCOMPANY;
  const MSGINVOICEWHATSAPP = server?.attributes?.whatsAppServerInvoiceMSG;
  const PIXINVOICEWHATSAPP = server?.attributes?.whatsAppServerInvoicePIX;
  const BANKINVOICEWHATSAPP = server?.attributes?.whatsAppServerInvoiceBANK;

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = useCatch(async (userId) => {
    const response = await fetch(`/api/session/${userId}`);
    if (response.ok) {
      window.location.replace("/");
    } else {
      throw Error(await response.text());
    }
  });

  const actionLogin = {
    key: "login",
    title: t("loginLogin"),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: "connections",
    title: t("sharedConnections"),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const shareImageViaWhatsApp = async (
    name,
    invoiceDate,
    amount,
    whatsApp,
    coin
  ) => {
    if (!name || !invoiceDate || !amount || !whatsApp || !coin) {
      toast.error(
        "Verifique os dados do cliente, Telefone, vencimento, valor, moeda, nome.",
        {
          position: toast.POSITION.TOP_RIGHT,
        }
      );
      return;
    }

    let newAmount;
    if (coin === "R$") {
      newAmount = amount?.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL",
      });
    } else if (coin === "USD") {
      newAmount = amount?.toLocaleString("en-IN", {
        style: "currency",
        currency: "USD",
      });
    } else {
      newAmount = amount?.toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
      });
    }

    const message = `\n${COMPANYINVOICEWHATSAPP} \n\nOlá ${name}, \n\n${MSGINVOICEWHATSAPP}
    \n\nVENCIMENTO: ${invoiceDate}/${months}/${years} \n\nVALOR:  ${newAmount} 
    \nAqui vai nosso PIX para facilitar o pagamento. \n\n${PIXINVOICEWHATSAPP} 
    \n\n${BANKINVOICEWHATSAPP}`;

    try {
      const response = await fetch(`${URLWHATSAPP}/api/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: whatsApp,
          message: message,
        }),
      });

      if (response.ok) {
        const responseText = await response.text();
        toast.success("Mensagem enviada com sucesso", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("Não foi possivel enviar mensagem!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      toast.error("Erro na requisição:", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsUsers"]}
    >
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t("sharedFile")}</TableCell>
            <TableCell>{t("sharedId")}</TableCell>
            <TableCell>{t("sharedName")}</TableCell>
            <TableCell>{t("userEmail")}</TableCell>
            <TableCell>{t("sharedCpf")}</TableCell>
            <TableCell>{t("sharedRg")}</TableCell>
            <TableCell>{t("sharedPhone")}</TableCell>
            <TableCell>{t("sharedWhatsApp")}</TableCell>
            <TableCell>{t("userAdmin")}</TableCell>
            <TableCell>{t("sharedDisabled")}</TableCell>
            <TableCell>{t("userExpirationTime")}</TableCell>
            <TableCell>{t("userInvoiceDate")}</TableCell>
            <TableCell>{t("userCoin")}</TableCell>
            <TableCell>{t("userAmountInvoice")}</TableCell>
            <TableCell>{"MSG"}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.filter(filterByKeyword(searchKeyword)).map((item) => (
              <TableRow key={item?.id}>
                <TableCell>
                  <ListItemAvatar>
                    {item?.attributes?.userImage ? (
                      <Avatar
                        src={`/api/media/user/${item?.id}/${item?.attributes?.userImage}`}
                        alt={items?.name}
                      />
                    ) : (
                      <Avatar />
                    )}
                  </ListItemAvatar>
                </TableCell>
                <TableCell>{item?.id}</TableCell>
                <TableCell>{item?.name}</TableCell>
                <TableCell>{item?.email}</TableCell>
                <TableCell>{item?.cpf}</TableCell>
                <TableCell>{item?.rg}</TableCell>
                <TableCell>{item?.phone}</TableCell>
                <TableCell>{item?.whatsApp}</TableCell>
                <TableCell>{formatBoolean(item?.administrator, t)}</TableCell>
                <TableCell>{formatBoolean(item?.disabled, t)}</TableCell>
                <TableCell>
                  {formatTime(item?.expirationTime, "date", hours12)}
                </TableCell>
                <TableCell>
                  {item?.invoiceDate
                    ? `${item?.invoiceDate}/${months}/${years}`
                    : ""}
                </TableCell>
                <TableCell>{item?.coin}</TableCell>
                <TableCell>
                  {item?.coin === "EUR"
                    ? item?.amount?.toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })
                    : item?.coin === "USD"
                    ? item?.amount?.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "USD",
                      })
                    : item?.amount?.toLocaleString("pt-br", {
                        style: "currency",
                        currency: "BRL",
                      })}
                </TableCell>
                <TableCell>
                  <Tooltip title="Enviar lembrete de mensalidade">
                    <IconButton
                      onClick={() =>
                        shareImageViaWhatsApp(
                          item?.name,
                          item?.invoiceDate,
                          item?.amount,
                          item?.whatsApp,
                          item?.coin
                        )
                      }
                    >
                      <WhatsAppIcon color="success" />
                    </IconButton>
                  </Tooltip>
                </TableCell>

                <TableCell className={classes.columnAction}>
                  <CollectionActions
                    itemId={item?.id}
                    editPath="/settings/user"
                    endpoint="users"
                    setTimestamp={setTimestamp}
                    customActions={
                      manager
                        ? [actionLogin, actionConnections]
                        : [actionConnections]
                    }
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={6} endAction />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/user" />
      <ToastContainer />
    </PageLayout>
  );
};

export default UsersPage;
