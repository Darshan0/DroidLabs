function HeroDevice() {
  return (
    <div className="hero-device" aria-hidden="true">
      <div className="hero-screen">
        <div className="reading-scene">
          <div className="android-robot reading">
            <span className="antenna left" />
            <span className="antenna right" />
            <span className="robot-head">
              <i />
              <i />
            </span>
            <span className="robot-body">
              <b />
              <b />
            </span>
          </div>
          <div className="book">
            <span className="page left-page">
              <i />
              <i />
              <i />
            </span>
            <span className="page right-page">
              <i />
              <i />
              <i />
            </span>
            <span className="turning-page">
              <i />
              <i />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroDevice;
