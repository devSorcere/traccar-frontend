import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  TextField,
  Typography,
  Snackbar,
  IconButton,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginLayout from "./LoginLayout";
import { useTranslation } from "../common/components/LocalizationProvider";
import { snackBarDurationShortMs } from "../common/util/duration";
import { useCatch } from "../reactHelper";
import { sessionActions } from "../store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    color: "white",
  },
}));

const RegisterPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const server = useSelector((state) => state.session.server);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = useCatch(async () => {
    if (name === "" || email === "" || password === "") {
      toast.error("Preenchas todos os campos", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
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
          {!server.newServer && (
            <IconButton color="primary" onClick={() => navigate("/login")}>
              <ArrowBackIcon color="secondary" />
            </IconButton>
          )}
          <Typography className={classes.title} color="primary">
            {t("loginRegister")}
          </Typography>
        </div>
        <TextField
          required
          label={t("sharedName")}
          name="name"
          value={name}
          autoComplete="name"
          placeholder="Nome"
          autoFocus
          onChange={(event) => setName(event.target.value)}
          sx={{
            backgroundColor: "transparent",
            color: "white",
            borderBottom: "1px solid white",
          }}
        />
        <TextField
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
        <TextField
          required
          label={t("userPassword")}
          name="password"
          value={password}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          sx={{
            backgroundColor: "transparent",
            color: "white",
            borderBottom: "1px solid white",
          }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          fullWidth
        >
          {t("loginRegister")}
        </Button>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => {
          dispatch(
            sessionActions.updateServer({ ...server, newServer: false })
          );
          navigate("/login");
        }}
        autoHideDuration={snackBarDurationShortMs}
        message={t("loginCreated")}
      />
      <ToastContainer />
    </LoginLayout>
  );
};

export default RegisterPage;
