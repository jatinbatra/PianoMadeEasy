/** A YouTube link for a song: the explicit one if given, else a search that
 *  always resolves to tutorials/recordings (never a dead video). */
export function youtubeLink(song: { title: string; youtube?: string }): string {
  if (song.youtube && /^https?:\/\//.test(song.youtube)) return song.youtube;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' piano tutorial')}`;
}
