import * as React from 'react';
import { styled } from '@mui/material/styles';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import MuiPaper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MuiList from '@mui/material/List';
import MuiListItem from '@mui/material/ListItem';
import MuiDivider from '@mui/material/Divider';
import axios from 'axios';
import { CodeBlock } from './Common/CodeBlock';
import { Box, Chip } from '@mui/material';
import { requestFromCode } from './CodeEditorWindow/config/RequesFromCode';
import { bigIntJSON } from '../common/bigIntJSON';
import PropTypes from 'prop-types';

async function fetchNotifications() {
  try {
    const issues = await axios.get('/issues');
    return issues.data.result.issues;
  } catch (error) {
    console.log('error', error);
  }
}

const Paper = styled(MuiPaper)({
  transformOrigin: 'top right',
  backgroundImage: 'none',
});

const List = styled(MuiList)(({ theme }) => ({
  width: theme.spacing(90),
  maxHeight: 540,
  overflow: 'auto',
  padding: theme.spacing(1, 0),
}));

const ListItem = styled(MuiListItem)({
  display: 'flex',
  flexDirection: 'column',
});

const Loading = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: theme.spacing(3, 0),
}));

const Divider = styled(MuiDivider)(({ theme }) => ({
  margin: theme.spacing(1, 0),
}));

export default function Notifications() {
  const [open, setOpen] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [issues, setIssues] = React.useState([]);
  const [issuesCount, setIssuesCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetchNotifications().then((data) => {
      setIssues(data);
      setIssuesCount(data.length);
      setLoading(false);
    });
  }, []);

  const handleToggle = () => {
    if (open) {
      fetchNotifications().then((data) => {
        setIssues(data);
        setLoading(false);
      });
    }
    if (issuesCount > 0) {
      setIssuesCount(0);
    }
    setOpen((prevOpen) => !prevOpen);
    setTooltipOpen(false);
  };

  return (
    <React.Fragment>
      <Tooltip
        open={tooltipOpen}
        title={'toggleNotifications'}
        enterDelay={300}
        onOpen={() => {
          setTooltipOpen(!open);
        }}
        onClose={() => {
          setTooltipOpen(false);
        }}
      >
        <IconButton
          ref={anchorRef}
          aria-controls={open ? 'notifications-popup' : undefined}
          aria-haspopup="true"
          aria-label="unreadNotifications"
          data-ga-event-category="AppBar"
          data-ga-event-action="toggleNotifications"
          onClick={handleToggle}
          size="large"
        >
          <Badge color="error" badgeContent={issuesCount}>
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popper
        id="notifications-popup"
        anchorEl={anchorRef.current}
        open={open}
        placement="bottom-end"
        transition
        disablePortal
        role={undefined}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener
            onClickAway={() => {
              setOpen(false);
              setIssuesCount(0);
            }}
          >
            <Grow in={open} {...TransitionProps}>
              <Paper
                sx={(theme) =>
                  theme.palette.mode === 'dark'
                    ? {
                        mt: 0.5,
                        border: '1px solid',
                        borderColor: 'primaryDark.700',
                        boxShadow: `0px 4px 20px rgba(0, 0, 0, 0.5)`,
                      }
                    : {
                        mt: 0.5,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        boxShadow: `0px 4px 20px rgba(170, 180, 190, 0.3)`,
                      }
                }
              >
                <List>
                  {!loading ? (
                    issues.length > 0 ? (
                      issues.map((issue, index) => (
                        <React.Fragment key={issue.id}>
                          <Notification issue={issue} />
                          {index < issues.length - 1 ? <Divider /> : null}
                        </React.Fragment>
                      ))
                    ) : (
                      <ListItem>
                        <Typography color="text.secondary">No notifications</Typography>
                      </ListItem>
                    )
                  ) : (
                    <Loading>
                      <CircularProgress size={32} />
                    </Loading>
                  )}
                </List>
              </Paper>
            </Grow>
          </ClickAwayListener>
        )}
      </Popper>
    </React.Fragment>
  );
}

function Notification({ issue }) {
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleRun = (code) => {
    setLoading(true);
    requestFromCode(code, false)
      .then((res) => {
        setResult(() => bigIntJSON.stringify(res, null, 2));
        setLoading(false);
      })
      .catch((err) => {
        setError(() => bigIntJSON.stringify(err, null, 2));
        setLoading(false);
      });
  };

  return (
    <ListItem alignItems="flex-start">
      {loading ? (
        <CircularProgress size={32} />
      ) : result ? (
        <Typography color="green">{result}</Typography>
      ) : (
        <React.Fragment>
          {error ? (
            <CodeBlock
              codeStr={error.toString()}
              language="json"
              withRunButton={false}
              title="Error"
              editable={false}
            />
          ) : null}
          <Typography gutterBottom>
            <b>{issue.id}</b>
          </Typography>
          <Typography gutterBottom variant="body2" color="text.secondary">
            <span
              id="notification-message"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: issue.description }}
            />
          </Typography>
          {issue.solution && issue.solution.immediate && (
            <React.Fragment>
              <Typography gutterBottom variant="body2" color="text.secondary">
                <span
                  id="notification-message"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: issue.solution.immediate.message }}
                />
              </Typography>
              <Box
                sx={{
                  width: '100%',
                }}
              >
                <CodeBlock
                  codeStr={`${issue.solution.immediate.action.method} ${issue.solution.immediate.action.uri}
${JSON.stringify(issue.solution.immediate.action.body, null, 2)}`}
                  language="json"
                  withRunButton={true}
                  onRun={handleRun}
                  title="Solution"
                  editable={false}
                />
              </Box>
            </React.Fragment>
          )}
          {issue.solution && issue.solution.immediate_choice && (
            <React.Fragment>
              <Typography gutterBottom variant="body" color="text.secondary">
                Choose one of the following solutions:
              </Typography>
              {issue.solution.immediate_choice.map((choice, index) => (
                <React.Fragment key={index}>
                  <Typography gutterBottom variant="body2" color="text.secondary">
                    <span
                      id="notification-message"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: choice.message }}
                    />
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                    }}
                  >
                    <CodeBlock
                      codeStr={`${choice.action.method} ${choice.action.uri}
${JSON.stringify(choice.action.body, null, 2)}`}
                      language="json"
                      withRunButton={true}
                      onRun={handleRun}
                      title="Solution"
                      editable={false}
                    />
                  </Box>
                  {index < issue.solution.immediate_choice.length - 1 ? (
                    <Divider sx={
                      {width: '100%'}
                    }>
                      <Chip label="OR" size="small" />
                    </Divider>
                  ) : null}
                </React.Fragment>
              ))}
            </React.Fragment>
          )}

          {issue.timestamp && (
            <Typography variant="caption" color="text.secondary">
              {new Date(issue.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          )}
        </React.Fragment>
      )}
    </ListItem>
  );
}

Notification.propTypes = {
  issue: PropTypes.any,
};
