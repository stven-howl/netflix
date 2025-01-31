const API_KEY = "c92a65583e3852c051522a59c0cdabb5";
const BASE_PATH = "https://api.themoviedb.org/3";

export interface IMovie {
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
  id: number;
}

export interface IMoviesResult {
  dates: {
    maximum: string;
    minimum: string;
    page: number;
  };
  results: IMovie[];
  total_pages: number;
  total_results: number;
}

export function getMovies() {
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}
