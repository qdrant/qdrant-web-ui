
import { Button, Stack,Box } from "@mui/material";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <>
      <Box p={24}>
        <Box sx={{ display: 'flex' }} align="center">
          <Box>
              <>
                <Stack direction={"row"} alignItems="baseline" spacing={2}>
                  <SearchBar/>
                  <Button 
                    variant="contained" 

                  >
                    Button 1
                  </Button>
                  <Button 
                    variant="contained"

                  >
                    Button 2 
                  </Button>
                  <Button
                    size="small"
                  >
                    Button 4
                  </Button>
                </Stack>
              </>
          </Box>
        </Box>
      </Box>

    </>
  );
}
