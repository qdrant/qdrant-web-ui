import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import MainContent from "../MainContent/MainContent";
import Footer from "../Footer/Footer";

function Home() {
  return (
    <Box sx={{ flexGrow: 1 }} width="100%">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Header />
        </Grid>
        <Grid item xs={5} md={3} margin="auto">
          <Sidebar />
        </Grid>
        <Grid item xs={12} md={9}>
          <MainContent />
        </Grid>
        <Grid item xs={12}>
          <Footer />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
