export default function SceneLines() {
  return (
    <>
      <svg
        id="svgLineTop"
        className="line-svg-h"
        viewBox="0 0 1280 2"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="1"
          x2="1280"
          y2="1"
          stroke="var(--line-color)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <svg
        id="svgLineBottom"
        className="line-svg-h"
        viewBox="0 0 1280 2"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="1"
          x2="1280"
          y2="1"
          stroke="var(--line-color)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <svg
        id="svgLineCenter"
        className="line-svg-h"
        viewBox="0 0 491 2"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="1"
          x2="491"
          y2="1"
          stroke="var(--line-color)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div id="svgLineLeftWrap" className="line-svg-v-wrap">
        <svg
          width="2"
          height="100%"
          viewBox="0 0 2 861"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '2px', height: '100%' }}
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="861"
            stroke="var(--line-color)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div id="svgLineRightWrap" className="line-svg-v-wrap">
        <svg
          width="2"
          height="100%"
          viewBox="0 0 2 861"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '2px', height: '100%' }}
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="861"
            stroke="var(--line-color)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </>
  );
}
