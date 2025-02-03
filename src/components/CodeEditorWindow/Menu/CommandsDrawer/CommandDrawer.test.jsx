import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommandsDrawer from './CommandsDrawer';
import { act } from 'react';

const openApiJson = {
  paths: {
    '/metrics': {
      get: {
        summary: 'Collect Prometheus metrics data',
        tags: ['service'],
      },
    },
    '/cluster': {
      get: {
        tags: ['cluster'],
        summary: 'Get cluster status info',
      },
    },
    '/cluster/peer/{peer_id}': {
      delete: {
        tags: ['cluster'],
        summary: 'Remove peer from the cluster',
      },
    },
  },
};

function createFetchResponse(data) {
  return { json: () => new Promise((resolve) => resolve(data)) };
}

const fetch = vi.fn();
fetch.mockResolvedValue(createFetchResponse(openApiJson));
vi.stubGlobal('fetch', fetch);

describe('CommandsDrawer', () => {
  it('should render CommandsDrawer with fetched data', async () => {
    const commands = [];

    await act(async () => {
      render(
        <CommandsDrawer
          open={true}
          toggleDrawer={() => {}}
          handleInsertCommand={(command) => {
            commands.push(command);
          }}
        />
      );
    });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'GET collections');

    expect(screen.getByTestId('commands-table')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByTestId('commands-table').firstChild.children.length).toBe(3), {
      timeout: 1500,
    });

    function getNthRow(n) {
      const row = screen.getByTestId('commands-table').children[0].children[n];

      return {
        method: row.children[1].children[0].children[0].children[0].textContent,
        command: row.children[1].children[0].children[1].children[0].textContent,
        description: row.children[1].children[0].children[1].children[2].textContent,
      };
    }

    for (let i = 0; i < 3; i++) {
      const { method, command, description } = getNthRow(i);
      const openApiCommand = Object.keys(openApiJson.paths)[i];
      const openApiJsonPath = openApiJson.paths[openApiCommand];

      expect(method).toBe(Object.keys(openApiJsonPath)[0].toUpperCase());
      expect(command).toBe(openApiCommand.replace(/{/g, '<').replace(/}/g, '>'));
      expect(description).toBe(openApiJsonPath[Object.keys(openApiJsonPath)[0]].summary);
    }
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});
