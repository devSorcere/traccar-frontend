import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  useMediaQuery,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  LinearProgress,
  Box,
  Input,
  InputAdornment,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import ReactCountryFlag from "react-country-flag";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import MailIcon from "@mui/icons-material/Mail";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { sessionActions } from "../store";
import {
  useLocalization,
  useTranslation,
} from "../common/components/LocalizationProvider";
import LoginLayout from "./LoginLayout";
import usePersistedState from "../common/util/usePersistedState";
import {
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from "../common/components/NativeInterface";
import { useCatch, useEffectAsync } from "../reactHelper";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "../resources/images/logo.png";
const useStyles = makeStyles((theme) => ({
  options: {
    position: "fixed",
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: "white",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  extraContainer: {
    display: "flex",
    gap: theme.spacing(2),
  },
  registerButton: {
    minWidth: "unset",
  },
  resetPassword: {
    cursor: "pointer",
    textAlign: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    color: "white",
  },
  input: {
    padding: "5px, 0, 5px, 0",
  },
}));

const LoginPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    country: values[1].country,
    name: values[1].name,
  }));
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false);
  const [users, setUsers] = useState([])
  const [email, setEmail] = usePersistedState("loginEmail", "");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState()
  const registrationEnabled = useSelector(
    (state) => state.session.server.registration
  );
  const languageEnabled = useSelector(
    (state) => !state.session.server.attributes["ui.disableLoginLanguage"]
  );
  const changeEnabled = useSelector(
    (state) => !state.session.server.attributes.disableChange
  );
  const emailEnabled = useSelector(
    (state) => state.session.server.emailEnabled
  );
  const openIdEnabled = useSelector(
    (state) => state.session.server.openIdEnabled
  );
  const openIdForced = useSelector(
    (state) =>
      state.session.server.openIdEnabled && state.session.server.openIdForce
  );
  const companyInfo = useSelector((state) => state.session.company)
  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector(
    (state) => state.session.server.announcement
  );
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const generateLoginToken = async () => {
    if (nativeEnvironment) {
      let token = "";
      try {
        const expiration = moment().add(6, "months").toISOString();
        const response = await fetch("/api/session/token", {
          method: "POST",
          body: new URLSearchParams(`expiration=${expiration}`),
        });
        if (response.ok) {
          token = await response.text();
        }
      } catch (error) {
        token = "";
      }
      nativePostMessage(`login|${token}`);
    }
  };


  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      toast.error("Preencha todos os campos!", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        body: new URLSearchParams(
          `email=${encodeURIComponent(email)}&password=${encodeURIComponent(
            password
          )}`
        ),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate("/");
      } else {
        throw Error(await response.text());
      }
    }
    catch (error) {
      toast.error(`Usuário ou senha Incorretos!`, {
        position: toast.POSITION.TOP_CENTER,
      });
      setFailed(true);
      setPassword("");
    }
  };

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  if (openIdForced) {
    handleOpenIdLogin();
    return <LinearProgress />;
  }

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(
      `/api/session?token=${encodeURIComponent(token)}`
    );
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate("/");
    } else {
      throw Error(await response.text());
    }
  });

  const handleSpecialKey = (e) => {
    if (e.keyCode === 13 && email && password) {
      handlePasswordLogin(e);
    }
  };

  const handleOpenIdLogin = () => {
    document.location = "/api/session/openid/auth";
  };
  const GotoCompany = () => {
    navigate("/company")
  }

  useEffect(() => nativePostMessage("authentication"), []);

  return (
    <React.Fragment>

      <LoginLayout logo={logo}>
        <div className={classes.options}></div>
        <div className={classes.container}>
          <Input
            variant="outlined"
            required
            error={failed}
            label={t("userEmail")}
            name="email"
            value={email}
            autoComplete="email"
            autoFocus={!email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyUp={handleSpecialKey}
            helperText={failed && "Usuário ou senha Incorretos!"}
            color="error"
            placeholder="Email"
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <MailIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: "transparent",
              color: "white",
              borderBottom: "1px solid white",
            }}
          />
          {/* ALETRADO DE TEXFIELD PARA INPUT E INSERIDO FUÇÃO DE EXIBIR SENHA */}
          <Input
            required
            variant="outlined"
            error={failed}
            label={t("userPassword")}
            name="password"
            value={password}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            autoFocus={!!email}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={handleSpecialKey}
            id="standard-adornment-password"
            placeholder="Password"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  color="default"
                  sx={{ color: "white" }}
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            }
            sx={{
              backgroundColor: "transparent",
              color: "white",
              borderBottom: "1px solid white",
            }}
          />
          <Button
            onClick={handlePasswordLogin}
            onKeyUp={handleSpecialKey}
            variant="contained"
            color="success"
            sx={{ border: "1px solid white" }}
          // disabled={!email || !password}
          >
            {t("loginLogin")}
          </Button>
          {openIdEnabled && (
            <Button
              onClick={() => handleOpenIdLogin()}
              variant="contained"
              color="secondary"
            >
              {t("loginOpenId")}
            </Button>
          )}
          <div className={classes.extraContainer}>
            {languageEnabled && (
              <FormControl fullWidth>
                {/*  <InputLabel>{t("loginLanguage")}</InputLabel> */}
                <Select
                  label={t("loginLanguage")}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  sx={{
                    backgroundColor: "transparent",
                    color: "white",
                    border: "1px solid white",
                  }}
                >
                  {languageList.map((it) => (
                    <MenuItem key={it.code} value={it.code}>
                      <Box component="span" sx={{ mr: 1 }}>
                        <ReactCountryFlag countryCode={it.country} svg />
                      </Box>
                      {it.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          {emailEnabled && (
            <Link
              onClick={() => navigate("/reset-password")}
              className={classes.resetPassword}
              underline="none"
              variant="caption"
            >
              {t("loginReset")}
            </Link>
          )}
        </div>
        {useMediaQuery(theme.breakpoints.up("lg")) && (
          <Snackbar
            sx={{}}
            open={!!announcement && !announcementShown}
            message={announcement}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setAnnouncementShown(true)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <Paper
              sx={{
                backgroundColor: "green",
                color: "white",
                padding: 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {announcement}
            </Paper>
          </Snackbar>
        )}
        <ToastContainer theme="dark" />
      </LoginLayout>
    </React.Fragment>
  );
};

export default LoginPage;
