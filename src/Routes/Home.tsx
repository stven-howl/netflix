import { useQuery } from "react-query";
import { getMovies } from "../api";
import { IMoviesResult } from "../api";
import styled from "styled-components";
import { makeImagePath } from "../utils";
import { motion, AnimatePresence, useScroll } from "motion/react";
import { ElementType, useState } from "react";
import { PathMatch, useMatch, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const Wrapper = styled.div`
  background-color: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-position: center center;
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 45px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 18px;
  width: 70%;
`;

const Slider = styled.div`
  position: relative;
  top: -400px;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  height: 2em;
  color: red;
  font-size: 48px;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 12px;
    color: ${(props) => props.theme.white.lighter};
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 50vw;
  height: 50vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  background-color: ${(props) => props.theme.black.lighter};
  border-radius: 15px;
  overflow: hidden;
`;

const BigCover = styled.div`
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center center;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  font-size: 24px;
  position: relative;
  padding: 10px;
  top: -50px;
`;

const BigOverview = styled.p`
  color: ${(props) => props.theme.white.lighter};
  font-weight: 300;
  padding: 10px;
  top: -40px;
`;

const rowVars = {
  hidden: {
    x: window.outerWidth - 73,
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -window.outerWidth + 73,
  },
};

const boxVars = {
  normal: {
    scale: 1,
    transition: {
      type: "tween",
    },
  },
  hover: {
    y: -30,
    scale: 1.3,
    transition: {
      delay: 0.5,
      duration: 0.3,
      transition: {
        type: "tween",
      },
    },
  },
};

const InfoVars = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.3,
      transition: {
        type: "tween",
      },
    },
  },
};

const offset = 4;

const AnimatePresenceFixed = AnimatePresence as ElementType;

interface IForm {
  keyword: string;
}

function Home() {
  const navigate = useNavigate();
  const movieMatch: PathMatch<string> | null = useMatch("/movies/:movieId");
  const { scrollY } = useScroll();
  const { data, isLoading } = useQuery<IMoviesResult>(
    ["movies", "nowPlaying"],
    getMovies
  );
  const [index, setIndex] = useState(0);
  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = data.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const [leaving, setLeaving] = useState(false);
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };
  const onOverlayClick = () => navigate(`/`);
  const clickedMovie =
    movieMatch?.params.movieId &&
    data?.results.find((movie) => movie.id === +movieMatch?.params.movieId!);
  const { register, handleSubmit } = useForm<IForm>();
  return (
    <Wrapper>
      {isLoading ? (
        <Loader></Loader>
      ) : (
        <>
          <Banner
            onClick={increaseIndex}
            bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
          >
            <Title>{data?.results[0].title}</Title>
            <Overview>{data?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <AnimatePresenceFixed
              initial={false}
              onExitComplete={toggleLeaving}
            >
              <Row
                variants={rowVars}
                key={index}
                initial="hidden"
                animate="visible"
                transition={{ type: "tween", duration: 0.7 }}
                exit="exit"
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      key={movie.id}
                      onClick={() => onBoxClicked(movie.id)}
                      variants={boxVars}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                      whileHover="hover"
                      initial="normal"
                    >
                      <Info variants={InfoVars}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresenceFixed>
          </Slider>
          <AnimatePresenceFixed>
            {movieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 200 }}
                  layoutId={movieMatch.params.movieId}
                >
                  <BigCover
                    style={{
                      backgroundImage:
                        clickedMovie && clickedMovie.backdrop_path
                          ? `linear-gradient(to top, black, transparent), url(${makeImagePath(
                              clickedMovie.backdrop_path,
                              "w500"
                            )})`
                          : "none",
                    }}
                  />
                  <BigTitle>
                    {clickedMovie && clickedMovie.title
                      ? clickedMovie.title
                      : "no title available"}
                  </BigTitle>
                  <BigOverview>
                    {clickedMovie && clickedMovie.overview
                      ? clickedMovie.overview
                      : "no overview available"}
                  </BigOverview>
                </BigMovie>
              </>
            ) : null}
          </AnimatePresenceFixed>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
