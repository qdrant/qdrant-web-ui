import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CodeBlock, RunButton } from './CodeBlock';
import * as requestFromCodeMod from '../../CodeEditorWindow/config/RequesFromCode';
import { TutorialProvider } from '../../../context/tutorial-context';

const props = {
  children: {
    props: {
      className: 'language-json',
      children: '{\n  "name": "test"\n}',
      withRunButton: 'true',
    },
  },
};

const requestFromCodeSpy = vi.spyOn(requestFromCodeMod, 'requestFromCode').mockImplementation(
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'ok' });
      }, 100);
    })
);

describe('CodeBlock', () => {
  it('should render RunButton with given code', () => {
    render(
      <TutorialProvider>
        <RunButton code={props.children.props.children} />
      </TutorialProvider>
    );

    expect(screen.getByTestId('code-block-run')).toBeInTheDocument();
    expect(screen.getByText(/Run/)).toBeInTheDocument();
  });

  it('should call requestFromCode with given code', () => {
    render(
      <TutorialProvider>
        <RunButton code={props.children.props.children} />
      </TutorialProvider>
    );
    screen.getByTestId('code-block-run').click();

    expect(requestFromCodeSpy).toHaveBeenCalledWith('{\n  "name": "test"\n}', false);
  });

  it('should render CodeBlock with given code', () => {
    render(
      <TutorialProvider>
        <CodeBlock {...props} />
      </TutorialProvider>
    );

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(screen.getByTestId('code-block-pre')).toBeInTheDocument();
    expect(screen.getByTestId('code-block-run')).toBeInTheDocument();
    expect(screen.getAllByText(/{/).length).toBe(2);
    expect(screen.getAllByText(/"name": "test"/).length).toBe(2);
    expect(screen.getAllByText(/}/).length).toBe(2);
    expect(screen.getByText(/Run/)).toBeInTheDocument();
  });

  it('should render CodeBlock without run button', () => {
    const propsWithoutButton = structuredClone(props);
    propsWithoutButton.children.props.withRunButton = 'false';

    render(<CodeBlock {...propsWithoutButton} />);

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(screen.getByTestId('code-block-pre')).toBeInTheDocument();
    expect(screen.queryByTestId('code-block-run')).not.toBeInTheDocument();
  });

  it('should render an editor with given code if RunButton is present', () => {
    render(
      <TutorialProvider>
        <CodeBlock {...props} />
      </TutorialProvider>
    );

    expect(screen.queryByTestId('code-block-run')).toBeInTheDocument();
    expect(screen.queryByTestId('code-block-editor')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('{\n  "name": "test"\n}');
  });
});
