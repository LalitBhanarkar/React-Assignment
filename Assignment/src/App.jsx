import { useState, useEffect } from "react";
import "./App.css";

const Card = ({ image, onLoad }) => (
  <div className="card">
    <img src={image.url} alt="Cat" onLoad={onLoad} />
  </div>
);

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [view, setView] = useState("grid"); // State to toggle between views
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // Function to fetch data
  const fetchData = async (page = 1, resetData = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.thecatapi.com/v1/images/search?limit=5&page=${page}&order=Desc`
      );
      const result = await res.json();

      // If no more results, stop fetching
      if (result.length === 0) {
        setHasMore(false);
      }

      if (resetData) {
        setData(result); // Reset data when changing views
      } else {
        setData((prevData) => [...prevData, ...result]); // Append new data for infinite scroll
      }
      setImagesLoaded(0); // Reset the loaded image counter
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial render or when page changes (for pagination)
  useEffect(() => {
    if (view === "grid") {
      fetchData(page, true);
    }
  }, [page, view]);

  // Infinite Scroll: Fetch more data when user scrolls to the bottom in List View
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 10 &&
        view === "list" &&
        hasMore &&
        !loading &&
        imagesLoaded === data.length // Only fetch more if all images are loaded
      ) {
        fetchData(page + 1);
        setPage((prevPage) => prevPage + 1); // Increase the page count for the next fetch
      }
    };

    if (view === "list") {
      window.addEventListener("scroll", handleScroll);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [view, hasMore, loading, imagesLoaded, data.length, page]);

  // Count loaded images and ensure that all are loaded before fetching more
  const handleImageLoad = () => {
    setImagesLoaded((prevCount) => prevCount + 1);
  };

  return (
    <div className="app-container">
      <h1>Cat Image Gallery</h1>

      {/* Tabs for switching views */}
      <div className="tabs">
        <button
          className={view === "grid" ? "active" : ""}
          onClick={() => {
            setView("grid");
            setPage(1); // Reset page when switching views
            setData([]); // Clear data when switching views
            setHasMore(true); // Reset hasMore flag for pagination
          }}
        >
          Grid View
        </button>
        <button
          className={view === "list" ? "active" : ""}
          onClick={() => {
            setView("list");
            setPage(1); // Reset page when switching views
            setData([]); // Clear data when switching views
            setHasMore(true); // Reset hasMore flag for infinite scroll
          }}
        >
          List View
        </button>
      </div>

      {/* Loading state */}
      {loading && <p>Loading...</p>}

      {/* Error state */}
      {error && <p>{error}</p>}

      {/* Render cards */}
      <div className={view === "grid" ? "grid" : "list"}>
        {data.map((item, index) => (
          <Card key={index} image={item} onLoad={handleImageLoad} />
        ))}
      </div>

      {/* Pagination controls, visible only in Grid View */}
      {view === "grid" && (
        <div className="pagination">
          <button
            disabled={page === 1 || loading}
            onClick={() => {
              setPage((prevPage) => prevPage - 1);
              setData([]); // Reset data for new fetch
            }}
          >
            Previous
          </button>
          <button
            disabled={!hasMore || loading}
            onClick={() => {
              setPage((prevPage) => prevPage + 1);
              setData([]); // Reset data for new fetch
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Loading Indicator at the bottom for Infinite Scroll */}
      {view === "list" && loading && (
        <div className="bottom-loading">Loading more...</div>
      )}
    </div>
  );
};

export default App;
