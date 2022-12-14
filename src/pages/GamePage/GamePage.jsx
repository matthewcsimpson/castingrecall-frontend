// Components
import SiteNav from "../../components/SiteNav/SiteNav";
import GuessForm from "../../components/GuessForm/GuessForm";
import Movie from "../../components/Movie/Movie";
import Counter from "../../components/Counter/Counter";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import YouWon from "../../components/YouWon/YouWon";
import YouLost from "../../components/YouLost/YouLost";

// Libraries
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function GamePage({ puzzleList }) {
  // Data
  const REACT_APP_TMDB_KEY = process.env.REACT_APP_TMDB_KEY;
  const REACT_APP_TMDB_GENRE_DETAILS = process.env.REACT_APP_TMDB_GENRE_DETAILS;
  const REACT_APP_API_REMOTE_URL = process.env.REACT_APP_API_REMOTE_URL;

  let { puzzleId } = useParams();
  const [genreData, setGenreData] = useState(null);
  const [puzzleData, setPuzzleData] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [youLost, setYouLost] = useState(false);
  const [youWon, setYouWon] = useState(false);

  let maxGuesses = 10;

  // ------------------------------------------------------------------------functions/data loading

  /**
   * Function to retrieve genre information from TMDB
   */
  const getGenres = async () => {
    await axios
      .get(
        `${REACT_APP_TMDB_GENRE_DETAILS}?api_key=${REACT_APP_TMDB_KEY}&language=en-US`
      )
      .then((res) => setGenreData(res.data.genres))
      .catch((err) => console.error(err));
  };

  /**
   * Function to retrieve a specific puzzle.
   * @param {*} id
   */
  const getSpecificPuzzle = async (id) => {
    await axios
      .get(`${REACT_APP_API_REMOTE_URL}/puzzle/${id}`)
      .then((res) => {
        setPuzzleData(res.data);
      })
      .catch((err) => console.error(err));
  };

  /**
   * Receive a movie object from the guess form and process it.
   * @param {object} movie
   */
  const handleSubmitGuess = (movie) => {
    if (puzzleData.puzzle) {
      let goodGuess = puzzleData.puzzle.find((puzzleMovie) =>
        puzzleMovie.id === movie.id ? true : false
      );
      if (goodGuess) {
        goodGuess = { ...goodGuess, ...{ correct: true } };
        setGuesses([...guesses, goodGuess]);
      } else {
        let badGuess = { ...movie, ...{ correct: false } };
        setGuesses([...guesses, badGuess]);
      }
      setLocalDetails();
    }
  };

  /**
   * Write all the puzzle data in state to local storage.
   */
  const setLocalDetails = () => {
    if (puzzleData && guesses) {
      const pId = puzzleData.puzzleId;
      const puzzle = {
        id: pId,
        guesses: guesses,
        youWon: youWon,
        youLost: youLost,
      };
      localStorage.setItem(pId, JSON.stringify(puzzle));
    }
  };

  /**
   * Retrieve guess data stored in localStorage, if any
   */
  const getLocalGuesses = () => {
    if (puzzleData) {
      let local = JSON.parse(localStorage.getItem(puzzleData.puzzleId));
      if (local) {
        if (puzzleData.puzzleId === parseInt(local.id)) {
          setGuesses(local.guesses);
          setYouWon(local.youWon);
          setYouLost(local.youLost);
        } else {
          setGuesses([]);
        }
      }
    }
  };

  // ------------------------------------------------------------------------useEffects
  /**
   * Get the genre list on page load.
   */
  useEffect(() => {
    getGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * On Page Load
   * Get the specific puzzle if there is a puzzleId, otherwise get the latest puzzle
   */
  useEffect(() => {
    if (puzzleId) {
      getSpecificPuzzle(puzzleId);
    } else {
      getSpecificPuzzle("latest");
    }
    getLocalGuesses();
    setLocalDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * On puzzleId changing, load puzzle details.
   * If there is a puzzleId, get that that puzzle.
   * If there is no puzzleId, set the id to "latest", which will load the latest puzzle.
   */
  useEffect(() => {
    if (puzzleId) {
      getSpecificPuzzle(puzzleId);
    } else {
      getSpecificPuzzle("latest");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId]);

  /**
   * Update the win/lose conditions based on the guesses
   */
  useEffect(() => {
    let correctCounter = guesses.filter((guess) => guess.correct === true);

    if (correctCounter.length === 6) {
      setYouWon(true);
      setLocalDetails();
    } else if (guesses.length === maxGuesses) {
      setYouLost(true);
      setLocalDetails();
    } else if (guesses.length > 0) {
      setLocalDetails();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses, youWon, youLost]);

  /**
   *  Set details stored in state to localStorage, and then clear, when the puzzleId changes
   */
  useEffect(() => {
    setLocalDetails();
    setGuesses([]);
    setYouWon(false);
    setYouLost(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleId]);

  /**
   * Load local details
   */
  useEffect(() => {
    getLocalGuesses();
    setLocalDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleData]);

  return (
    <>
      {puzzleList ? (
        <SiteNav puzzleId={puzzleId} puzzleList={puzzleList} />
      ) : (
        <LoadingScreen />
      )}
      <YouWon guesses={guesses} youWon={youWon} />
      <YouLost guesses={guesses} youLost={youLost} />
      {puzzleData ? (
        <>
          <GuessForm
            puzzleId={puzzleId}
            puzzleData={puzzleData}
            guessNum={guesses.length}
            maxGuesses={maxGuesses}
            youWon={youWon}
            youLost={youLost}
            handleSubmitGuess={(movie) => handleSubmitGuess(movie)}
          />
          <Counter guesses={guesses} />
        </>
      ) : null}

      <div className="movie">
        {puzzleData && genreData ? (
          puzzleData.puzzle.map((movie, i) => (
            <Movie
              key={`${i}-${movie.id}`}
              puzzleId={puzzleData.puzzleId}
              movie={movie}
              genres={genreData}
              guesses={guesses}
              youWon={youWon}
              youLost={youLost}
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
