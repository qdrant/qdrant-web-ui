import { CssBaseline, AppBar, Box, Container} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';    
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';    

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  }));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
  
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

function Header() {
  return (
    <>
      <CssBaseline/>
      <AppBar position='fixed' sx={{backgroundColor: 'rgb(40 44 52 / 91%)', zIndex: 2}}>
        <Container sx={{ padding: '10px 0',display: 'flex' ,flexDirection: 'row', justifyContent: 'space-between'}}>   
          <Box>
            <a href="/" >
                <img src="qdrant_logo.png" alt="" 
                    height={35}
                    align="center"
                    />
            </a>
          </Box>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
          </Search>
        </Container>
      </AppBar>
    </>
  );
}

export default Header;