import {
  Box,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { Button, Stack } from "@mui/material";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <>
      <Box p={24}>
        <Flex h={16} align="center">
          <Spacer />
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
        </Flex>
      </Box>

    </>
  );
}
