import React, { useState, useRef } from "react";
import { Button, Box, Typography, TextField ,Stack} from "@mui/material";
import ErrorNotifier from "../ToastNotifications/ErrorNotifier"


const Menu = ({ handleEditorChange, code }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveNameText, setSaveNameText] = useState("");
  const [currentSavedCodes, setCurrentSavedCodes] = useState(localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []);


  function saveCode() {
    if (saveNameText !== "") {
      currentSavedCodes.push({ name: saveNameText, code: code, index: currentSavedCodes.length })
      localStorage.setItem("currentSavedCodes", JSON.stringify(currentSavedCodes));
      setCurrentSavedCodes(JSON.parse(localStorage.getItem("currentSavedCodes")))
      setSaveNameText("");
      return;
    }

    setHasError(true);
    setErrorMessage("Name is required")
    return;
  }
  function deleteSavedCode(index){
    currentSavedCodes.splice(index, 1);
    localStorage.setItem("currentSavedCodes", JSON.stringify(currentSavedCodes));
    setCurrentSavedCodes(JSON.parse(localStorage.getItem("currentSavedCodes")))
    return;

  }
  return (
    < >
      {hasError && <ErrorNotifier {...{ message: errorMessage, setHasError }} />}
      {/* {isSuccess && <SuccessNotifier {...{message: successMessage, setIsSuccess }}/> } */}
      <TextField
        placeholder="Name for save code"
        variant="standard"
        value={saveNameText}
        onChange={(e) => {
          setSaveNameText(e.target.value);
        }}
      />
      <Button onClick={saveCode}>Save Code</Button>
      <Box >
        {currentSavedCodes.length === 0 &&
          <Typography
            variant="body1"
            component="p"
            textAlign="center"
          >
            No saved code
          </Typography>
        }
        {currentSavedCodes.length > 0 &&
          currentSavedCodes.map((currentSavedCode,i) => {
            return (
              <Stack direction="row" spacing={2}>
              <Button key={currentSavedCode.index}  variant="outlined" color="success"onClick={() => handleEditorChange(currentSavedCode.code)}>  {currentSavedCode.name}</Button>
              <Button key={currentSavedCode.index}  variant="outlined" color="error" onClick={() => deleteSavedCode(i)}> Delete {currentSavedCode.name}</Button>
              </Stack>
            );
          })
        }
      </Box>
    </>
  );
};
export default Menu;