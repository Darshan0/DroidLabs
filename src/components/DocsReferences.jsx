function DocsReferences({ links }) {
  return (
    <section className="docs-references">
      <strong>Android docs references</strong>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default DocsReferences;
