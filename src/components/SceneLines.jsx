export default function SceneLines() {
  return (
    <>
      <div id="svgLineTop" className="line-svg-h line-brush-h" />
      <div id="svgLineBottom" className="line-svg-h line-brush-h" />
      <div id="svgLineCenter" className="line-svg-h line-brush-h" />

      <div id="svgLineLeftWrap" className="line-svg-v-wrap">
        <div className="line-brush-v" />
      </div>

      <div id="svgLineRightWrap" className="line-svg-v-wrap">
        <div className="line-brush-v" />
      </div>
    </>
  );
}
