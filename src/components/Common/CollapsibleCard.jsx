import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardHeader, Collapse, Tooltip } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Card with a heading-style header and an expand/collapse control next to the title.
 * Clicking the title or chevron toggles the body. Header actions stay visible when collapsed.
 *
 * @param {Object} props - component props
 * @param {React.ReactNode} props.title - card header title
 * @param {React.ReactNode} [props.action] - extra header actions
 * @param {React.ReactNode} props.children - collapsible body content
 * @param {boolean} [props.defaultExpanded=true] - initial expanded state
 * @return {JSX.Element} collapsible card
 */
const CollapsibleCard = ({ title, action, children, defaultExpanded = true, ...other }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => setExpanded((value) => !value);

  return (
    <Card elevation={0} {...other}>
      <CardHeader
        title={
          <Box
            component="button"
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            sx={{
              appearance: 'none',
              border: 0,
              background: 'none',
              p: 0,
              m: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'inherit',
            }}
          >
            {title}
            <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'text.primary',
                  p: 0.5,
                }}
              >
                {expanded ? <ChevronUp size="1.25rem" /> : <ChevronDown size="1.25rem" />}
              </Box>
            </Tooltip>
          </Box>
        }
        variant="heading"
        sx={{ flexGrow: 1 }}
        action={action}
      />
      <Collapse in={expanded} timeout="auto">
        {children}
      </Collapse>
    </Card>
  );
};

CollapsibleCard.propTypes = {
  title: PropTypes.node.isRequired,
  action: PropTypes.node,
  children: PropTypes.node,
  defaultExpanded: PropTypes.bool,
};

export default CollapsibleCard;
