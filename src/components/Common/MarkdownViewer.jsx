import { useTheme } from '@mui/material';
import { Box } from '@mui/system';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import sanitizeHtml from 'sanitize-html';
import '../../lib/github-markdown.css';

const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

export default function MarkdownViewer({ children }) {
  const theme = useTheme();
  const html = useMemo(() => {
    const unSanitized = marked.parse(children);
    const sanitized = sanitizeHtml(unSanitized, {
      allowedAttributes: {
        a: ['href'],
        code: ['class'],
        span: ['class'],
      },
      allowedTags: [...sanitizeHtml.defaults.allowedTags, 'details', 'summary'],
    });
    return sanitized;
  }, []);
  return (
    <Box
      className="markdown-body"
      data-theme={theme.palette.mode}
      width="100%"
      dangerouslySetInnerHTML={{ __html: html }}
      sx={{ background: '#0000' }}
    />
  );
}

MarkdownViewer.propTypes = {
  children: PropTypes.string,
};
