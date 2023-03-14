
import { Button, Stack, Box } from "@mui/material";
import SearchBar from "./SearchBar";
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function Navbar() {
  return (
    < >
      <Box >
        <Box sx={{ display: 'flex' }} align="center" >
          <Box>
            <>
              <Stack direction={"row"} spacing={2}>
                <SearchBar />
                <Button ><MailIcon /> </Button>
                <Button ><AccountCircle /></Button>
                <Button><NotificationsIcon /></Button>
              </Stack>
            </>
          </Box>
        </Box>
      </Box>

    </>
  );
}
