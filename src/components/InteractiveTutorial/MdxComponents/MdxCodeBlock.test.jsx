import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MdxCodeBlock } from './MdxCodeBlock';
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
  it('should render CodeBlock with given code', () => {
    render(
      <TutorialProvider>
        <MdxCodeBlock {...props} />
      </TutorialProvider>
    );

    const codeBlock = screen.getByTestId('code-block');

    expect(codeBlock).toBeInTheDocument();
    expect(screen.getByTestId('code-block-pre')).toBeInTheDocument();
    expect(screen.getByTestId('code-block-run')).toBeInTheDocument();

    const textContent = codeBlock.textContent;
    const occurrences = (textContent.match(/"name": "test"/g) || []).length;

    expect(screen.getAllByText(/{/).length).toBe(2);
    expect(occurrences).toBe(2);
    expect(screen.getAllByText(/}/).length).toBe(2);

    expect(screen.getByText(/Run/)).toBeInTheDocument();
  });

  it('should render CodeBlock without run button', () => {
    const propsWithoutButton = structuredClone(props);
    propsWithoutButton.children.props.withRunButton = 'false';

    render(<MdxCodeBlock {...propsWithoutButton} />);

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(screen.getByTestId('code-block-pre')).toBeInTheDocument();
    expect(screen.queryByTestId('code-block-run')).not.toBeInTheDocument();
  });

  it('should render an editor with given code if RunButton is present', () => {
    render(
      <TutorialProvider>
        <MdxCodeBlock {...props} />
      </TutorialProvider>
    );

    expect(screen.queryByTestId('code-block-run')).toBeInTheDocument();
    expect(screen.queryByTestId('code-block-editor')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('{\n  "name": "test"\n}');
  });
});
