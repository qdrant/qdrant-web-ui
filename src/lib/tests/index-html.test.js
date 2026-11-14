import { readFileSync } from 'fs';
import { describe, expect, it, vi } from 'vitest';

const indexHtml = readFileSync('index.html', 'utf-8');
const redirectScript = new Function('location', 'history', indexHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);

const redirect = (href) => {
  const { pathname, search, hash } = new URL(href);
  const history = { replaceState: vi.fn() };
  redirectScript({ pathname, search, hash }, history);
  return history.replaceState.mock.calls.map(([, , url]) => new URL(url, href).href);
};

describe('index.html', () => {
  it('should add a trailing slash to the dashboard path', () => {
    expect(redirect('http://host/dashboard')).toEqual(['http://host/dashboard/']);
    expect(redirect('http://host/qdrant/dashboard')).toEqual(['http://host/qdrant/dashboard/']);
  });

  it('should keep the query and hash', () => {
    expect(redirect('http://host/dashboard?a=1#/collections/test')).toEqual([
      'http://host/dashboard/?a=1#/collections/test',
    ]);
  });

  it('should stay on the same origin', () => {
    expect(redirect('http://host//dashboard')).toEqual(['http://host//dashboard/']);
    expect(redirect('http://host/a:b')).toEqual(['http://host/a:b/']);
  });

  it('should not change a path that ends with a slash or index.html', () => {
    expect(redirect('http://host/')).toEqual([]);
    expect(redirect('http://host/dashboard/')).toEqual([]);
    expect(redirect('http://host/dashboard/index.html')).toEqual([]);
  });
});
