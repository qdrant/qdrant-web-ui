import { Box, CssBaseline } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

theme.typography.h3 = {
    fontSize: '1rem',
    fontWeight: '500'
};

function Footer() {
    return (
        <Box component="div" sx={{width: '100%', backgroundColor: 'rgb(18,18,19,0.5)'}}>
            <CssBaseline/>
            <Box component="div" 
                sx={{
                    minWidth: '100%',
                    
                    display : "flex",
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    padding: '50px 0'
                }}
            >
                <Box varient='div'  sx={{display : "flex", flexDirection: 'column' }}>
                    <Box component="span"  sx={{fontWeight: '550', display: 'flex', justifyContent: 'flex-start', marginBottom: '10px'}}>Product</Box>
                    <Box component="span"  >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true}  sx={{display: 'flex', justifyContent: 'flex-start'}}><CheckCircleRoundedIcon style={{marginRight: '10px'}}/>Use Case</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><CheckCircleRoundedIcon style={{marginRight: '10px'}}/>Solutions</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><CheckCircleRoundedIcon style={{marginRight: '10px'}}/>Demos</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><CheckCircleRoundedIcon style={{marginRight: '10px'}}/>Benchmarks</Typography>
                        </ThemeProvider>
                    </Box>
                </Box>
                <Box varient='div'  sx={{display : "flex", flexDirection: 'column' }}>
                    <Box component="span"  sx={{fontWeight: '550', display: 'flex', justifyContent: 'flex-start', marginBottom: '10px'}}>Community</Box>
                    <Box component="span"  >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true}  sx={{display: 'flex', justifyContent: 'flex-start'}}><GitHubIcon style={{marginRight: '10px'}}/>GitHub</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><FacebookIcon style={{marginRight: '10px'}}/>Facebook</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><TwitterIcon style={{marginRight: '10px'}}/>Twitter</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><MailIcon style={{marginRight: '10px'}}/>ContactUs</Typography>
                        </ThemeProvider>
                    </Box>
                </Box>
                <Box varient='div'  sx={{display : "flex", flexDirection: 'column' }}>
                    <Box component="span"  sx={{fontWeight: '550', display: 'flex', justifyContent: 'flex-start', marginBottom: '10px'}}>Company</Box>
                    <Box component="span"  >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true}  sx={{display: 'flex', justifyContent: 'flex-start'}}><CheckCircleRoundedIcon style={{marginRight: '10px'}}/>Jobs</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><CheckCircleRoundedIcon style={{marginRight: '10px'}}/>Privacy Policy</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><CheckCircleRoundedIcon style={{marginRight: '10px'}}/>Terms</Typography>
                        </ThemeProvider>
                    </Box>
                    <Box component="span" >
                        <ThemeProvider theme={theme}>
                            <Typography variant="h3" gutterBottom={true} sx={{display: 'flex', justifyContent: 'flex-start'}} ><CheckCircleRoundedIcon style={{marginRight: '10px'}}/>Credits</Typography>
                        </ThemeProvider>
                    </Box>
                </Box>
            </Box>
            <Box varient='div' >
                <Link href="https://github.com/qdrant/qdrant" target="_blank" style={{marginRight: '20px'}}> <GitHubIcon style={{ color: 'white', fontSize: '2rem' }}/> </Link>
                <Link href="https://qdrant.to/linkedin" target="_blank" style={{marginRight: '20px'}}><LinkedInIcon style={{ color: 'white', fontSize: '2rem' }}/></Link>
                <Link href="https://qdrant.to/linkedin" target="_blank" style={{marginRight: '20px'}}><TwitterIcon style={{ color: 'white', fontSize: '2rem' }}/></Link>
                <Link href="https://qdrant.to/facebook" target="_blank" ><FacebookIcon style={{color: 'white', fontSize: '2rem'}}/></Link>
            </Box>
        </Box>
    );
}

export default Footer;