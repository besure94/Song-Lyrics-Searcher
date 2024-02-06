import PartsOfSpeech from './PartsOfSpeech.js';
import ThesaurusAPI from './ThesaurusAPI.js';

export default class Synonymizer {
  static async synonymize(response) {
    let lyrics = response.lyrics;
    lyrics = lyrics.replaceAll('\n', ' \n ');
    const lyricsArray = lyrics.split(' ');
    const filteredLyrics = await PartsOfSpeech.filterAsArray(lyrics);
    const synonymizedLyrics = [];
    let skip = 0;
    const synonymMap = new Map();
    for (const word of lyricsArray) {
      if (skip === 1) {
        synonymizedLyrics.push(word);
        if (!word.endsWith(']')) {
          continue;
        }
        else {
          skip = 0;
          continue;
        }
      }
      else if (word.startsWith('[') && word.endsWith(']')) {
        synonymizedLyrics.push(word);
        continue;
      }
      else if (word.startsWith('[')) {
        synonymizedLyrics.push(word);
        skip = 1;
        continue;
      }
      for (let index = 0; index < filteredLyrics.length; index++) {
        const element = filteredLyrics[index];
        if (word.toLowerCase() === element.toLowerCase()) {
          if (synonymMap.has(word)) {
            let synonym = synonymMap.get(word);
            if (word.charAt(0) === word.charAt(0).toUpperCase()) {
              synonym = synonym.slice(0, 1).toUpperCase() + synonym.slice(1, synonym.length);
            }
            synonymizedLyrics.push(synonym);
            break;
          }
          else {
            const synonyms = await ThesaurusAPI.get(word);
            synonymMap.set(word, synonyms.synonyms[0]);
            let synonym = synonyms.synonyms[0];
            if (word.charAt(0) === word.charAt(0).toUpperCase()) {
              synonym = synonym.slice(0, 1).toUpperCase() + synonym.slice(1, synonym.length);
            }
            synonymizedLyrics.push(synonym);
            break;
          }
        }
        else if (word.toLowerCase() != element.toLowerCase() && index === filteredLyrics.length - 1)
        {
          synonymizedLyrics.push(word);
        }
      }
    }
    return synonymizedLyrics.join(' ').replaceAll(' ,', ',').replaceAll(' \n ', '\n');
  }
}