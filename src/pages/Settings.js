import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import { useSettings } from "../context/settings";
import SaveIcon from "@mui/icons-material/Save";

const DEFAULT_SETTINGS = {
  apiURL: "",
  apiKey: "",
};

const isValidURL = (userInputURL) => {
  try {
    let urlCheck = new URL(userInputURL);
    if (urlCheck.protocol !== "http:" && urlCheck.protocol !== "https:") {
      return "Please provide a valid Protocol: (Http or Https)";
    }
  } catch (e) {
    return "Invalid URL";
  }

  return "";
};

const Settings = () => {
  const { settings, setSettings } = useSettings();
  const [settingForm, setSettingForm] = useState(DEFAULT_SETTINGS);
  const [toast, setToast] = useState(false);
  const error = isValidURL(settingForm.apiURL);
  console.log(error);
  useEffect(() => {
    setSettingForm({
      ...settings,
    });
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (error) {
      setToast(true);
      return;
    }
    let apiURL = new URL(settingForm.apiURL); //Clean URL
    setSettings({ ...settingForm, apiURL: apiURL.toString() });
    setToast(true);
  };

  const handleChange = (e) => {
    const { value, name } = e.target;

    setSettingForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4" fontWeight={"bold"}>
              Settings
            </Typography>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  id="api-endpoint"
                  label="API Endpoint"
                  name="apiURL"
                  required
                  error={!!error}
                  helperText={error}
                  value={settingForm.apiURL}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  id="api-key"
                  label="API Key"
                  name="apiKey"
                  placeholder="Enter Qdrant API Key. Leave blank for local deployment."
                  value={settingForm.apiKey}
                  onChange={handleChange}
                />
              </FormControl>
              <Button
                type="submit"
                sx={{ m: 1 }}
                variant="outlined"
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </form>
          </Stack>
        </Container>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={toast}
          autoHideDuration={6000}
          onClose={() => setToast(false)}
        >
          {error ? (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          ) : (
            <Alert severity="success" sx={{ width: "100%" }}>
              Settings saved successfully!
            </Alert>
          )}
        </Snackbar>
      </Box>
    </>
  );
};

export default Settings;
