function CodeBlock({ code, language = 'kotlin' }) {
  return (
    <figure className="code-block">
      <figcaption>{language}</figcaption>
      <pre>
        <code>{code.trim()}</code>
      </pre>
    </figure>
  );
}

export default CodeBlock;
