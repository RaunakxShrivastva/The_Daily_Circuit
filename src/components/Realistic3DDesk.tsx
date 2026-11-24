import { useState, useEffect } from "react";
import { Newspaper, OpeningSequence } from "./Newspaper";
import { StoryReader } from "./StoryReader";
import { fetchLiveEdition, type LiveEditionData } from "../lib/api";
import type { Story } from "../data/types";
import "../styles/newsprint.css";
import "../styles/pages.css";

export function Realistic3DDesk() {
  const [opened, setOpened] = useState(false);
  const [readingStory, setReadingStory] = useState<Story | null>(null);
  const [liveData, setLiveData] = useState<LiveEditionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchLiveEdition()
      .then((data) => {
        if (active) {
          setLiveData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="room" style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      {!opened && <OpeningSequence onDone={() => setOpened(true)} />}

      <Newspaper
        onOpen={(story) => setReadingStory(story)}
        liveData={liveData}
        loading={loading}
      />

      {readingStory && (
        <StoryReader
          story={readingStory}
          onClose={() => setReadingStory(null)}
        />
      )}
    </div>
  );
}
