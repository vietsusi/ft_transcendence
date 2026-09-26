import {
  abortable,
  validateParagraph,
  renderParagraph,
} from './chat.generation';
import type { AnswerContext } from './chat.generation';
import { demoIntent } from './chat.logic';
import { chatError } from './chat.controller';
const movie = {
  id: 7,
  title: 'Catalog film',
  description: 'Stored facts',
  releaseYear: 2020,
  type: 'MOVIE',
  averageRating: 7,
  ratingIsMock: true,
  posterUrl: null,
  sourceUrl: null,
  genres: [{ name: 'Comedy' }],
};
const context: AnswerContext = {
  movies: [movie],
  intent: demoIntent('recommend comedy', [movie]),
  question: 'Recommend comedy',
};
describe('paragraph output boundary', () => {
  it('renders only validated database titles', () => {
    const p = validateParagraph(
      { text: 'Try {{movie:7}}.', movieIds: [7] },
      context,
    );
    expect(renderParagraph(p, context)).toBe('Try Catalog film.');
  });
  it.each([
    { text: 'Try {{movie:999}}.', movieIds: [999] },
    { text: 'Try {{movie:7}}.', movieIds: [] },
    { text: 'Try comedy.', movieIds: [7] },
    { text: 'Try {{movie:7}}.', movieIds: [7, 7] },
    { text: 'Try {{movie:7', movieIds: [] },
    { text: 'https://evil.example', movieIds: [] },
    { text: '[click](/movies/999)', movieIds: [] },
    { text: '<img src=x>', movieIds: [] },
    { text: '', movieIds: [] },
    { text: 'x'.repeat(801), movieIds: [] },
  ])('rejects malformed, unsafe or fabricated references %#', (p) => {
    expect(() => validateParagraph(p, context)).toThrow('CONTENT_REJECTED');
  });
  it('cannot refer to films in an empty result', () => {
    expect(() =>
      validateParagraph(
        { text: '{{movie:7}}', movieIds: [7] },
        { ...context, movies: [] },
      ),
    ).toThrow();
  });
  it('interrupts a stalled operation without waiting for its adapter', async () => {
    const abort = new AbortController();
    const result = abortable(new Promise(() => {}), abort.signal);
    abort.abort(new Error('cancelled'));
    await expect(result).rejects.toThrow('cancelled');
  });
  it('sanitizes provider diagnostics and distinguishes 429/timeout', () => {
    expect(chatError(new Error('secret-key'), false)).not.toContain(
      'secret-key',
    );
    expect(chatError({ statusCode: 429 }, false)).toMatch(
      /^PROVIDER_RATE_LIMIT/,
    );
    expect(chatError({}, true)).toMatch(/^TIMEOUT/);
  });
});

describe('literal-title regression', () => {
  it.each([
    '没有找到《星际番茄大战2099》。',
    '没有找到星 际 番 茄 大 战２０９９。',
  ])(
    'rejects echoed missing names even if a verifier would approve: %s',
    (text) => {
      expect(() =>
        validateParagraph(
          { text, movieIds: [] },
          { ...context, movies: [], forbiddenTitles: ['星际番茄大战2099'] },
        ),
      ).toThrow('CONTENT_REJECTED');
    },
  );
  it('rejects raw catalog names; only ID placeholders are allowed', () => {
    expect(() =>
      validateParagraph(
        { text: 'Try Catalog film.', movieIds: [] },
        { ...context, forbiddenTitles: ['Catalog film'] },
      ),
    ).toThrow('CONTENT_REJECTED');
    expect(() =>
      validateParagraph(
        { text: 'Try {{movie:7}}.', movieIds: [7] },
        { ...context, forbiddenTitles: ['Catalog film'] },
      ),
    ).not.toThrow();
  });
});

it('does not mistake title substrings for complete English words', () => {
  expect(() =>
    validateParagraph(
      { text: 'Support other genres.', movieIds: [] },
      { ...context, forbiddenTitles: ['Up', 'Her'] },
    ),
  ).not.toThrow();
});
