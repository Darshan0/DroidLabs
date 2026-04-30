function LabCue({ postId, cue, children }) {
  const playCue = () => {
    window.dispatchEvent(new CustomEvent('droidlab:cue', { detail: { postId, cue } }));
  };

  return (
    <button type="button" className="lab-cue" onClick={playCue}>
      {children}
    </button>
  );
}

export default LabCue;
