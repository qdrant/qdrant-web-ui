import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";

const CollectionCard = (props) => {
  const { collection } = props;

  function resDataView(data,name,spaces) {

  const text= Object.keys(data).map(key => {
  if (data[key] && typeof data[key] === "object") {
    return resDataView(data[key] ,key,spaces+20)
  }
  else {
      return (
        <>
      <Box style={{paddingLeft:spaces+20}} p={1}>
      <Typography variant="subtitle1"  display="inline" fontWeight={600} >
         {key} :  
      </Typography>
      <Typography variant="subtitle2"  display="inline" color="text.secondary" >
         {'\t'} {data[key]!==null?data[key]:"NULL"}
      </Typography>
      </Box>
      <Divider />
    </>
      )
  }
})

    return (
    <>
      <Typography  style={{paddingLeft:spaces}} p={1} variant="subtitle1"  fontWeight={600} >
        {name} :
      </Typography>
      <Divider />

      {text}
    </> 
    )
  }

  return (
    <>
      <Card
        elevation={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <CardContent>
          {resDataView(collection,"startups",0)}
        </CardContent>
      </Card>

    </>
  );
};

CollectionCard.propTypes = {
  collection: PropTypes.object.isRequired,
};

export default CollectionCard;
