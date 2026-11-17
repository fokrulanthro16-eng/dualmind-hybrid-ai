export interface PiiRedactionResult {
  redactedText: string;
  shieldedEntities: string[];
  diffs: Array<{ original: string; token: string; type: string }>;
}

export function redactPii(text: string): PiiRedactionResult {
  let redacted = text;
  const shieldedEntities: string[] = [];
  const diffs: Array<{ original: string; token: string; type: string }> = [];

  let amountIndex = 1;
  let percentIndex = 1;
  let companyIndex = 1;
  let nameIndex = 1;

  // 1. Redact Currency amounts: $185k, $240,000, $2.5M, 180k USD, etc.
  const currencyRegex = /(\$\s?\d+(?:,\d{3})*(?:\.\d+)?\s*(?:k|K|m|M|b|B|million|thousand)?|\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:USD|EUR|GBP|dollars?)\b)/gi;
  redacted = redacted.replace(currencyRegex, (match) => {
    const token = `[AMOUNT_${amountIndex++}]`;
    shieldedEntities.push(match);
    diffs.push({ original: match, token, type: 'Financial' });
    return token;
  });

  // 2. Redact Equity and Percentages: 0.5%, 15% equity, 2.5% stock
  const percentRegex = /(\b\d+(?:\.\d+)?\s*%(?:\s*(?:equity|stock|options|shares|stake))?)/gi;
  redacted = redacted.replace(percentRegex, (match) => {
    const token = `[EQUITY_${percentIndex++}]`;
    shieldedEntities.push(match);
    diffs.push({ original: match, token, type: 'Equity' });
    return token;
  });

  // 3. Redact Known Company / Enterprise Names
  const knownCompanies = [
    'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix',
    'OpenAI', 'Anthropic', 'Stripe', 'Datadog', 'Salesforce', 'Oracle',
    'Uber', 'Lyft', 'Airbnb', 'ByteDance', 'Palantir', 'Snowflake',
    'Acme Corp', 'Apex Global', 'Initech', 'Hooli', 'Pied Piper'
  ];
  for (const company of knownCompanies) {
    const compRegex = new RegExp(`\\b${company}\\b`, 'gi');
    if (compRegex.test(redacted)) {
      const token = `[COMPANY_${companyIndex++}]`;
      redacted = redacted.replace(compRegex, () => {
        shieldedEntities.push(company);
        diffs.push({ original: company, token, type: 'Company' });
        return token;
      });
    }
  }

  // 4. Redact Personal / Recruiter / Executive names with titles or explicit mentions
  const namePatterns = [
    /(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+[A-Z][a-z]+/g,
    /\b(?:John|Sarah|David|Emily|Michael|Jessica|Alex|Jamal|Fokrul|Alice|Bob|Charlie)\b/gi,
  ];

  for (const regex of namePatterns) {
    redacted = redacted.replace(regex, (match) => {
      const token = `[PERSON_${nameIndex++}]`;
      shieldedEntities.push(match);
      diffs.push({ original: match, token, type: 'Identity' });
      return token;
    });
  }

  return {
    redactedText: redacted,
    shieldedEntities,
    diffs,
  };
}
