import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VectorsInfo from './VectorsInfo';

const VECTORS = {
  size: 512,
  distance: 'Cosine',
};

describe('collection vectors info', () => {
  it('should render VectorsInfo with given data', () => {
    render(<VectorsInfo vectors={VECTORS} />);
    expect(screen.getByTestId('vectors-info')).toBeTruthy();
    expect(screen.getByTestId('index-quality-check-button')).toBeTruthy();
    expect(screen.getByTestId('vector-row').children[0].textContent).toBe(VECTORS.size.toString());
    expect(screen.getByTestId('vector-row').children[0].textContent).toBe(VECTORS.size.toString());
  });
});
