// Styles
import "./GamePage.scss";

// Data
import API from "../../data/api_info.json";

// Components
import SiteNav from "../../components/SiteNav/SiteNav";
import Hero from "../../components/Hero/Hero";
import Movie from "../../components/Movie/Movie";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";

// Libraries
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function GamePage() {
  const [puzzleData, setPuzzleData] = useState(null);
  const [genreData, setGenreData] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [correctGuesses, setCorrectGuesses] = useState([]);
  const [puzzleList, setPuzzleList] = useState(null);
  const { puzzleId } = useParams();

  const getPuzzleList = async () => {
    await axios
      .get(`${API.api_local_url}/puzzle/list`)
      .then((res) => setPuzzleList([res.data].flat()))
      .catch((e) => console.error(e));
  };

  /**
   * Handle incoming guesses and write them to local storage.
   * @param {*} guesses
   */
  const handleGuesses = (guesses) => {
    setGuesses(guesses);
    const pId = puzzleData.puzzleId;
    const puzzle = {
      id: pId,
      guesses: guesses,
    };
    localStorage.setItem("castingrecall", JSON.stringify(puzzle));
  };

  /**
   * Function to retrieve genre information from TMDB
   */
  const getGenres = async () => {
    await axios
      .get(`${API.api_genre_details}?api_key=${API.api_key}&language=en-US`)
      .then((res) => setGenreData(res.data.genres))
      .catch((e) => console.error(e));
  };

  /**
   * Function to retrieve the the most recently generated puzzle.
   */
  const getLatestPuzzle = async () => {
    await axios
      .get(`${API.api_local_url}/puzzle/`)
      .then((res) => {
        setPuzzleData(res.data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const getSpecificPuzzle = async (id) => {
    await axios
      .get(`${API.api_local_url}/puzzle/${id}`)
      .then((res) => setPuzzleData(res.data))
      .catch((e) => console.error(e));
  };

  /**
   * Retrieve guess data stored in localStorage, if any
   * @param {object} puzzleData
   */
  const getLocalGuesses = async (puzzleData) => {
    const localGuesses = JSON.parse(localStorage.getItem("castingrecall"));
    if (localGuesses && puzzleData) {
      if (puzzleData.puzzleId === localGuesses.id) {
        setGuesses(localGuesses.guesses);
      }
    }
  };

  /**
   * useEffect to load genre details from TMDB.
   */
  useEffect(() => {
    getPuzzleList();
    getGenres();
    if (puzzleId) {
      getSpecificPuzzle(puzzleId);
    } else {
      getLatestPuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (puzzleId) {
      getSpecificPuzzle(puzzleId);
    } else {
      getLatestPuzzle();
    }
  }, [puzzleId]);

  /**
   * useEffect to load guesses from localStorage
   */
  useEffect(() => {
    getLocalGuesses(puzzleData);
  }, [puzzleData]);

  useEffect(() => {
    // console.log(correctGuesses);
  }, [correctGuesses]);

  return (
    <>
      <SiteNav puzzleId={puzzleId} puzzleList={puzzleList} />
      {puzzleData ? (
        <Hero
          puzzle={puzzleData.puzzle}
          guesses={guesses}
          setGuesses={handleGuesses}
          correctGuesses={correctGuesses}
        />
      ) : null}
      <div className="movie">
        {puzzleData && genreData ? (
          puzzleData.puzzle.map((movie) => (
            <Movie
              key={movie.id}
              movie={movie}
              genres={genreData}
              guesses={guesses}
              correctGuesses={correctGuesses}
              setCorrectGuesses={setCorrectGuesses}
            />
          ))
        ) : (
          <LoadingScreen />
        )}
      </div>
    </>
  );
}

export default GamePage;
