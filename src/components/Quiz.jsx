import { useState } from 'react';

function Quiz({ question, options, answer, explanation }) {
  const [selected, setSelected] = useState(null);
  const hasAnswered = selected !== null;

  return (
    <section className="quiz-card">
      <strong>Check your model</strong>
      <p>{question}</p>
      <div className="quiz-options">
        {options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === answer;
          const stateClass = hasAnswered && isSelected ? (isCorrect ? 'correct' : 'wrong') : '';

          return (
            <button
              type="button"
              key={option}
              className={stateClass}
              onClick={() => setSelected(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {hasAnswered && (
        <div className="quiz-result">
          <span>{selected === answer ? 'Correct' : `Not quite. Answer: ${answer}`}</span>
          <p>{explanation}</p>
        </div>
      )}
    </section>
  );
}

export default Quiz;
