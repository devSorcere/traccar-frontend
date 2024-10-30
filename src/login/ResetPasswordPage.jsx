import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Snackbar,
  IconButton,
  Input,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginLayout from "./LoginLayout";
import { useTranslation } from "../common/components/LocalizationProvider";
import useQuery from "../common/util/useQuery";
import { snackBarDurationShortMs } from "../common/util/duration";
import { useCatch } from "../reactHelper";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoImage from "./LogoImage";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    fontSize: theme.spacing(3),
    fontWeight: 500,
    marginLeft: theme.spacing(1),
    textTransform: "uppercase",
  },
}));

const ResetPasswordPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const query = useQuery();
  const theme = useTheme();

  const token = query.get("passwordReset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();

    if (email === "" || token === "") {
      toast.error("Preencha o campo corretamente", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    let response;
    if (!token) {
      response = await fetch("/api/password/reset", {
        method: "POST",
        body: new URLSearchParams(`email=${encodeURIComponent(email)}`),
      });
    } else {
      response = await fetch("/api/password/update", {
        method: "POST",
        body: new URLSearchParams(
          `token=${encodeURIComponent(token)}&password=${encodeURIComponent(
            password
          )}`
        ),
      });
    }
    if (response.ok) {
      setSnackbarOpen(true);
    } else {
      throw Error(await response.text());
    }
  });

  return (
    <LoginLayout>
      <div className={classes.container}>
        <div className={classes.header}>
          <IconButton color="primary" onClick={() => navigate("/login")}>
            <ArrowBackIcon sx={{ color: "white" }} />
          </IconButton>
          <Typography className={classes.title} color="white">
            {t("loginReset")}
          </Typography>
        </div>
        {!token ? (
          <Input
            variant="outlined"
            required
            type="email"
            label={t("userEmail")}
            name="email"
            value={email}
            autoComplete="email"
            placeholder="Email"
            onChange={(event) => setEmail(event.target.value)}
            sx={{
              backgroundColor: "transparent",
              color: "white",
              borderBottom: "1px solid white",
            }}
          />
        ) : (
          <Input
            variant="outlined"
            required
            label={t("userPassword")}
            name="password"
            value={password}
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          //disabled={!/(.+)@(.+)\.(.{2,})/.test(email) && !password}
          fullWidth
        >
          {t("loginReset")}
        </Button>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => navigate("/login")}
        autoHideDuration={snackBarDurationShortMs}
        message={!token ? t("loginResetSuccess") : t("loginUpdateSuccess")}
      />
      <ToastContainer theme="dark" />
    </LoginLayout>
  );
};

export default ResetPasswordPage;
