// Styles
import "./Hero.scss";

// Components & Data
import API from "../../data/api_info.json";

// Libraries
import { useEffect, useState } from "react";
import axios from "axios";

function Hero() {
  const [titleQuery, setTitleQuery] = useState([]);
  const [searchTitles, setSearchTitles] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [guesses, setGuesses] = useState([]);
  const [tempGuess, setTempGuess] = useState(null);

  /**
   * Handle the incoming input and use the specified callback function
   * @param {event} e
   * @param {function} setFunc
   */
  const handleStateChange = (e, setFunc) => {
    setFunc(e.target.value);
  };

  /**
   * Handle when one of the auto-complete items is clicked on.
   * @param {event} e
   */
  const handleListItemClick = (e) => {
    setTempGuess(e.target.innerHTML);
    setSearchTitles([]);
  };

  /**
   * Handle when the form is submitted / guess is made
   * @param {event} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (titleQuery.length !== 0) {
      axios
        .get(
          `${API.api_search_url}&api_key=${API.api_key}&query=${e.target.search_term.value}`
        )
        .then((res) => {
          setGuesses([...guesses, res.data.results[0]]);
        })
        .catch((err) => console.error(err));
    } else {
      alert("you need to enter something!");
    }
  };

  /**
   * useEffect to load auto-complete options as you type in the inpur field.
   */
  useEffect(() => {
    if (titleQuery.length !== 0) {
      axios
        .get(`${API.api_search_url}&api_key=${API.api_key}&query=${titleQuery}`)
        .then((res) => {
          setSearchTitles(res.data.results);
          // console.log(res.data.results.length);
        })
        .catch((err) => console.error(err));
    }
  }, [titleQuery]);

  return (
    <div className="hero">
      <div className="hero__wrapper">
        <div className="hero__guesses">
          <div className="hero__moviecard"></div>
        </div>
        <form className="hero__guessform" onSubmit={handleSubmit}>
          <div className="hero__searchbox">
            <input
              name="search_term"
              value={tempGuess ? tempGuess : undefined}
              className="hero__guessinput"
              type="text"
              placeholder="Type a movie title..."
              onFocus={() => setTempGuess("")}
              onChange={(e) => {
                if (e.target.value) {
                  handleStateChange(e, setTitleQuery);
                } else {
                  setSearchTitles([]);
                }
              }}
            />
            <ul className="hero__searchsuggestions">
              {searchTitles.length
                ? searchTitles.map((title) => {
                    return (
                      <li
                        onClick={handleListItemClick}
                        key={title.id}
                        name={title}
                        className="hero__suggestion"
                      >
                        {title.original_title}
                      </li>
                    );
                  })
                : null}
            </ul>
          </div>
          <div className="hero__buttonbox">
            <button className="hero__guessbutton">Guess!</button>
          </div>
        </form>
        <div className="hero__guesslist">
          <ul>
            {guesses
              ? guesses.map((guess) => {
                  return (
                    <li key={guess.id} className="hero__guess">
                      {guess.original_title}
                    </li>
                  );
                })
              : ""}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Hero;
